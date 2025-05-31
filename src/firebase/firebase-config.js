// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyCkBtbS54Z1r5yCg_iU7okTSMygqWItZD4",
    authDomain: "shunye-90b28.firebaseapp.com",
    projectId: "shunye-90b28",
    storageBucket: "shunye-90b28.appspot.com",
    messagingSenderId: "214744636774",
    appId: "1:214744636774:web:844e0a41adac9f00f8fca7",
    measurementId: "G-2EH3N0CDSK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };