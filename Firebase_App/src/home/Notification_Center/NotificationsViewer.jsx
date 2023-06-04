import { useState, useEffect } from "react";
import { AuthState } from "../../authentication/login/AuthState";
import { useNavigate } from 'react-router-dom';
import './NotificationCenterStyles.css'
import { Badge } from 'react-bootstrap';

export const NotificationCenterPopup = (props) => {
    const navigate = useNavigate();
    const authState = props.Authenticated;
    const mobileNavClose = props.mobileNavClose;
    const AuthenticationURL = `/api/notifications`;
    const [showNotificationCenter, setNotificationDrawer] = useState(false);

   
    const [notificationList, setNotificationsList] = useState([]);
    const handleNotificationDropDownClick = ()=>{
        if(notificationList.length > 0){
            setNotificationDrawer(!showNotificationCenter);
        }
        else{
            setNotificationDrawer(false);
        }
    }
    useEffect(() => {
        //if (authState === AuthState.Authenticated) {
          //call API for Notifications for the user logged in.
      console.log('LOLksjdhfkswjhfrkajsdhfkajsdhf')
          const fetchNotifications = async () => {
            try {
              const response = await fetch(AuthenticationURL, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
      
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
      
              const data = await response.json();
              // Assuming the response data has a property 'notifications' that contains the array of notifications
              setNotificationsList(data);
              // Set badge count using the Badging API
              if (navigator.setAppBadge) {
                navigator.setAppBadge(notificationList.length);
              }
            } catch (error) {
              console.error('There was a problem fetching the notifications:', error);
            }
          };
      
          fetchNotifications();
        //}
      }, [authState]);
      
      

    const handleNotificationClick = (deeplink) => {
        setNotificationDrawer(false);
        if(mobileNavClose){
            mobileNavClose();
        }
        navigate(deeplink);
    };

    const dismissNotification = async (notificationId) => {
        try {
          // Make the actual API call to remove the notification
          const response = await fetch(`/api/notifications/${notificationId}/delete`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
      
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
      
          // After successful API call, remove the notification from the local state
          const updatedNotifications = notificationList.filter(
            (notification) => notification.id !== notificationId
          );
          setNotificationsList(updatedNotifications);
      
          if (updatedNotifications.length === 0) {
            setNotificationDrawer(false);
          }
      
          // Decrement the badge count using the Badging API
          if (navigator.setAppBadge) {
            navigator.setAppBadge(updatedNotifications.length);
          }
        } catch (error) {
          console.error('Error dismissing notification:', error);
        }
      };
      


    return (
        <div className="notification-dropdown">
            <i className="fas fa-bell fa-lg" style={{ color: 'white' }} onClick={handleNotificationDropDownClick}>
                {notificationList.length > 0 && (<Badge
                style={{ backgroundColor: 'red', marginRight: '25px' }}>
                {notificationList.length}
              </Badge>)}</i><a href='/notifications'>Notifications</a>
            {showNotificationCenter &&(
            <div className="notification-center">
                {notificationList.map((notification) => (
                    <div key={notification.id} className="notification-item">
                        <div
                            className="notification-content"
                            onClick={() => handleNotificationClick(notification.deeplink)}
                        >
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-body">{notification.body}</div>
                        </div>
                        <button
                            className="dismiss-btn"
                            onClick={() => dismissNotification(notification.id)}
                        >
                            Dismiss
                        </button>
                    </div>
                ))}
            </div>)}
        </div>
    );
}