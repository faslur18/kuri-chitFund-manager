import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOftlT0nuxykA5MDZ5Npn-4s-4deouSkM",
  authDomain: "kuri-ee0b6.firebaseapp.com",
  projectId: "kuri-ee0b6",
  storageBucket: "kuri-ee0b6.firebasestorage.app",
  messagingSenderId: "748775086767",
  appId: "1:748775086767:web:40618885f783b8b0b5525a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
