import React, { useState, useEffect } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import moment from 'moment';
import './AnnouncementCard.css'
const formatTimeRemaining = (seconds) => {
    const duration = moment.duration(seconds, 'seconds');
    const days = Math.floor(duration.days());
    const hours = Math.floor(duration.hours());
    const minutes = Math.floor(duration.minutes());
    const remainingSeconds = Math.floor(duration.seconds());
  
    const daysText = days > 0 ? `${days} days ` : '';
    const hoursText = hours > 0 ? `${hours} hrs ` : '';
    const minutesText = minutes > 0 ? `${minutes} mins ` : '';
    const secondsText = `${remainingSeconds} s`;
  
    return `${daysText}${hoursText}${minutesText}${secondsText}`;
  };
  const relativeTimeSinceCreated = (timestamp) => {
    const now = moment().utc();
    const diffInSeconds = now.diff(timestamp, 'seconds');
    const diffInMinutes = now.diff(timestamp, 'minutes');
    const diffInHours = now.diff(timestamp, 'hours');
    const diffInDays = now.diff(timestamp, 'days');
  
    if (diffInSeconds < 10) {
      return 'just now';
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  };
  
const AnnouncementCard = ({ announcement }) => {
    const [visible, setVisible] = useState(true);

    const [timeRemaining, setTimeRemaining] = useState(0);
    const createdDate = moment.unix(announcement.date_created._seconds).isValid()
  ? relativeTimeSinceCreated(moment.unix(announcement.date_created._seconds).utc())
  : 'Invalid Date';

    const expiresDate = moment.unix(announcement.expires._seconds).utc();
  
    useEffect(() => {
        const updateInterval = setInterval(() => {
          const newTimeRemaining = expiresDate.diff(moment().utc(), 'seconds');
          setTimeRemaining(newTimeRemaining);
      
          if (newTimeRemaining <= 0) {
            setVisible(false);
            clearInterval(updateInterval);
          }
        }, 1000);
      
        return () => clearInterval(updateInterval);
      }, [expiresDate]);
      
  
    return (
      visible && (<Card className={`mb-3 ${timeRemaining <= 1 ? 'fade-out' : ''}`} style={{ position: 'relative' }}>
        <Card.Body>
          <Card.Title>{announcement.title}</Card.Title>
          <Card.Text>{announcement.body}</Card.Text>
        </Card.Body>
        <Card.Footer className="text-muted d-flex justify-content-between" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.125)' }}>
          <div>
            {timeRemaining !== 'Invalid' ? `Expires in: ${formatTimeRemaining(timeRemaining)}` : 'Invalid'}
          </div>
          <div className="text-right">
            {createdDate}
          </div>
        </Card.Footer>
      </Card>)
    );
  };
export default AnnouncementCard