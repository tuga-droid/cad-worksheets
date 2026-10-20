// ==========================================
// WORKSHEET 6 - FIREBASE CONFIGURATION (WEB SDK)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASUzq7PsT7ad1SFmRxbvNiZGwPPRLz6Mg",
  authDomain: "cad-2191162.firebaseapp.com",
  databaseURL: "https://cad-2191162-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cad-2191162",
  storageBucket: "cad-2191162.firebasestorage.app",
  messagingSenderId: "207804148660",
  appId: "1:207804148660:web:828b2f401acc176ad4e0e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Realtime Database reference (explicitly passing databaseURL for europe-west1)
export const database = getDatabase(app, firebaseConfig.databaseURL);
export { firebaseConfig };
