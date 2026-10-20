// ==========================================
// WORKSHEET 6 - FIREBASE CONFIGURATION (WEB SDK)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

/**
 * Configure your Firebase Web credentials here (from Firebase Console > Project settings > General > Your apps)
 * IMPORTANT: Include your exact databaseURL (Belgium / europe-west1 or us-central1)
 */
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export the Realtime Database reference
export const database = getDatabase(app);
