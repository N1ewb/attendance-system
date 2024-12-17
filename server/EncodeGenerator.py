import cv2
import face_recognition_models
import face_recognition
import pickle
import os
from firebase.storage import upload_file_to_storage

#Import student's images
folderPath = 'images'
pathList = os.listdir(folderPath)
imgList = []
studentIds = []
for path in pathList:

    image_path = os.path.join(folderPath, path)

    imgList.append(cv2.imread(os.path.join(folderPath, path)))
    studentIds.append(path.split('.')[0])

    # upload_file_to_storage(image_path, path)
    

def findEncodings(imagesList):
    encodeList = []
    for img in imagesList:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_recognition.face_encodings(img)[0]
        encodeList.append(encode)

    return encodeList
print("Encoding images")
encodeListKnown = findEncodings(imgList)
encodeListKnownWithIds = [encodeListKnown, studentIds]
print("Encode Complete")

file = open("EncodeFile.p",'wb')
pickle.dump(encodeListKnownWithIds, file)
file.close()
print("File Saved")