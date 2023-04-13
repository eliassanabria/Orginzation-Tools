const { WebSocketServer } = require('ws');
const uuid = require('uuid');
const DB = require('./database.js');
const { ObjectId } = require('mongodb/lib/bson.js');
class PeerProxy {
  constructor(httpServer) {
    // Create a websocket object
    const server = new WebSocketServer({ noServer: true });

    // Handle the protocol upgrade from HTTP to WebSocket
    httpServer.on('upgrade', (request, socket, head) => {
      server.handleUpgrade(request, socket, head, function done(ws) {
        server.emit('connection', ws, request);
      });
    });

    // Keep track of all the connections so we can forward messages
    let connections = [];
    server.on('connection', (socket) => {
      console.log('Client connected');

      //clients.set(uuid.v4,userConnectionStatus);
      const connection = {
        id: uuid.v4(),
        userID: null,
        isOnline: true,
        isAway: false,
        isDnd: false,
        alive: true,
        ws: socket
      };
      connections.push(connection);

      socket.on('message', async (message) => {

        console.log(`Received message: ${message}`);

        let parsedMessage;
        try {
          parsedMessage = JSON.parse(message);
        } catch (error) {
          console.error('Failed to parse message:', error);
          return;
        }
        if (parsedMessage.message_type === 'User_Status_Update_Send') {
          const { userUUID, status } = parsedMessage;
          // Do something with the userUUID and status
          console.log(`Received status update for user ${userUUID}: ${status}`);
          processUserStatusMessage(userUUID,status,connection);
        } else {
          console.warn(`Received unknown message type: ${parsedMessage.message_type}`);
        }
      });

      socket.on('close', () => {
        connections.findIndex((o, i) => {
          if (o.id === connection.id) {
            connections.splice(i, 1);
            connection.isOnline = false;
            connection.isAway = false;
            connection.isDnd = false;
            broadcastStatusToPeers(connection.peerGroup, connection);
            connection.ws.terminate();
            return true;
          }
          return false;
        });
      });
      socket.on('pong', () => {
        connection.alive = true; console.log("PONG!!!");
        broadcastStatusToPeers(connection.peerGroup, connection);
      });

    });


    //Notify peer of new status change to peers connected via socket and also notify client of current users online that are peers.
    function broadcastStatusToPeers(peerIDs, connection) {
      if (!peerIDs) {
        console.log('No Peers online or found.');
        return;
      }
      connections.forEach(CurrSock => {
        //if the current socket is NOT me, send my status to the current user online and get that user's status sent to the client socket.
        //if(CurrSock.userID !== connection.userID){
        if (peerIDs.includes(CurrSock.userID)) {
          //Send status to peer
          sendStatusToSocket(connection, CurrSock);
          //Send the status to client about their peer.
          sendStatusToSocket(CurrSock, connection);
        }
        //}
        //if the socket is a user that is within the peers of groups, send signal to that person notifying that a user is online.

      });

    }
    async function processUserStatusMessage(userID, status, connection) {
      for (let i = 0; i < connections.length; i++) {
        const object = connections[i];
        if (object.id === connection.id) {
          if (!object.userID) {
            connections[i].userID = userID;
            const peerGroupMembers = [];
            const UserDocument = await DB.getUserDocument(userID);
            const EnrollmentList = UserDocument.collections.Enrollments;
            if(!EnrollmentList){
              console.log('User has no enrollments');
              break;
            }
            for (let EnrInd = 0; EnrInd < EnrollmentList.length; ++EnrInd) {
              const groupEnrollment = EnrollmentList[EnrInd];
              const groupRef = await groupEnrollment.group_id.get();
              if(!groupRef.exists){
                console.log('Group not found');
                continue;
              }
              const groupDirectory = await groupRef.data().group_members;
              for (let peerObjIndex = 0; peerObjIndex < groupDirectory.length; ++peerObjIndex) {
                const currentUser = groupDirectory[peerObjIndex];
                const currentUser_id_String = currentUser.id;
                //Check if user already in array.
                if (!peerGroupMembers.includes(currentUser_id_String)) {
                  peerGroupMembers.push(currentUser_id_String);
                }
              }
            }
            if (peerGroupMembers && connections.length !== 0) {
              connections[i].peerGroup = peerGroupMembers;
            }
            else { break; }
          }
          if (status === 'Online') {
            object.isOnline = true;
            object.isAway = false;
            object.isDnd = false;
          } else if (status === 'Away') {
            object.isOnline = true;
            object.isAway = true;
            object.isDnd = false;
          } else if (status === 'Do Not Disturb') {
            object.isOnline = true;
            object.isAway = false;
            object.isDnd = true;
          } else if (status === 'Offline' || status === 'Appear Offline') {
            object.isOnline = false;
            object.isAway = false;
            object.isDnd = false;
          }
          broadcastStatusToPeers(connections[i].peerGroup, connection);
          break;
        }
      }
    }


    setInterval(() => {
      connections.forEach((c) => {
        // Kill any connection that didn't respond to the ping last time
        if (!c.alive) {
          c.ws.terminate();
        } else {
          c.alive = false;
          console.log("PING!!!")
          c.ws.ping();
          //approveUser(c);
        }
      });
    }, 10000);

    function approveUser(recieverWS){
      const SocketMessage = {
        message_type: `user_directory_approval`
      }
      const message = JSON.stringify(SocketMessage);
      recieverWS.ws.send(message);
    }
    function sendStatusToSocket(recieverWS, peerObj) {
      const SocketMessage ={
        message_type: 'user_status_changed',
        userID: peerObj.userID,
        status: null
      }
      if (!peerObj.isOnline) {
        SocketMessage.status = 'Offline';
        //recieverWS.ws.send(`${peerObj.userID}:Offline`)
      } else if (peerObj.isDnd) {
        SocketMessage.status = 'Do Not Disturb';
        //recieverWS.ws.send(`${peerObj.userID}:Do Not Disturb`);
      } else if (peerObj.isAway) {
        SocketMessage.status = 'Away';
        //recieverWS.ws.send(`${peerObj.userID}:Away`);
      } else {
        SocketMessage.status = 'Online';
        //recieverWS.ws.send(`${peerObj.userID}:Online`);
      }
      const message = JSON.stringify(SocketMessage);
      recieverWS.ws.send(message);
    }
  }
}

module.exports = { PeerProxy };
