import React, { useState, useEffect } from 'react';
import { Card, Spinner } from 'react-bootstrap';

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('https://api.example.com/assignments');
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAssignments = () => {
    if (loading) {
      return (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (assignments.length === 0) {
      return (
        <Card>
          <Card.Body>
            <Card.Title>No Assignments</Card.Title>
            <Card.Text>
              You have no pending assignments.
            </Card.Text>
          </Card.Body>
        </Card>
      );
    }

    return assignments.map((assignment) => (
      <Card key={assignment.id} className="mb-3">
        <Card.Body>
          <Card.Title>{assignment.title}</Card.Title>
          <Card.Text>{assignment.description}</Card.Text>
        </Card.Body>
      </Card>
    ));
  };

  return <>{renderAssignments()}</>;
};

export default MyAssignments;
