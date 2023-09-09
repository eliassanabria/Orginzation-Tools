import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";
import firebaseConfig from "./firebaseConfig";
import { Toast } from 'react-bootstrap';
import ReactDOM from 'react-dom';

let badgeCounter = 0;

export async function initializePushNotifications() {
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
          if (isIOS()) {
            return getToken(messaging, { vapidKey });
          } else {
            throw new Error(`Notification permission was ${permission}`);
          }
        }
      })
      .then((token) => {
        console.log("FCM Token: ", token);

        const subscribeResponse = fetch(`/api/notifications/push/token/store/${token}`, {
          method: 'post',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

      })
      .catch((error) => {
        console.error("Error requesting permission for notifications:", error);
      });

    // Handle foreground messages
    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      if (navigator.setAppBadge) {
        badgeCounter++;
        navigator.setAppBadge(badgeCounter);
      }
      const title = payload.notification?.title || 'Notification';
      const body = payload.notification?.body || '';
      // if (Notification.permission === 'granted') {
      //   new Notification(title, {
      //     body: body,
      //     silent: false,
      //     sound: 'default'
      //   });
      // }
      showToast(title, body);
    });
  } else {
    console.log("Firebase Messaging is not supported in this browser.");
  }
}

function isIOS() {
  return !!navigator.userAgent.match(/(iPod|iPhone|iPad)/);
}

// Other functions (registerCoreTopic, removeCoreTopic, registerGroupTopic, removeGroupTopic) remain the same

//Topics include: `General-App`, `Messages`, `Group-Alerts`, `Tasks`, `Reminders`, and `Sub-Group:OBJECTID()`
async function registerCoreTopic(topic) {
  const subscribeResponse = await fetch(`/api/notifications/push/subscribe/${topic}`, {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return subscribeResponse;
}

async function removeCoreTopic(topic) {
  const unSubscribeResponse = await fetch(`/api/notifications/push/unsubscribe/${topic}`, {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return unSubscribeResponse;
}
//These calls are for adding or removing to the ignore notification calls. So a user can silence 
async function registerGroupTopic(topic, groupType, groupID) {
  const subscribeResponse = await fetch(`/api/notifications/push/subscribe/${topic}/groups`, {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      groupType: groupType,
      groupID: groupID
    })
  });
  return subscribeResponse;
}

async function removeGroupTopic(topic, groupType, groupID) {
  const unSubscribeResponse = await fetch(`/api/notifications/push/unsubscribe/${topic}/groups`, {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      groupType: groupType,
      groupID: groupID
    })
  });
  return unSubscribeResponse;
}

const toastContainer = document.createElement('div');
toastContainer.style.position = 'fixed';
toastContainer.style.bottom = '10px';
toastContainer.style.right = '10px';
toastContainer.style.zIndex = '10000';
document.body.appendChild(toastContainer);

function showToast(title, body) {
  const toastWrapper = document.createElement('div');
  toastContainer.appendChild(toastWrapper);

  const handleClose = () => {
    ReactDOM.unmountComponentAtNode(toastWrapper);
    toastWrapper.remove();
  };

  ReactDOM.render(
    <Toast onClose={handleClose} show={true} delay={3000} autohide>
      <Toast.Header>
        <strong className="me-auto">{title}</strong>
        <small className="text-muted">just now</small>
      </Toast.Header>
      <Toast.Body>{body}</Toast.Body>
    </Toast>,
    toastWrapper
  );
}