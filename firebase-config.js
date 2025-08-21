import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyBQDGxwup9ljhPn0pEYJv7m10M00vA_mPg",
    authDomain: "ftsdu03-mu03-bw-iii.firebaseapp.com",
    projectId: "ftsdu03-mu03-bw-iii",
    storageBucket: "ftsdu03-mu03-bw-iii.firebasestorage.app",
    messagingSenderId: "282039607302",
    appId: "1:282039607302:web:602d9428d2afea66f0e387",
    measurementId: "G-F7FXB0XR0C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
