const { WebSocketServer } = require('ws');
const uuid = require('uuid');
const DB = require('./database.js');
const admin = require('./firebaseConfig.js');

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
          if (!userUUID) {
            //User is Null / not logged in. Close connection!
            console.error('UserUUID Null, user not logged in, close connection!');
            connection.ws.terminate();
            return;
          }
          connection.userID = userUUID;
          // Do something with the userUUID and status
          console.log(`Received status update for user ${userUUID}: ${status}`);
          processUserStatusMessage(userUUID, status, connection);
        }
        //Process Authorized Role approvals
        else if (parsedMessage.message_type === 'Approval_Sent_To_User') {
          const { SenderToken, recieverUID, groupID } = parsedMessage;
          const userCoded = await admin.auth().verifyIdToken(SenderToken);
          if (userCoded) {
            const approverUID = await userCoded.user_id;
            console.log(`ApproverUID: ${approverUID}`);
            const isApprover = await DB.isUserApprover(approverUID, groupID);
            if (isApprover) {
              const enrollmentRef = await DB.getFirebaseDocument(`User-Public-Profile/${recieverUID}/Enrollments/${groupID}`);
              try {
                enrollmentRef.update({ enrollment_status: "Enrolled" });
                //remove from list
                await DB.removeUserPending(groupID, recieverUID);
                //locate socket of user online;
                const ws = getUserConnection(recieverUID);
                if (ws.length != 0) {
                  approveUserSendToUser(ws, groupID);
                }
                else {
                  console.log(`User is not connected`)
                }
              } catch (err) {
                console.log(`Error: ${err}`)
              }
            }
          }

          //If role is appropriate, then change enrollment status

          //Once enrollment is approved, check all sockets to see if user is connected

          //if User is connected, send approval through socket.

          //else if user has no active connection, then go through all session tokens for that user and send push notification

        }
        else if (parsedMessage.message_type === 'AnnouncementSend') {
          const { SenderToken, groupID, scope, title, body, isAnnouncement, expires} = parsedMessage;
          const userCoded = await admin.auth().verifyIdToken(SenderToken);
          if (userCoded) {
            const senderUID = await userCoded.user_id;
            console.log(`ApproverUID: ${senderUID}`);
            const isSender = await DB.isSender(senderUID, groupID);
            if(!groupID){
              return;
            }
            if (isSender) {
              //Requester is allowed to send broadcasts
              if (scope === 'org-wide') {
                //get all members list:
                const orgRef = admin.firestore().collection('Organizations').doc(groupID);
                const orgSnapshot = await orgRef.get();

                if (!orgSnapshot.exists) {
                  // res.status(404).send('Organization not found');
                  return;
                }
                const orgData = orgSnapshot.data();
                const groupMembersRefs = orgData.group_members || [];
                const groupMemberIds = [];
                //Check if it is permanent annonuncement, if it is then add it to the announcements table of the app.
                if(isAnnouncement){
                  await DB.addAnnouncement(groupID,title,body,expires);
                }
                for (const memberRef of groupMembersRefs) {
                  groupMemberIds.push(memberRef.id);
                }
                for(let userUIDIndex = 0; userUIDIndex < groupMemberIds.length; ++userUIDIndex){
                  const userUID = groupMemberIds[userUIDIndex];
                  const userSock = getUserConnection(userUID);
                  try {
                    const tokensArray = await DB.getUserSessionTokens(userUID);
                    console.log(tokensArray);
                    //array of session tokens for given user
                    const payload = {
                      notification: {
                        title: title,
                        body: body,
                      },
                    };
                  
                    const response = await DB.pushNotificationToUsers(tokensArray, payload);
                    console.log('Push notifications sent:', response);
                  } catch (error) {
                    console.error(error.message);
                  }

                  if (userSock.length > 0) {
                    const SocketMessage = {
                      message_type: 'Announcement_Notification',
                      groupID: groupID,
                      groupName: orgData.group_name,
                      title: title,
                      body: body
                    };
                    const message = JSON.stringify(SocketMessage);
                    
                    for (const sock of userSock) {
                      // User is online, send notification banner
                      sock.ws.send(message);
                    }
                  }
                  
                  else{
                    //Store the user's notification in their personal notifications.
                    const notificationData ={
                      tite: title,
                      body: body ,
                      deeplink: `/groups/${groupID}/dashboard`
                    }
                    const notificationStored = await DB.addNotification(userUID,notificationData);
                    if(notificationStored){
                      console.log(`Notification Stored for offline user`);
                    }
                    else{
                      console.log('Failed to store notification for user.');
                    }
                  }
                  
                }
              }
            }
          }
          //get all users enrolled in scope
          //for each one, if they are online, send the announcement
          //else if they are not connected via socket, add message to their notifications
          //then send push notification to that user with the message.
        }
        else {
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
        connection.alive = true;
        broadcastStatusToPeers(connection.peerGroup, connection);
      });

    });

    function getUserConnection(userID) {
      const userConnections = connections.filter(connection => connection.userID === userID);
      if (userConnections.length > 0) {
        return userConnections.map(connection => connection.ws);
      }
      return [];
    }
    
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
      // Find all connections for this user
      const userConnections = connections.filter(conn => conn.userID === userID);
    
      // Update the status for all connections for this user
      for (let object of userConnections) {
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
        await setPeerGroupForUser(connection);
        // Broadcast the status to all peers for each connection
        
      }
      broadcastStatusToPeers(connection.peerGroup, connection);
    }
    
    
    async function setPeerGroupForUser(connection) {
      // if peerGroup is already set, no need to proceed
      if (connection.peerGroup) {
        return;
      }
    
      const userID = connection.userID;
      const peerGroupMembers = [];
      const UserDocument = await DB.getUserDocument(userID);
      if (!UserDocument) {
        console.log('User document not found');
        return;
      }
    
      const EnrollmentList = UserDocument.collections.Enrollments;
      if (!EnrollmentList) {
        console.log('User has no enrollments');
        return;
      }
    
      for (let EnrInd = 0; EnrInd < EnrollmentList.length; ++EnrInd) {
        const groupEnrollment = EnrollmentList[EnrInd];
        const groupRef = await groupEnrollment.group_id.get();
        if (!groupRef.exists) {
          console.log('Group not found');
          continue;
        }
    
        const groupDirectory = await groupRef.data().group_members;
        for (let peerObjIndex = 0; peerObjIndex < groupDirectory.length; ++peerObjIndex) {
          const currentUser = groupDirectory[peerObjIndex];
          const currentUser_id_String = currentUser.id;
    
          // Check if user already in array.
          if (!peerGroupMembers.includes(currentUser_id_String)) {
            peerGroupMembers.push(currentUser_id_String);
          }
        }
      }
    
      // Set the peerGroup for the connection
      connection.peerGroup = peerGroupMembers;
    }
    

    setInterval(() => {
      connections.forEach((c) => {
        // Kill any connection that didn't respond to the ping last time
        if (!c.alive) {
          c.ws.terminate();
        } else {
          c.alive = false;
          //console.log("PING!!!")
          c.ws.ping();
          //approveUser(c);
        }
      });
    }, 10000);

    function approveUserSendToUser(receiverWSArray, groupID) {
      const SocketMessage = {
        message_type: 'user_directory_approval',
        groupID: groupID
      };
      const message = JSON.stringify(SocketMessage);
      for (const receiverWS of receiverWSArray) {
        receiverWS.send(message);
      }
    }
    
    function sendStatusToSocket(recieverWS, peerObj) {
      const SocketMessage = {
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
