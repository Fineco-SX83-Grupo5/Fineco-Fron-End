// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

// Replace this with your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyAj87TPwooRhhpM1SqIK-ABFD8M31oI4kI",
    authDomain: "recetas-ddede.firebaseapp.com",
    projectId: "recetas-ddede",
    storageBucket: "recetas-ddede.appspot.com",
    messagingSenderId: "42076153246",
    appId: "1:42076153246:web:11d2198b929ec0f7ae628f",
    measurementId: "G-JXJ515S5RK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut };
