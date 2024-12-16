import cv2 
import pickle
import face_recognition
import numpy as np
import cvzone
from firebase.firebase import db, storage_bucket, firestore_client
from firebase.db import add_attendance_session
from firebase.storage import get_all_images_from_storage
from datetime import datetime
from flask_socketio import SocketIO
import eventlet
import base64
import json
import re

def encode_image_to_base64(img):
    _, buffer = cv2.imencode('.jpg', img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return img_base64

encodeListKnown = []
studentIds = []
present_students = []
students_dict = {}
streaming = False

def setup_streaming(socketio: SocketIO):
    print('Main is Running')

    @socketio.on('connect')
    def handle_connect():
        print('Client Connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client Disconnected')

    @socketio.on('load_student_data')
    def handle_load_student_data(user_id, class_id):
        global students_dict
        students_data = get_student(user_id, class_id)
        students_dict = {student.get('studentID'): student for student in students_data}  

    @socketio.on('load_images')
    def handle_load_images():
        global encodeListKnown
        global studentIds

        try:
            encodeListKnown, studentIds = get_all_images_from_storage()
            if isinstance(encodeListKnown, list) and isinstance(studentIds, list):
                print(f"Loaded {len(encodeListKnown)} encodings and {len(studentIds)} student IDs.")
            else:
                print("Failed to load images: Invalid data structure returned.")

        except Exception as e:
            print(f"Error in handle_load_images: {str(e)}")
    
    def start_stream():
        cap = cv2.VideoCapture(0)   
        cap.set(3, 640)
        cap.set(4, 480)
        
        print("Starting video stream...")
        if not encodeListKnown or not studentIds:
            print("No encodings loaded. Exiting stream...")
            cap.release()
            return

        modes = ['active', 'info', 'marked', 'alreadyMarked']
        print("Loading Encoded Files")
        
        # with open('EncodeFile.p', 'rb') as file:
        #     encodeListKnown, studentIds = pickle.load(file)
        # print(f"Encoded Files Loaded Successfully: {encodeListKnown}")

        print("Loaded students data")
        print(f"Students Dictionary: {students_dict}")

        modeType = 0
        counter = 0
        frame_count = 0
        global streaming

        try:
            print("Stream has Started")
            while streaming:
                success, img = cap.read()
                if not success:
                    print("Failed to capture frame. Exiting...")
                    socketio.emit('stop_stream')
                    streaming = False
                    break

                imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
                imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)
                faceCurrentFrame = face_recognition.face_locations(imgS)
                encodeCurrentFrame = face_recognition.face_encodings(imgS, faceCurrentFrame)

                # Check if a face is detected and handle matching
                if faceCurrentFrame:
                    for encodeFace, faceLocation in zip(encodeCurrentFrame, faceCurrentFrame):
                        matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
                        faceDistance = face_recognition.face_distance(encodeListKnown, encodeFace)
                        matchIndex = np.argmin(faceDistance)

                        if matches[matchIndex]:
                            id = studentIds[matchIndex]
                            studentInfo = students_dict.get(id) 
                            print("Matching ID Detected")
                            print(f"ID: {id}, Student Info: {studentInfo}") 
                            
                            if studentInfo not in present_students and studentInfo is not None: 
                                present_students_serialized = serialize_student_info(studentInfo)
                                socketio.emit('students_data', {"data": json.dumps(present_students_serialized)})
                                print(f"New student marked present: {studentInfo.get('firstName', 'Unknown')} {studentInfo.get('lastName', 'Unknown')}")
                            
                            counter += 1
                            if counter >= 20:
                                counter = 0
                                

                # Send frames as base64
                img_base64 = encode_image_to_base64(img)
                socketio.emit('video_data', {'data': img_base64})
                
                
                frame_count += 1
                if frame_count % 60 == 0:
                    print(f'Emitted frame {frame_count}')

                socketio.sleep(0.03)
        finally:
            cap.release()
            print("Released video capture.")

    

    @socketio.on("request_students_data")
    def handle_request_students_data(data):
        """Re-emit students data upon client request."""
        classid = data.get("classid")
        print(f"Received request to resend student data for class: {classid}")

        students_data_serialized = [
            serialize_student_info(student) for student in present_students
        ]
        emit("students_data", {"data": json.dumps(students_data_serialized)})

    @socketio.on('start_stream')
    def handle_start_stream(data):
        global streaming, class_id, user_id
        print("Received start_stream event")
        class_id = data.get('classid')
        user_id = data.get('userID')
        if not streaming:
            print("Starting a new stream")
            streaming = True
            eventlet.spawn(start_stream)
        else:
            print("Stream is already running")

    @socketio.on('stop_stream')
    def handle_stop_stream():
        global streaming
        print("Received stop_stream event")
        streaming = False

   

