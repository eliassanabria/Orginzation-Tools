import React from 'react';
import { Card } from 'react-bootstrap';

const MemberCard = ({ member }) => {
  return (
    <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src={member.avatarUrl} />
      <Card.Body>
        <Card.Title>{member.name}</Card.Title>
        <Card.Text>{member.role}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default MemberCard;
