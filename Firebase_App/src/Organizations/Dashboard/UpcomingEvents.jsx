import React, { useState, useEffect } from 'react';
import { Card, Spinner } from 'react-bootstrap';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('https://api.example.com/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEvents = () => {
    if (loading) {
      return (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (events.length === 0) {
      return (
        <Card>
          <Card.Body>
            <Card.Title>No Upcoming Events</Card.Title>
            <Card.Text>
              There are currently no upcoming events.
            </Card.Text>
            <Card.Text>This feature will be available later in 2023</Card.Text>
          </Card.Body>
        </Card>
      );
    }

    return events.map((event) => (
      <Card key={event.id} className="mb-3">
        <Card.Body>
          <Card.Title>{event.title}</Card.Title>
          <Card.Text>{event.description}</Card.Text>
        </Card.Body>
      </Card>
    ));
  };

  return <>{renderEvents()}</>;
};

export default UpcomingEvents;
