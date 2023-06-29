// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyAh1RZYrG5TXhds5obiQi4oY8DTguP7fJg",
    authDomain: "next-83718-22eac.firebaseapp.com",
    projectId: "next-83718-22eac",
    storageBucket: "next-83718-22eac.appspot.com",
    messagingSenderId: "166726122426",
    appId: "1:166726122426:web:3977383913e60c48077b83",
    measurementId: "G-PDPYNVE5YE"
};

// Initialize Firebase
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default firebase_app;