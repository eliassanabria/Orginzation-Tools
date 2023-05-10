import React, { useState, useEffect } from 'react';
import { Card, Spinner } from 'react-bootstrap';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('https://api.example.com/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAppointments = () => {
    if (loading) {
      return (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <Card>
          <Card.Body>
            <Card.Title>No Appointments</Card.Title>
            <Card.Text>
              You have no upcoming appointments.
            </Card.Text>
            <Card.Text>This will be available September 2023 </Card.Text>
          </Card.Body>
        </Card>
      );
    }

    return appointments.map((appointment) => (
      <Card key={appointment.id} className="mb-3">
        <Card.Body>
          <Card.Title>{appointment.title}</Card.Title>
          <Card.Text>{appointment.details}</Card.Text>
        </Card.Body>
      </Card>
    ));
  };

  return <>{renderAppointments()}</>;
};

export default MyAppointments;
