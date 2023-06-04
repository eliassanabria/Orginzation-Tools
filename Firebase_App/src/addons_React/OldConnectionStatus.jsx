import React, { useState, useEffect } from 'react';
import { AuthState } from './../authentication/login/AuthState'

<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@40,700,0,0" />
const ConnectionStatusOld = (props) => {
  const socket = props.WebSocket;
  const authState = props.authState;
  const [status, setStatus] = useState('Disconnected');
  const [receiveingActivity, setMessageActivity] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connected, setLink] = useState(false);
  useEffect(() => {
    return () => {
      const links = document.getElementsByTagName('link');
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (link.getAttribute('href').indexOf('fontawesome') !== -1) {
          link.parentNode.removeChild(link);
        }
      }
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Your refresh logic here...
    window.location.reload();
  };

  useEffect(() => {
    const handleSocketOpen = () => {
      setStatus('Connected');
      //Display online icon
      if (authState === AuthState.Authenticated) {
        setLink(true);
      }
    };

    const handleSocketClose = () => {
      setStatus('Disconnected');
      //If we were authenticated, use offline cloud
      if (authState === AuthState.Authenticated) {
        setLink(false);
      }

    };
    const handleDisplaySocketActive = () => {
      setMessageActivity(true);
      setLink(true);
      setTimeout(() => {
        setMessageActivity(false);
      }, 2000);
    };

    if (!socket.socket && authState === AuthState.Authenticated) {
      socket.connect();
    }
    if(authState === AuthState.Authenticated){
      socket.socket.addEventListener('open', handleSocketOpen);
      socket.socket.addEventListener('close', handleSocketClose);
      //Connect the socket
      socket.socket.addEventListener('message', handleDisplaySocketActive);
      // Cleanup on unmount
    }
    
    return () => {
      //socket.socket.removeEventListener('open', handleSocketOpen);
      //socket.socket.removeEventListener('close', handleSocketClose);

    };
  }, [socket.socket, authState]);

  return (
    <div>
      <p>Server: {status} <i className={receiveingActivity
        ? 'fas fa-sync-alt fa-spin'
        : 'fas fa-sync-alt'} ></i>
        
      </p>

    </div>
  );
};

export default ConnectionStatusOld;
