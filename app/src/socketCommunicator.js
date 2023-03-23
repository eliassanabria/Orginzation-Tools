class UserStatusChangeEvent {
    constructor(userID, status) {
      this.userID = userID;
      this.status = status;
    }
  }
  
  class SocketCommunicator {
    handlers = [];
  
    constructor() {
      this.socket = null;
      let port = window.location.port;
      if (process.env.NODE_ENV !== 'production') {
        port = 3000;
      }
      const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
      this.url = `${protocol}://${window.location.hostname}:${port}/ws`;
    }
  
    connect() {
      this.socket = new WebSocket(this.url);
  
      this.socket.addEventListener('open', () => {
        console.log('Connected to server');
        this.sendStatus(localStorage.getItem('userID'),localStorage.getItem('last_displayed_status'));
      });
  
      this.socket.addEventListener('message', (event) => {
        console.log(`Received message: ${event.data}`);
  
        const [userID, status] = event.data.split(':');
        console.log(`User ${userID} is now ${status}`);
        var statusIDLight = null;
        if (status === 'Online') {
          statusIDLight = 'overlayUserStatusOnline';
        } else if (status === 'Away') {
          statusIDLight = 'overlayUserStatusAway';
        } else if (status === 'Do Not Disturb') {
          statusIDLight = 'overlayUserStatusDND';
        } else if (status === 'Offline') {
          statusIDLight = 'overlayUserStatusOffline';
        }
  
        const userStatus = new UserStatusChangeEvent(userID, statusIDLight);
        this.receiveEvent(userStatus);
      });
  
      this.socket.addEventListener('close', () => {
        console.log('Disconnected from server');
      });
    }
  
    sendStatus(uuid, status) {
      const message = `${status}:${uuid}`;
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(message);
      } else {
        console.log('Socket is not open');
      }
    }
  
    disconnect() {
      this.socket.close();
    }
  
    addHandler(handler) {
      this.handlers.push(handler);
    }
  
    removeHandler(handler) {
      this.handlers.filter((h) => h !== handler);
    }
  
    receiveEvent(event) {
      this.handlers.forEach((handler) => {
        handler(event);
      });
    }
  }
  
  const Socket = new SocketCommunicator();
  export { Socket, UserStatusChangeEvent };
  