// ==========================================
// WORKSHEET 6 - FIREBASE & NODE.JS PRODUCER
// ==========================================

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Path to the service account key
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// Check if the service account key file exists
if (!fs.existsSync(serviceAccountPath)) {
    console.error('========================================================================');
    console.error('ERROR: serviceAccountKey.json not found in nodejs-app/ directory!');
    console.error('Please follow these steps from Worksheet 6:');
    console.error('1. Go to Firebase Console (https://console.firebase.google.com).');
    console.error('2. Open Project Settings > Service Accounts.');
    console.error('3. Click "Generate new private key".');
    console.error('4. Save the downloaded JSON file as:');
    console.error('   06-Firebase-NodeJS/nodejs-app/serviceAccountKey.json');
    console.error('========================================================================');
    process.exit(1);
}

// 1. Load service account JSON
const serviceAccount = require(serviceAccountPath);

// 2. Initialize Firebase Admin SDK
const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://cad-2191162-default-rtdb.europe-west1.firebasedatabase.app";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
});

// 3. Get database and reference to the "messages" node
const db = admin.database();
const messagesRef = db.ref('messages');

// ==========================================
// CHALLENGE C - ARRAYS AND MESSAGE GENERATION
// ==========================================

// Sentences array
const sentences = [
    "A new request was received.",
    "System temperature is within normal range.",
    "Ceiling lights were toggled.",
    "Warning: High memory utilization detected.",
    "Ambient music started playing in Living Room.",
    "Outdoor weather update received: 21.09 °C.",
    "Kitchen window was opened.",
    "Security check: all doors and windows secured."
];

// Alert types array (must be one of: success, warning, danger, primary)
const types = ["success", "warning", "danger", "primary"];

/**
 * Returns a random element from an array
 */
function getRandomElement(arr) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}

/**
 * Generates and pushes a message object to Firebase
 * Structure: { text: string, type: "success"|"warning"|"danger"|"primary" }
 */
function pushMessage() {
    const message = {
        text: getRandomElement(sentences),
        type: getRandomElement(types),
        timestamp: Date.now()
    };

    messagesRef.push(message)
        .then((ref) => {
            console.log(`[${new Date().toLocaleTimeString()}] Sent [${message.type}]: "${message.text}" (Key: ${ref.key})`);
        })
        .catch((error) => {
            console.error('Error writing message to Firebase:', error.message);
        });
}

// ==========================================
// EXECUTION: CHALLENGE A + CHALLENGE C
// ==========================================
console.log('Connecting to Firebase Realtime Database at:', databaseURL);

// Challenge A: Write one fixed message to confirm setup
const initialFixedMessage = {
    text: "Producer initialized. Real-time feed is active.",
    type: "success",
    timestamp: Date.now()
};

messagesRef.push(initialFixedMessage)
    .then((ref) => {
        console.log(`[Challenge A] Initial message written successfully with key: ${ref.key}`);
        console.log('[Challenge C] Starting automated message generation every 5 seconds (5000ms)...');
        console.log('Press Ctrl+C to stop.\n');

        // Challenge C: Automate message generation every 5000ms
        setInterval(pushMessage, 5000);
    })
    .catch((error) => {
        console.error('[Challenge A] Failed to write initial message:', error);
        console.error('Please check:');
        console.error('1. Database URL matches your Firebase Realtime Database URL.');
        console.error('2. Realtime Database rules allow writing (or service account has admin privileges).');
    });
