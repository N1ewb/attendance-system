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

        console.log("Class created successfully!");
      } else {
        console.error("User is not authenticated.");
      }
    } catch (error) {
      console.error("Error in making new class:", error.message);
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

        const storageRef = ref(storage, `images/${studentID}.png`);
        await uploadBytes(storageRef, imgFile);
        const imageUrl = await getDownloadURL(storageRef);

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

        console.log("Student added successfully!");
      } else {
        throw new Error("User is not authenticated.");
      }
    } catch (error) {
      console.error("Error in adding student:", error);
    }
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
    subscribetoClassesChanges,
    subscribetoStudentChanges,
  };

  return <dbContext.Provider value={value}>{children}</dbContext.Provider>;
};
