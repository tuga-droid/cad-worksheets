// ==========================================
// WORKSHEET 6 - LISTEN FOR NEW MESSAGES (WEB SDK)
// ==========================================
import { database } from "./firebase.js";
import { ref, onChildAdded } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Container element for messages
const messagesContainer = document.getElementById("messages");
const statusBadge = document.getElementById("connection-status");

// Supported alert types
const VALID_TYPES = ["success", "warning", "danger", "primary"];

try {
    // 1. Create a reference to messages node
    const messagesRef = ref(database, "messages");

    if (statusBadge) {
        statusBadge.textContent = "Listening for messages...";
        statusBadge.className = "badge bg-success";
    }

    // 2. Register onChildAdded listener (runs for existing messages and whenever a new child is added)
    onChildAdded(
        messagesRef,
        (snapshot) => {
            const message = snapshot.val();
            if (!message || typeof message !== "object") return;

            const text = message.text || "";
            // Validate alert type, default to 'primary' if invalid
            const type = VALID_TYPES.includes(message.type) ? message.type : "primary";

            // 3. Create alert element with classes "alert" and "alert-<type>"
            const alertDiv = document.createElement("div");
            alertDiv.className = `alert alert-${type} shadow-sm`;
            alertDiv.setAttribute("role", "alert");

            // Use textContent to safely insert the message text
            alertDiv.textContent = text;

            // Optional timestamp badge if available
            if (message.timestamp) {
                const timeSpan = document.createElement("small");
                timeSpan.className = "float-end opacity-75";
                timeSpan.textContent = new Date(message.timestamp).toLocaleTimeString();
                alertDiv.appendChild(timeSpan);
            }

            // 4. Append the alert to the messages container
            messagesContainer.appendChild(alertDiv);

            // Automatically scroll to bottom if needed
            alertDiv.scrollIntoView({ behavior: "smooth", block: "end" });
        },
        (error) => {
            // 4. Error callback to report read failures
            console.error("Firebase read failure:", error);
            if (statusBadge) {
                statusBadge.textContent = "Connection Error";
                statusBadge.className = "badge bg-danger";
            }

            const errorAlert = document.createElement("div");
            errorAlert.className = "alert alert-danger";
            errorAlert.textContent = `Error reading messages: ${error.message}. Please check your firebaseConfig credentials and database rules in Firebase Console.`;
            messagesContainer.appendChild(errorAlert);
        }
    );
} catch (err) {
    console.error("Failed to initialize Firebase listener:", err);
    if (statusBadge) {
        statusBadge.textContent = "Configuration Error";
        statusBadge.className = "badge bg-warning text-dark";
    }
}