def get_student(user_id, class_id):
    print("\n=== Starting Student Retrieval ===")
    print(f"User ID: {user_id}")
    print(f"Class ID: {class_id}")
    
    try:
        # 1. First verify the user exists
        userDocRef = firestore_client.collection('Users').document(user_id)
        user_doc = userDocRef.get()
        if not user_doc.exists:
            print(f"ERROR: User document {user_id} does not exist")
            return []

        # 2. Verify the class exists for this user
        classDocRef = userDocRef.collection('Classes').document(class_id)
        class_doc = classDocRef.get()
        if not class_doc.exists:
            print(f"ERROR: Class document {class_id} does not exist for user {user_id}")
            return []

        # 3. Get students with error handling and detailed logging
        studentCollectionRef = classDocRef.collection('Students')
        try:
            students = studentCollectionRef.stream()
            students_data = []
            student_count = 0
            
            for student in students:
                student_count += 1
                student_data = student.to_dict()
                student_data['id'] = student.id
                students_data.append(student_data)
                print(f"Found student: {student.id}")
                
            print(f"\n=== Student Retrieval Summary ===")
            print(f"Total students found: {student_count}")
            print(f"Collection path: users/{user_id}/Classes/{class_id}/Students")
            
            if student_count == 0:
                print("\nPossible issues to check:")
                print("1. Verify the Students collection exists")
                print("2. Check if the collection is empty")
                print("3. Verify security rules allow read access")
                print("4. Confirm the data structure in Firestore console")
            
            return students_data

        except Exception as e:
            print(f"ERROR querying students: {str(e)}")
            return []

    except Exception as e:
        print(f"ERROR in get_student: {str(e)}")
        return []

# Helper function to validate Firestore path
def verify_firestore_path(user_id, class_id):
    print("\n=== Verifying Firestore Path ===")
    
    try:
        # Check user document
        user_ref = firestore_client.collection('users').document(user_id)
        user = user_ref.get()
        print(f"User document exists: {user.exists}")
        
        if user.exists:
            # Check class document
            class_ref = user_ref.collection('Classes').document(class_id)
            class_doc = class_ref.get()
            print(f"Class document exists: {class_doc.exists}")
            
            if class_doc.exists:
                # Check students collection
                students_ref = class_ref.collection('Students')
                students = students_ref.limit(1).stream()
                has_students = False
                for _ in students:
                    has_students = True
                    break
                print(f"Students collection has documents: {has_students}")
                
                return {
                    'user_exists': True,
                    'class_exists': True,
                    'has_students': has_students
                }
        
        return {
            'user_exists': user.exists,
            'class_exists': False,
            'has_students': False
        }

    except Exception as e:
        print(f"Error verifying path: {str(e)}")
        return None

def serialize_student_info(student_info):
    serialized_info = student_info.copy()
    
    if isinstance(serialized_info.get('createdAt'), datetime):
        serialized_info['createdAt'] = serialized_info['createdAt'].isoformat()
    
    if isinstance(serialized_info.get('last_attendance_time'), datetime):
        serialized_info['last_attendance_time'] = serialized_info['last_attendance_time'].isoformat()
    
    return serialized_info
