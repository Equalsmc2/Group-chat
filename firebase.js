/* Shared Firebase instance for chat and the music library. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAsOosEU05SX5MU-mxEQ5FvhFeJvTjQaQ8",
    authDomain: "group-chat-e19f8.firebaseapp.com",
    projectId: "group-chat-e19f8",
    storageBucket: "group-chat-e19f8.firebasestorage.app",
    messagingSenderId: "1085864086659",
    appId: "1:1085864086659:web:de378f1efe80bc9a0b1fb6",
    measurementId: "G-93G3VWHRY4"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
