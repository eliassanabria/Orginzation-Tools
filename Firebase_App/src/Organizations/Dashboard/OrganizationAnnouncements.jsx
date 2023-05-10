import React, { useState, useEffect } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import moment from 'moment';
import AnnouncementCard from './AnnouncementCard';

const OrganizationAnnouncements = (props) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const groupID = props.groupID;
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      // Replace this URL with your API endpoint
      const response = await fetch(`/api/groups/${groupID}/announcements/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setAnnouncements((announcements) => {
  //       return announcements.filter((announcement) => moment().isBefore(moment.unix(announcement.expires)));
  //     });
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  const renderAnnouncements = () => {
    if (loading) {
      return (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (announcements.length === 0) {
      return (
        <Card>
          <Card.Body>
            <Card.Title>No Announcements</Card.Title>
            <Card.Text>
              There are currently no announcements.
            </Card.Text>
          </Card.Body>
        </Card>
      );
    }
    const formatTimeRemaining = (seconds) => {
      const duration = moment.duration(seconds, 'seconds');
      const days = Math.floor(duration.days());
      const hours = Math.floor(duration.hours());
      const minutes = Math.floor(duration.minutes());
      const remainingSeconds = Math.floor(duration.seconds());
    
      const daysText = days > 0 ? `${days} days ` : '';
      const hoursText = hours > 0 ? `${hours} hours ` : '';
      const minutesText = minutes > 0 ? `${minutes} minutes ` : '';
      const secondsText = `${remainingSeconds} seconds`;
    
      return `${daysText}${hoursText}${minutesText}${secondsText}`;
    };
    
    
    
    
    return announcements.map((announcement) => {
      // const createdDate = moment.unix(announcement.date_created._seconds).isValid()
      //   ? moment.unix(announcement.date_created._seconds).local().format('YYYY-MM-DD HH:mm:ss')
      //   : 'Invalid Date';
      //   const ExpDate = moment.unix(announcement.expires._seconds).isValid()
      //   ? moment.unix(announcement.expires._seconds).local().format('YYYY-MM-DD HH:mm:ss')
      //   : 'Invalid Date';
      // const expiresDate = moment.unix(announcement.expires._seconds).local();
      // const timeRemaining = expiresDate.isValid() ? expiresDate.diff(moment().utc(), 'seconds') : 'Invalid';
  
      return (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      );
      
    }
    
    );
    
    
    
  };

  return <>{renderAnnouncements()}</>;
};

export default OrganizationAnnouncements;