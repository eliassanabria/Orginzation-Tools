import React, { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";
import firebaseConfig from "./firebaseConfig"; // Import your firebaseConfig object

const App = () => {
  useEffect(() => {
    // Check if the current browser supports Firebase Messaging
    if ("serviceWorker" in navigator && "PushManager" in window) {
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      // Your VAPID key
      const vapidKey = "BB3Lt2eit9ioqh1FwjDlVC_JKNq7AnKLb5dF2CejHk3QwlbUPsUXy4pd2dxAeARWqEY3yfKS1VPyvMOiYSjqhEo";

      // Request permission for push notifications
      Notification.requestPermission()
        .then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted.");
            return getToken(messaging, { vapidKey });
          } else {
            throw new Error("Notification permission denied.");
          }
        })
        .then((token) => {
          console.log("FCM Token: ", token);
          // Send the FCM token to your server to store and use later for sending notifications
        })
        .catch((error) => {
          console.error("Error requesting permission for notifications:", error);
        });

      // Handle foreground messages
      onMessage(messaging, (payload) => {
        console.log("Message received. ", payload);
        // Perform actions based on the message received
      });
    } else {
      console.log("Firebase Messaging is not supported in this browser.");
      // Show a message to the user or handle the unsupported browser case as needed
    }
  }, []);

  return (
    <div className="App">
      {/* Your app content */}
    </div>
  );
};

export default App;
