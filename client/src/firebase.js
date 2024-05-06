// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-843bd.firebaseapp.com",
  projectId: "mern-estate-843bd",
  storageBucket: "mern-estate-843bd.appspot.com",
  messagingSenderId: "669024329276",
  appId: "1:669024329276:web:a91efc9c308cc47e46ad39"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);