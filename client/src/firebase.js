// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-da8cd.firebaseapp.com",
  projectId: "mern-blog-da8cd",
  storageBucket: "mern-blog-da8cd.firebasestorage.app",
  messagingSenderId: "960714456945",
  appId: "1:960714456945:web:ebf3c1261bfa79aad1c0d0"
};

// Initialize Firebase
 export const app = initializeApp(firebaseConfig);