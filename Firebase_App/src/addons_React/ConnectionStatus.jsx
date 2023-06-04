import React, { useState, useEffect } from 'react';
import { AuthState } from './../authentication/login/AuthState'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud, faSlash } from '@fortawesome/free-solid-svg-icons';

<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@40,700,0,0" />
const ConnectionStatus = (props) => {
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
    // Your reconnect logic here...
    if (!socket.socket) {
      socket.connect();
    }
    else {
      socket.connect();
    }
    setIsRefreshing(false);
    setStatus('Connected');

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
      setStatus('Connected');
      setMessageActivity(true);
      setLink(true);
      setTimeout(() => {
        setMessageActivity(false);
      }, 2000);
    };

    if (!socket.socket) {
      socket.connect();
    }
    socket.socket.addEventListener('open', handleSocketOpen);
    socket.socket.addEventListener('close', handleSocketClose);
    //Connect the socket
    socket.socket.addEventListener('message', handleDisplaySocketActive);
    // Cleanup on unmount
    return () => {
      socket.socket.removeEventListener('open', handleSocketOpen);
      socket.socket.removeEventListener('close', handleSocketClose);

    };
  }, [socket.socket]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ marginBottom: '10px' }}>
        <p style={{ marginBottom: '5px' }}>
          Server: {status === 'Disconnected' ? (
          <span className="fa-stack">
            <FontAwesomeIcon icon={faCloud} className="fa-stack-1x" />
            <FontAwesomeIcon icon={faSlash} className="fa-stack-1x" />
          </span>
        ) : (
          <FontAwesomeIcon icon={faCloud} />
        )}
          {status === 'Connected' && (
            <i
              className={receiveingActivity ? 'fas fa-sync-alt fa-spin' : 'fas fa-sync-alt'}
              style={{ marginLeft: '10px' }}
            ></i>
          )}
        </p>
        {status === 'Disconnected' && (
          <button className="btn btn-primary" onClick={handleRefresh}>
            Reconnect
          </button>
        )}
      </div>
    </div>
  );
  
};

export default ConnectionStatus;
