import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Import Realtime Database
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCXMn_UBfWmjBM4AvHTc0axVsYv6-FxaLQ",
  authDomain: "task-manager-najjar.firebaseapp.com",
  projectId: "task-manager-najjar",
  storageBucket: "task-manager-najjar.firebasestorage.app",
  messagingSenderId: "403956343190",
  appId: "1:403956343190:web:88fc5a19e98e4605a93db7",
  measurementId: "G-54KL69H8Z5",
  databaseURL: "https://task-manager-najjar-default-rtdb.firebaseio.com/", // Realtime Database URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app); // Initialize Realtime Database
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Export the app object explicitly
export { app };
