import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";
import firebaseConfig from "./firebaseConfig";

export async function initializePushNotifications() {
    const badgeCounter = 0;
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
            //TODO: Check if it is iOS, if it is, then return the key, or else throw exception

            return getToken(messaging, { vapidKey });
          throw new Error(`Notification permission was ${permission}`);
        }
      })
      .then((token) => {
        console.log("FCM Token: ", token);
        //document.getElementById('FCMTOK').innerHTML = token;
        // Send the FCM token to your server to store and use later for sending notifications
        const subscribeResponse =  fetch(`/api/notifications/push/token/store/${token}`,{
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
      // Perform actions based on the message received
      if(navigator.setAppBadge){
        ++badgeCounter;
        navigator.setAppBadge(234567);
      }
    });
  } else {
    console.log("Firebase Messaging is not supported in this browser.");
    // Show a message to the user or handle the unsupported browser case as needed
  }
}
//Topics include: `General-App`, `Messages`, `Group-Alerts`, `Tasks`, `Reminders`, and `Sub-Group:OBJECTID()`
async function registerCoreTopic(topic){
    const subscribeResponse = await fetch(`/api/notifications/push/subscribe/${topic}`,{
        method: 'post',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
    });
    return subscribeResponse;
}

async function removeCoreTopic(topic){
    const unSubscribeResponse = await fetch(`/api/notifications/push/unsubscribe/${topic}`,{
        method: 'post',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
    });
    return unSubscribeResponse;
}
//These calls are for adding or removing to the ignore notification calls. So a user can silence 
async function registerGroupTopic(topic, groupType, groupID){
    const subscribeResponse = await fetch(`/api/notifications/push/subscribe/${topic}/groups`,{
        method: 'post',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body:JSON.stringify({
            groupType: groupType,
            groupID: groupID
          })
    });
    return subscribeResponse;
}

async function removeGroupTopic(topic, groupType, groupID){
    const unSubscribeResponse = await fetch(`/api/notifications/push/unsubscribe/${topic}/groups`,{
        method: 'post',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body:JSON.stringify({
            groupType: groupType,
            groupID: groupID
          })
    });
    return unSubscribeResponse;
}