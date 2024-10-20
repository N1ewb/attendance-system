// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import {getStorage} from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNjh-zpyCxzB4s_PUDn2WSYJdA9FKRuoA",
  authDomain: "iot-middleware-43a34.firebaseapp.com",
  databaseURL: "https://iot-middleware-43a34-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iot-middleware-43a34",
  storageBucket: "iot-middleware-43a34.appspot.com",
  messagingSenderId: "1084368660266",
  appId: "1:1084368660266:web:d7c88f5ff8846d68d16053"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)