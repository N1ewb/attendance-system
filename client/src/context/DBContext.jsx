import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { createContext, useContext } from "react";
import { firestore, storage } from "../firebase";
import { useAuth } from "./authContenxt";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const dbContext = createContext();

export function useDB() {
  return useContext(dbContext);
}

export const DBProvider = ({ children }) => {
  const auth = useAuth();
  const usersCollectionRef = collection(firestore, "Users");

  const MakeClass = async (subjectcode, offernumber, description, units) => {
    try {
      if (auth.currentUser) {
        const userDocRef = doc(usersCollectionRef, auth.currentUser.uid);
        const classCollectionRef = collection(userDocRef, "Classes");
        await addDoc(classCollectionRef, {
          SubjectCode: subjectcode,
          OfferNumber: offernumber,
          Description: description,
          Units: units,
          createdAt: serverTimestamp(),
        });

        return { message: "Class added succesfully" };
      } else {
        return { message: "User is not authenticated" };
      }
    } catch (error) {
      return { message: `Error in making class ${error.message}` };
    }
  };

  const getClassInfo = async (id) => {
    try {
      if (auth.currentUser) {
        const userDocRef = doc(usersCollectionRef, auth.currentUser.uid);
        const classDocRef = doc(userDocRef, "Classes", id);

        const classDoc = await getDoc(classDocRef);
        if (classDoc.exists()) {
          return classDoc.data();
        } else {
          console.warn("Class not found with the provided ID.");
          return null;
        }
      } else {
        console.error("User is not authenticated.");
        return null;
      }
    } catch (error) {
      console.error("Error in class info:", error.message);
      return null;
    }
  };

  const AddStudent = async (
    id,
    firstName,
    lastName,
    email,
    studentID,
    imgFile
  ) => {
    try {
      if (auth.currentUser) {
        const userDocRef = doc(usersCollectionRef, auth.currentUser.uid);
        const classCollectionRef = collection(userDocRef, "Classes");
  
        if (!id) {
          throw new Error("Class ID is required.");
        }
  
        const classDocRef = doc(classCollectionRef, id);
        const studentCollectionRef = collection(classDocRef, "Students");
  
        // Adjusted storage path to store images under the correct directory structure
        const storagePath = `users/${auth.currentUser.uid}/Classes/${id}/Students/${studentID}.jpg`;
        const storageRef = ref(storage, storagePath);
  
        try {
          // Check if the file already exists at the specified path
          await getDownloadURL(storageRef);
          console.log("File already exists. Upload canceled.");
          return;
        } catch (error) {
          if (error.code !== "storage/object-not-found") {
            console.error("Error checking file existence:", error);
            return;
          }
        }
  
        // Upload image to the storage
        await uploadBytes(storageRef, imgFile);
        const imageUrl = await getDownloadURL(storageRef);
  
        // Add student document to Firestore
        await addDoc(studentCollectionRef, {
          firstName,
          lastName,
          email,
          studentID,
          total_attendance: 0,
          department: "College of Computer Studies",
          course: "BSIT",
          createdAt: serverTimestamp(),
          last_attendance_time: new Date().toISOString(),
          studentImage: imageUrl,
        });
  
        return { message: "Successfully added student", status: 'success' };
      } else {
        return { message: "User is not authenticated", status: 'failed' };
      }
    } catch (error) {
      return { message: `Error in adding student: ${error.message}`, status: 'failed' };
    }
  };
  

  const RecordAttendance = async (classID, session, studentData) => {
    try {
      if (!auth.currentUser) {
        throw new Error("User is not authenticated.");
      }

      if (!classID) {
        throw new Error("Class ID is required.");
      }

      const userDocRef = doc(firestore, "Users", auth.currentUser.uid);
      const classDocRef = doc(userDocRef, "Classes", classID);
      const attendanceCollectionRef = collection(classDocRef, "Attendance");

      const dateToday = new Date().toISOString().split("T")[0];

      const presentStudents = [];

      for (const student of studentData) {
        const { firstName, lastName, email, studentID, imgFile } = student;

        const storageRef = ref(storage, `images/${studentID}.png`);
        await uploadBytes(storageRef, imgFile);
        const imageUrl = await getDownloadURL(storageRef);

        presentStudents.push({
          firstName,
          lastName,
          email,
          studentID,
          studentImage: imageUrl,
          last_attendance_time: new Date().toISOString(),
        });
      }

      await addDoc(attendanceCollectionRef, {
        session,
        dateToday,
        present_students: presentStudents,
        createdAt: serverTimestamp(),
      });

      console.log("Attendance recorded successfully!");
    } catch (error) {
      console.error("Error in recording attendance:", error);
    }
  };

  const subscribetoAttendanceChanges = async (id, callback) => {
    try {
      if (auth.currentUser) {
        const userDocRef = doc(usersCollectionRef, auth.currentUser.uid);
        const classCollectionRef = collection(userDocRef, "Classes");
        const classDocRef = doc(classCollectionRef, id);
        const attendanceCollectionRef = collection(classDocRef, "Attendance");

        const unsubscribe = onSnapshot(attendanceCollectionRef, (snapshot) => {
          const attendanceData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(attendanceData);
        });
        return unsubscribe;
      }
    } catch (error) {}
  };

  const subscribetoStudentChanges = async (id, callback) => {
    try {
      if (auth.currentUser) {
        const userDocRef = doc(usersCollectionRef, auth.currentUser.uid);
        const classCollectionRef = collection(userDocRef, "Classes");
        const classDocRef = doc(classCollectionRef, id);
        const studentColletionRef = collection(classDocRef, "Students");

        const unsubscribe = onSnapshot(studentColletionRef, (snapshot) => {
          const studentsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(studentsData);
        });
        return unsubscribe;
      }
    } catch (error) {
      console.log("Error in subscribing to student changes");
    }
  };

  const subscribetoClassesChanges = async (callback) => {
    try {
      if (auth.currentUser) {
        const userDocRef = doc(usersCollectionRef, auth.currentUser.uid);
        const classCollectionRef = collection(userDocRef, "Classes");
        const unsubscribe = onSnapshot(classCollectionRef, (snapshot) => {
          const classData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(classData);
        });
        return unsubscribe;
      }
    } catch (error) {
      console.log("Error in adjusting to class changes");
    }
  };

  const value = {
    MakeClass,
    getClassInfo,
    AddStudent,
    RecordAttendance,
    subscribetoAttendanceChanges,
    subscribetoClassesChanges,
    subscribetoStudentChanges,
  };

  return <dbContext.Provider value={value}>{children}</dbContext.Provider>;
};
