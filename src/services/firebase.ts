import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3LwFdcVQGZHQzgHUXlc8vn1wC2mqFZB4",
  authDomain: "gtss-defb5.firebaseapp.com",
  projectId: "gtss-defb5",
  storageBucket: "gtss-defb5.firebasestorage.app",
  messagingSenderId: "1014456574639",
  appId: "1:1014456574639:web:911e1afad1fe5e57256a5a",
  measurementId: "G-WBSF2K5C84"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
