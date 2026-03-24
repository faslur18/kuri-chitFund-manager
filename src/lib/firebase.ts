import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOftlT0nuxykA5MDZ5Npn-4s-4deouSkM",
  authDomain: "kuri-ee0b6.firebaseapp.com",
  projectId: "kuri-ee0b6",
  storageBucket: "kuri-ee0b6.firebasestorage.app",
  messagingSenderId: "748775086767",
  appId: "1:748775086767:web:40618885f783b8b0b5525a",
  measurementId: "G-BZNP5678S2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);

export { db, analytics };
