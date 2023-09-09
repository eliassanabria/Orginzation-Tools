// Import and configure the Firebase SDK
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "",
  authDomain: "orgtools-d05c4.firebaseapp.com",
  projectId: "orgtools-d05c4",
  storageBucket: "orgtools-d05c4.appspot.com",
  messagingSenderId: "",
  appId: "",
  measurementId: "s"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.setBackgroundMessageHandler(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png",
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Optional: Add listeners for notification click events
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked", event);

  // Close the notification
  event.notification.close();

  // Navigate to a specific URL or perform other actions
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
