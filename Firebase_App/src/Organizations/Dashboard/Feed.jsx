import React, { useState, useEffect } from 'react';
import { Card, Spinner } from 'react-bootstrap';

const Feed = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedItems();
  }, []);

  const fetchFeedItems = async () => {
    try {
      const response = await fetch('https://api.example.com/feed');
      const data = await response.json();
      setFeedItems(data);
    } catch (error) {
      console.error('Error fetching feed items:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFeedItems = () => {
    if (loading) {
      return (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (feedItems.length === 0) {
      return (
        <Card>
          <Card.Body>
            <Card.Title>Nothing has been posted</Card.Title>
            <Card.Text>
              This is a coming soon
            </Card.Text>
          </Card.Body>
        </Card>
      );
    }

    return feedItems.map((item) => (
      <Card key={item.id} className="mb-3">
        <Card.Body>
          <Card.Title>{item.title}</Card.Title>
          <Card.Text>{item.content}</Card.Text>
        </Card.Body>
      </Card>
    ));
  };

  return <>{renderFeedItems()}</>;
};

export default Feed;
