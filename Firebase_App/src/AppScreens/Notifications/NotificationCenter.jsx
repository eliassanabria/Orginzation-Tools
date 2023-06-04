import { useState, useEffect } from "react";
import { AuthState } from "../../authentication/login/AuthState";
import { useNavigate } from 'react-router-dom';
import './NotificationCenterStyles.css'
import { Badge, Card, Button } from 'react-bootstrap';

export const NotificationCenter = (props) => {
    const navigate = useNavigate();
    const authState = props.Authenticated;
    const AuthenticationURL = `/api/notifications`;
    const [notificationList, setNotificationsList] = useState([]);

    useEffect(() => {
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
              setNotificationsList(data);

              if (navigator.setAppBadge) {
                navigator.setAppBadge(notificationList.length);
              }
            } catch (error) {
              console.error('There was a problem fetching the notifications:', error);
            }
          };
      
          fetchNotifications();
      }, [authState]);

    const handleNotificationClick = (deeplink) => {
        navigate(deeplink);
    };

    const dismissNotification = async (notificationId) => {
        try {
          const response = await fetch(`/api/notifications/${notificationId}/delete`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
      
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const updatedNotifications = notificationList.filter(
            (notification) => notification.id !== notificationId
          );
          setNotificationsList(updatedNotifications);

          if (navigator.setAppBadge) {
            navigator.setAppBadge(updatedNotifications.length);
          }
        } catch (error) {
          console.error('Error dismissing notification:', error);
        }
      };
      const [ticker, setTicker] = useState(new Date());
      useEffect(() => {
        const timer = setInterval(() => {
            setTicker(new Date());
        }, 1000);
    
        return () => clearInterval(timer);
    }, []);
    const getTimeAgo = (firebaseTimestamp) => {
        const datePosted = new Date(firebaseTimestamp._seconds * 1000 + firebaseTimestamp._nanoseconds / 1000000);
        const now = new Date();
        const diffInSeconds = Math.floor((now - datePosted) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
    
        if (diffInDays > 30) {
            return datePosted.toLocaleDateString();
        } else if (diffInDays > 1) {
            return `${diffInDays} days ago`;
        } else if (diffInDays === 1) {
            return `Yesterday at ${datePosted.toLocaleTimeString()}`;
        } else if (diffInHours >= 1) {
            return `${diffInHours} hours ago`;
        } else if (diffInMinutes >= 1) {
            return `${diffInMinutes} minutes ago`;
        } else {
            return `${diffInSeconds} seconds ago`;
        }
    }
    
    if(notificationList.length === 0){
        return(<div>
            <h1>Notifications:</h1>
            <h2>You have no new notifications.</h2>
            <div style={{alignItems:'center'}}>
            <Button style={{display:'flex'}} className="btn btn-primary" onClick={()=>{window.history.back()}}>Go Back</Button>
            </div>
        </div>)
    }
    
    return (
        <div className="notification-center-page">
            <h1>Notifications: {notificationList.length > 0 && (<Badge style={{ backgroundColor: 'yellow', marginRight: '25px' }}>
    {notificationList.length}
</Badge>)}</h1>
            <div >
                
                {notificationList.map((notification) => (
                    <Card key={notification.id} className="notification-center-item" style={{ width: '100%' }}>
                    <Card.Body
                        className="notification-content"
                        onClick={() => handleNotificationClick(notification.deeplink)}
                    >
                        <Card.Title className="notification-title">{notification.title} <small>{getTimeAgo(notification.timestamp)}</small></Card.Title>
                        <Card.Text >{notification.body}</Card.Text>
                    </Card.Body>
                    <Button
                        class="btn btn-secondary"
                        onClick={() => dismissNotification(notification.id)}
                    >
                        Dismiss
                    </Button>
                </Card>
                ))}
            </div>
        </div>
    );
}
