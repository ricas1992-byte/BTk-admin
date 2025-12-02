import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                     firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }
} else {
  console.log("Firebase not configured - running in local-only mode. Add your Firebase config to enable cloud sync.");
}

export { db, isConfigured };
