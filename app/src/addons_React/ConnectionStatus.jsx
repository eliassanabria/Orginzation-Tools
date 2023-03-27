import React, { useState, useEffect } from 'react';
import { Socket } from './socketCommunicator';

const socket = Socket.socket;

const ConnectionStatus = () => {
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    const handleSocketOpen = () => {
      setStatus('Connected');
    };

    const handleSocketClose = () => {
      setStatus('Disconnected');
    };

    //socket.addEventListener('open', handleSocketOpen);
    //.addEventListener('close', handleSocketClose);

    // Connect the socket
    //Socket.connect();

    // Cleanup on unmount
    return () => {
      Socket.socket.removeEventListener('open', handleSocketOpen);
      Socket.socket.removeEventListener('close', handleSocketClose);
      
    };
  }, [Socket.socket]);

  return (
    <div>
      <h3>WebSocket Status:</h3>
      <p>{Socket.WebSocketStatus}</p>
    </div>
  );
};

export default ConnectionStatus;
