import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, firestore } from "../firebase";
import { collection, doc, setDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const usersCollectionRef = collection(firestore, "Users");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false); // Set loading to false after checking auth state
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  async function Login(email, password) {
    if (currentUser) {
      alert("User is already logged in.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const uid = auth.currentUser.uid;
      const userDocRef = doc(usersCollectionRef, uid);

      await updateDoc(userDocRef, {
        isOnline: true,
      });

      alert("Logged in successfully!");
    } catch (error) {
      console.error("Error occurred during login:", error);
      alert("Login failed: " + (error.message || "An unexpected error occurred."));
    }
  }

  async function CreateUser(email, password, confirmPassword, firstName, lastName) {
    if (currentUser) {
      alert("A user is already logged in.");
      return;
    }

    if (password.length < 7) {
      alert("Password should be longer than 7 characters");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      const userData = {
        userID: user.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
      };
      await setDoc(doc(usersCollectionRef, user.uid), userData);

      alert("Registration successful!");
      setCurrentUser(userData);
      return user;
    } catch (error) {
      console.error("Error in signing up:", error);
      alert("Sign-up failed: " + (error.message || "An unexpected error occurred."));
    }
  }

  async function Logout() {
    if (!currentUser) {
      alert("No user is currently logged in.");
      return;
    }

    try {
      const uid = auth.currentUser.uid;
      const usersDocRef = doc(usersCollectionRef, uid);
      await updateDoc(usersDocRef, {
        isOnline: false,
      });

      await signOut(auth);
      setCurrentUser(null); // Clear current user on logout
      alert("Logged out successfully!");
    } catch (error) {
      console.error("Error in logging out:", error);
      alert("Logout failed: " + (error.message || "An unexpected error occurred."));
    }
  }

  const value = {
    currentUser,
    loading,
    Login,
    Logout,
    CreateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
