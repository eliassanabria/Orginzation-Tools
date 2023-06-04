import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Button, Card } from 'react-bootstrap';

function ChatPage() {
    const [conversations, setConversations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchConversations() {
            try {
              const token = localStorage.getItem('token'); // Get the token from wherever you store it (e.g., local storage)
              const headers = {
                'Authorization': `Bearer ${token}`,
              };
          
              const response = await fetch('/api/my/conversations', {
                headers: headers,
              });
              
              if (!response.ok) {
                throw new Error('Failed to fetch conversations');
              }
          
              const data = await response.json();
              setConversations(data);
            } catch (error) {
              // Handle error
            }
          }
          

        fetchConversations();
    }, []);
    // useEffect(() => {
    //     // Mock API data
    //     const mockData = [
    //         {
    //             id: '1',
    //             name: 'John Doe',
    //             type: 'individual',
    //             lastSeen: '10 minutes ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '2',
    //             name: 'Jane Doe',
    //             type: 'individual',
    //             lastSeen: '5 hours ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '3',
    //             name: 'Study Group',
    //             type: 'group',
    //             onlineCount: '3 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '4',
    //             name: 'Work Project',
    //             type: 'group',
    //             onlineCount: '2 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },{
    //             id: '1',
    //             name: 'John Doe',
    //             type: 'individual',
    //             lastSeen: '10 minutes ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '2',
    //             name: 'Jane Doe',
    //             type: 'individual',
    //             lastSeen: '5 hours ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '3',
    //             name: 'Study Group',
    //             type: 'group',
    //             onlineCount: '3 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '4',
    //             name: 'Work Project',
    //             type: 'group',
    //             onlineCount: '2 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },{
    //             id: '1',
    //             name: 'John Doe',
    //             type: 'individual',
    //             lastSeen: '10 minutes ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '2',
    //             name: 'Jane Doe',
    //             type: 'individual',
    //             lastSeen: '5 hours ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '3',
    //             name: 'Study Group',
    //             type: 'group',
    //             onlineCount: '3 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '4',
    //             name: 'Work Project',
    //             type: 'group',
    //             onlineCount: '2 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },{
    //             id: '1',
    //             name: 'John Doe',
    //             type: 'individual',
    //             lastSeen: '10 minutes ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '2',
    //             name: 'Jane Doe',
    //             type: 'individual',
    //             lastSeen: '5 hours ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '3',
    //             name: 'Study Group',
    //             type: 'group',
    //             onlineCount: '3 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '4',
    //             name: 'Work Project',
    //             type: 'group',
    //             onlineCount: '2 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },{
    //             id: '1',
    //             name: 'John Doe',
    //             type: 'individual',
    //             lastSeen: '10 minutes ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '2',
    //             name: 'Jane Doe',
    //             type: 'individual',
    //             lastSeen: '5 hours ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '3',
    //             name: 'Study Group',
    //             type: 'group',
    //             onlineCount: '3 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '4',
    //             name: 'Work Project',
    //             type: 'group',
    //             onlineCount: '2 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },{
    //             id: '1',
    //             name: 'John Doe',
    //             type: 'individual',
    //             lastSeen: '10 minutes ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '2',
    //             name: 'Jane Doe',
    //             type: 'individual',
    //             lastSeen: '5 hours ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '3',
    //             name: 'Study Group',
    //             type: 'group',
    //             onlineCount: '3 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '4',
    //             name: 'Work Project',
    //             type: 'group',
    //             onlineCount: '2 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },{
    //             id: '1',
    //             name: 'John Doe',
    //             type: 'individual',
    //             lastSeen: '10 minutes ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '2',
    //             name: 'Jane Doe',
    //             type: 'individual',
    //             lastSeen: '5 hours ago',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '3',
    //             name: 'Study Group',
    //             type: 'group',
    //             onlineCount: '3 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //         {
    //             id: '4',
    //             name: 'Work Project',
    //             type: 'group',
    //             onlineCount: '2 people are online',
    //             imageUrl: 'https://via.placeholder.com/50',
    //         },
    //     ];

    //     setConversations(mockData);
    // }, []);


    return (
        <div>
            <h1>Direct Messages</h1>
            <input className="mb-3" type="text" placeholder="Search conversations..." style={{ marginLeft: '10px', marginRight: '15px', width: "50%" }} /> <Button disabled>Search</Button>
            <Card className="mb-3" style={{ marginLeft: '10px', marginRight: '25px' }}>
                <div onClick={() => navigate("/chats/compose")}>
                    <svg height="50" width="50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" /></svg></svg>
                    <span>Compose Message <small><small><small><small>(Does not work)</small></small></small></small></span>
                </div>
            </Card>



            <div style={{ overflowY: 'scroll', height: '100%', marginLeft: '10px', marginRight: '10px' }}>
                {conversations.map((conversation) => (
                    <Card className="mb-3" onClick={() => navigate(`/chats/conversations/${conversation.id}`)}>
                        <Card.Body className="d-flex align-items-center">
                            <img src={conversation.imageUrl} alt={conversation.name} style={{ width: '50px', borderRadius: '50%', marginRight: '10px' }} />
                            <div>
                                <Card.Title>{conversation.name}</Card.Title>
                                {conversation.type === 'individual' ? (
                                    <Card.Text>Last seen: {conversation.lastSeen}</Card.Text>
                                ) : (
                                    <Card.Text>{conversation.onlineCount}</Card.Text>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default ChatPage;
