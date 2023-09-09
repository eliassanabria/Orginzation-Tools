
class UserStatusChangeEvent {
  constructor(userID, status) {
    this.type = 'StatusChange'
    this.userID = userID;
    this.status = status;
  }
}
class UserApprovalEvent{
  constructor(success){
    this.success = success;
  }
}
class AnnouncementEvent{
  constructor(groupID, groupName, title, body){
    this.type ='AnnouncementNotification'
    this.groupID = groupID;
    this.groupName = groupName
    this.title = title;
    this.body = body;
  }
}


class SocketCommunicator {

  handlers = [];
  //WebSocketStatus = 'Disconnected';
  constructor() {
    this.reconnectDelay = 5000;
    this.WebSocketStatus = 'Disconnected';
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
    this.WebSocketStatus = 'Connected';

    this.socket.addEventListener('open', () => {
      console.log('Connected to server');
      const userID = localStorage.getItem('userID');
      let status = localStorage.getItem('last_displayed_status');
      if (!status) { status = 'Online'; console.log("NULL Stat: now is: " + status) }
      this.sendStatus(localStorage.getItem('id'), status);

    });

    this.socket.addEventListener('message', (event) => {
      //console.log(`Received message: ${event.data}`);
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(event.data);
      } catch (error) {
        console.error('Failed to parse message:', error);
        return;
      }
      if (parsedMessage.message_type === 'user_status_changed') {
        const { userID, status } = parsedMessage;
        // Do something with the userUUID and status
        this.processUserStatus(userID, status);
        //console.log(`Received status update for user ${userID}: ${status}`);
      } else if(parsedMessage.message_type === 'user_directory_approval'){
        this.processDirectoryApproval();
      }
      else if(parsedMessage.message_type === `Announcement_Notification`){
        const {groupID, groupName, title, body} = parsedMessage;
        this.processAnnouncement(groupID,groupName,title,body);
      }
      else {
        console.warn(`Received unknown message type: ${parsedMessage.message_type}`);
      }      
    });

    this.socket.addEventListener('close', () => {

      if (this.socket.CLOSED === WebSocket.CLOSED) {
        this.WebSocketStatus = 'Disconnected';
        console.log('Disconnected from server' + WebSocket.CLOSED);
      }

      setTimeout(() => this.connect, this.reconnectDelay); // Attempt to reconnect after a delay
    });

    this.socket.addEventListener('error', (error) => {
      console.error('Failed to connect to server:', error);
      // You can perform any additional actions you want to take in case of connection failure here
      this.WebSocketStatus = 'Disconnected';
      setTimeout(() => this.connect(), this.reconnectDelay);
    });
  }
  processAnnouncement(groupID,groupName,title,body){
    const announcementEvent = new AnnouncementEvent(groupID, groupName,title,body);
    this.receiveEvent(announcementEvent);
  }
  sendAnnouncement(groupID, scope, title, body, isAnnouncement, expires){
    const token = window.localStorage.getItem(('token'));
    const SocketMessage ={
      message_type:'AnnouncementSend',
      SenderToken: token,
      groupID: groupID,
      scope: scope,
      title: title,
      body: body,
      isAnnouncement: isAnnouncement,
      expires: expires,
    }
    const message = JSON.stringify(SocketMessage);
    if(this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    }
  }
  sendStatus(uuid, status) {
    const SocketMessage = {
      message_type: 'User_Status_Update_Send',
      userUUID: uuid,
      status: status
    }
    const message = JSON.stringify(SocketMessage);
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.log('Socket is not open');
      this.WebSocketStatus = 'Disconnected';
      throw Error('Unable to send:')
    }
  }
  sendApproval(groupID, userID){
    const token = window.localStorage.getItem(('token'));
    const SocketMessage = {
      message_type: 'Approval_Sent_To_User',
      SenderToken: token,
      recieverUID: userID,
      groupID: groupID
    }
    const message = JSON.stringify(SocketMessage);
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.log('Socket is not open');
      this.WebSocketStatus = 'Disconnected';
      throw Error('Unable to send:')
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
  processUserStatus(userID, status){
    //console.log(`User ${userID} is now ${status}`); 
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
    this.WebSocketStatus = 'Connected';
    const userStatus = new UserStatusChangeEvent(userID, statusIDLight);
    this.receiveEvent(userStatus);
  }
  processDirectoryApproval(){
    const userApproved = new UserApprovalEvent(true);
    this.receiveEvent(userApproved);
  }
}

const Socket = new SocketCommunicator();
export { Socket, UserStatusChangeEvent, UserApprovalEvent, AnnouncementEvent};
