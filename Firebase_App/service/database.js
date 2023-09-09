const admin = require('./firebaseConfig.js');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const AWS_Region = process.env.AWS_REGION;
const AWS_AccessKeyID = process.env.AWS_KEY;
const AWS_SecretKey = process.env.AWS_SECRET_KEY;

const db = admin.firestore();
const Public_User_Collection = db.collection('User-Public-Profile');
const Organizations_Collection = db.collection('Organizations');
if (!db) {
  throw Error('Database not configured. Set Firebase Confiuration');
}
const FieldValue = admin.firestore.FieldValue;

const getActiveAnnouncements = async (organizationUID) => {
  const now = new Date();
  const announcementsRef = db.collection(`Organizations/${organizationUID}/Announcements`);

  try {
    const snapshot = await announcementsRef.where('expires', '>', now).get();

    if (snapshot.empty) {
      console.log('No active announcements found.');
      return [];
    }

    const activeAnnouncements = [];
    snapshot.forEach((doc) => {
      activeAnnouncements.push({ id: doc.id, ...doc.data() });
    });

    return activeAnnouncements;
  } catch (error) {
    console.error('Error getting active announcements:', error);
    return [];
  }
};


async function getUserDocument(firebase_uid) {
  const userRef = Public_User_Collection.doc(firebase_uid);
  const userSnapshot = await userRef.get();

  if (!userSnapshot.exists) {
    console.log("User does not exist!");
    return null;
  }

  const userData = userSnapshot.data();
  const userCollections = {};

  // Retrieve all subcollections for the user document
  const collectionsList = await userRef.listCollections();
  for (const collectionRef of collectionsList) {
    const collectionSnapshot = await collectionRef.get();
    const collectionData = await Promise.all(collectionSnapshot.docs.map(async doc => {
      const docData = doc.data();

      // Fetch the referenced document data if there's a reference field
      if (docData.ref) {
        const refSnapshot = await docData.ref.get();
        docData.refData = refSnapshot.data();
      }

      return { id: doc.id, ...docData };
    }));

    userCollections[collectionRef.id] = collectionData;
  }

  return {
    id: userSnapshot.id,
    ...userData,
    collections: userCollections
  };
}

//Get Document from path
async function getFirebaseDocument(path) {
  const docRef = await db.doc(path);
  return docRef;
}

async function getDirectoryMembers(firebase_group_id) {
  const OrganizationRef = Organizations_Collection.doc(firebase_group_id);
  const OrgSnapshot = await OrganizationRef.get()
  if (!OrgSnapshot.exists) {
    console.log('Organization not found');
    return null;
  }
  const Organization = OrgSnapshot.data();
  // const DirectoryList = {};


  return {
    id: OrgSnapshot.id,
    ...Organization,
  }
}

async function addNewEnrollment(collectionPath, documentId, data) {
  data.enrollment_date = FieldValue.serverTimestamp();

  const collectionRef = db.collection(collectionPath);
  const documentRef = collectionRef.doc(documentId);
  await documentRef.set(data);
}

function getReferencedDocument(DocumentPath) {
  return db.doc(DocumentPath);
}

async function appendUserEnrollment(orgID, userID) {
  const Organization = db.doc(`Organizations/${orgID}`);
  const userAI = db.doc(`User-Public-Profile/${userID}`);
  await Organization.update({ "group_members": FieldValue.arrayUnion(userAI) });
}
async function RemoveUserEnrollment(orgID, userID) {
  const Organization = db.doc(`Organizations/${orgID}`);
  const userAI = db.doc(`User-Public-Profile/${userID}`);
  await Organization.update({ "group_members": FieldValue.arrayUnion(userAI) });
}
async function appendUserPending(orgID, userID) {
  const Organization = db.doc(`Organizations/${orgID}`);
  const userAI = db.doc(`User-Public-Profile/${userID}`);
  await Organization.update({ "pending_join_approval": FieldValue.arrayUnion(userAI) });
}
async function removeUserPending(orgID, userID) {
  const Organization = db.doc(`Organizations/${orgID}`);
  const userAI = db.doc(`User-Public-Profile/${userID}`);
  await Organization.update({ "pending_join_approval": FieldValue.arrayRemove(userAI) });
}
async function isUserApprover(approverUID, groupID) {
  //get enrollment doc
  const userEnrollDoc = await getFirebaseDocument(`User-Public-Profile/${approverUID}/Enrollments/${groupID}`);
  const docDataRef = await userEnrollDoc.get();
  var RolesList = [];
  if (docDataRef.exists) {
    const data = docDataRef.data();
    console.log(data);
    const roles = data.roles;
    for (let i = 0; i < roles.length; ++i) {
      const currRole = await roles[i].get();
      if (currRole.exists) {
        //Store existing role into roles array:
        const roleData = currRole.data();
        console.log(roleData);
        RolesList.push(roleData);
      }
    }
    //go through each role like before:
    for (let indexRole = 0; indexRole < RolesList.length; ++indexRole) {
      const roleTemp = RolesList[indexRole].role_permissions;
      if (roleTemp.CanApproveRequests) {
        return true;
      }
    }
    return false;
  }
}
async function isSender(senderUID, groupID) {
  //get enrollment doc
  const userEnrollDoc = await getFirebaseDocument(`User-Public-Profile/${senderUID}/Enrollments/${groupID}`);
  const docDataRef = await userEnrollDoc.get();
  var RolesList = [];
  if (docDataRef.exists) {
    const data = docDataRef.data();
    console.log(data);
    const roles = data.roles;
    for (let i = 0; i < roles.length; ++i) {
      const currRole = await roles[i].get();
      if (currRole.exists) {
        //Store existing role into roles array:
        const roleData = currRole.data();
        console.log(roleData);
        RolesList.push(roleData);
      }
    }
    //go through each role like before:
    for (let indexRole = 0; indexRole < RolesList.length; ++indexRole) {
      const roleTemp = RolesList[indexRole].role_permissions;
      if (roleTemp.CanSendPushToOrganizations) {
        return true;
      }
    }
    return false;
  }
}
async function approveJoin(groupID, userID) {

}
async function isAliasUsed(alias) {
  const queryResult = await Public_User_Collection.where("alias", '==', alias).get();

  if (queryResult.empty) {
    return false;
  } else {
    return true;
  }
}

async function isPhoneNumberUsed(phone) {
  const queryResult = await Public_User_Collection.where("phone", '==', phone).get();

  if (queryResult.empty) {
    return false;
  } else {
    return true;
  }
}


async function setNewUserProfile(userUID, data) {
  Public_User_Collection.doc(userUID).set(data)
    .then(() => {
      console.log("Successful profile created!");
      return true;
    })
    .catch((error) => {
      console.log("Error creating user public profile!");
      return false;
    })
}

async function setPublicProfileImage(userUID, urlPath) {
  const userRef = Public_User_Collection.doc(userUID);
  try {
    await userRef.update({
      profile_image_url: urlPath
    });
    console.log('Image URL Uploaded');
    return true;
  } catch (error) {
    console.log('Failed to update Profile URL: ', error);
    return false;
  };
}

async function getFirebaseOrgDocByJoinCode(joinCode) {
  const orgRef = Organizations_Collection.where('group_join_code', '==', joinCode);
  const orgQuerySnapshot = await orgRef.get();
  if (orgQuerySnapshot.empty) {
    return null;
  } else {
    const orgDocSnapshot = orgQuerySnapshot.docs[0];
    const orgDocData = orgDocSnapshot.data();
    const orgDocId = orgDocSnapshot.id;
    return { ...orgDocData, id: orgDocId };
  }
}


//Send Push Notification
async function pushNotificationToUsers(tokensArray, payload) {
  payload.sound = "default"

  try {
    const response = await admin.messaging().sendMulticast({ tokens: tokensArray, ...payload });
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

async function getUserSessionTokens(userId) {
  const user = await this.getFirebaseDocument(`User-Public-Profile/${userId}`);

  const userRef = await user.get();
  if (!userRef.exists) {
    throw new Error('User not found');
  } else {
    const userData = userRef.data();
    const sessionTokens = userData.sessions;

    if (!sessionTokens) {
      return ([]);
    } else {
      // Extract the tokens from the sessions and store them in an array.
      const tokensArray = sessionTokens.map((session) => session.token);
      return tokensArray;
    }
  }
}

async function addAnnouncement(groupID, title, body, dateExpires) {
  const dateExpiresTimestamp = admin.firestore.Timestamp.fromDate(new Date(dateExpires));
  const announcement = {
    title,
    body,
    date_created: FieldValue.serverTimestamp(),
    expires: dateExpiresTimestamp,
  };

  const announcementRef = await db
    .collection(`Organizations/${groupID}/Announcements`)
    .add(announcement);

  return announcementRef.id;
}
async function removeAnnouncement(groupID, announcementID) {
  await db
    .doc(`Organizations/${groupID}/Announcements/${announcementID}`)
    .delete();
}
async function getNotifications(userUID) {
  try {
    const notificationsRef = db.collection('User-Public-Profile').doc(userUID).collection('Notifications');
    const snapshot = await notificationsRef.get();

    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
}

// Delete a notification for the given user and notificationID
async function deleteNotification(userUID, notificationID) {
  try {
    const notificationRef = db.collection('User-Public-Profile').doc(userUID).collection('Notifications').doc(notificationID);
    await notificationRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

// Add a new notification for the given user
async function addNotification(userUID, notificationData) {
  try {
    const notificationsRef = db.collection('User-Public-Profile').doc(userUID).collection('Notifications');

    // Add a timestamp field using Firebase server timestamp
    const newNotificationData = {
      ...notificationData,
      timestamp: FieldValue.serverTimestamp(),
    };

    const docRef = await notificationsRef.add(newNotificationData);

    return { id: docRef.id, ...newNotificationData };
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
}


const s3Client = new S3Client({
  region: AWS_Region,
  config: {
    credentials: {
      accessKeyId: AWS_AccessKeyID,
      secretAccessKey: AWS_SecretKey
    }
  }
});


// Function to create a Presigned URL for uploading a file to S3
async function createPresignedUrlForUpload(bucketName, objectKey, contentType, expiresIn) {
  // Set up the PutObjectCommand
  const putObjectCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: contentType
  });
  console.log('Region: ' + AWS_Region);
  // Generate the Presigned URL for the PutObjectCommand
  const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
    expiresIn,
  });

  return signedUrl;
}
//Role Management:
async function createNewRole(groupID, formFields) {
  try {
    // get references to the subgroups
    let subGroupLinkJurisdiction = formFields.sub_group_link_jurisdiction !== '' ?
      db.collection('Organizations').doc(groupID).collection('Sub_Groups').doc(formFields.sub_group_link_jurisdiction) :
      null;

    let subGroupLinkBelong = formFields.sub_group_link_belong !== '' ?
      db.collection('Organizations').doc(groupID).collection('Sub_Groups').doc(formFields.sub_group_link_belong) :
      null;

    // create the role data
    let roleData = {
      role_title: formFields.role_title,
      display_title: formFields.display_title,
      is_over_subgroup: formFields.is_over_subgroup,
      is_belong_subgroup: formFields.is_belong_subgroup,
      is_read_only: formFields.is_read_only,
      is_leadership: formFields.is_leadership,
      role_permissions: []
    };

    if (subGroupLinkJurisdiction !== null) {
      roleData['sub_group_link_jurisdiction'] = subGroupLinkJurisdiction;
    }

    if (subGroupLinkBelong !== null) {
      roleData['sub_group_link_belong'] = subGroupLinkBelong;
    }

    // add the role to the database
    let roleDocRef = await db.collection('Organizations').doc(groupID).collection('Roles').add(roleData);

    console.log("Role created successfully.");
    return roleDocRef.id;

  } catch (error) {
    console.error("Error creating role: ", error);
    throw error; // rethrow the error so it can be handled by the route
  }
}
//Role Functions for users:

async function fetchAllRoles(groupID) {
  const snapshot = await db.collection(`Organizations/${groupID}/Roles`).get();
  if (snapshot.empty) throw new Error('No roles found');
  let roles = [];
  snapshot.forEach(doc => roles.push({ id: doc.id, ...doc.data() }));
  return roles;
}
async function proposeUserRole(groupID, roleID, userUID, leaderUID) {
  try {
    // get references for both user profiles
    let leaderRef = db.collection('User-Public-Profile').doc(leaderUID);
    let userRef = db.collection('User-Public-Profile').doc(userUID);

    // get reference to the proposed_members subcollection
    let proposedMemberRef = db.collection('Organizations').doc(groupID).collection('Roles').doc(roleID).collection('ProposedMembers').doc(userUID);

    // create a new document in the subcollection
    await proposedMemberRef.set({
      date: admin.firestore.FieldValue.serverTimestamp(),
      leader: leaderRef,
      userRef: userRef
    });

    console.log("User role proposed successfully.");
    return true;
  } catch (error) {
    console.error("Error proposing user role: ", error);
    return false;
  }
}
async function approveUserRole(groupID, roleID, userUID, leaderUID) {
  try {
    // get references for both user profiles
    let leaderRef = db.collection('User-Public-Profile').doc(leaderUID);
    let userRef = db.collection('User-Public-Profile').doc(userUID);

    // get reference to the proposed_members subcollection
    let proposedMemberRef = db.collection('Organizations').doc(groupID).collection('Roles').doc(roleID).collection('Members').doc(userUID);

    // create a new document in the subcollection
    await proposedMemberRef.set({
      date: admin.firestore.FieldValue.serverTimestamp(),
      leader: leaderRef,
      userRef: userRef
    });

    console.log("User role proposed successfully.");
    return true;
  } catch (error) {
    console.error("Error proposing user role: ", error);
    return false;
  }
}
async function removeProposedUserRole(groupID, roleID, userUID) {
  try {
    // get reference to the user's proposed member document
    let proposedMemberRef = db.collection('Organizations').doc(groupID).collection('Roles').doc(roleID).collection('ProposedMembers').doc(userUID);

    // delete the document
    await proposedMemberRef.delete();

    console.log("User role proposal removed successfully.");
    return true
  } catch (error) {
    console.error("Error removing proposed user role: ", error);
    return false;
  }
}
async function removeApprovedUserRole(groupID, roleID, userUID) {
  try {
    // get reference to the user's proposed member document
    let proposedMemberRef = db.collection('Organizations').doc(groupID).collection('Roles').doc(roleID).collection('Members').doc(userUID);

    // delete the document
    await proposedMemberRef.delete();

    console.log("User role proposal removed successfully.");
    return true
  } catch (error) {
    console.error("Error removing proposed user role: ", error);
    return false;
  }
}
async function addUserRole(userUID, groupID, roleID) {
  try {
    // get reference to the role
    let roleRef = db.collection('Organizations').doc(groupID).collection('Roles').doc(roleID);

    // get reference to the user's enrollments document for this group
    let userEnrollmentRef = db.collection('User-Public-Profile').doc(userUID).collection('Enrollments').doc(groupID);

    // add the role to the user's roles array
    await userEnrollmentRef.update({
      roles: admin.firestore.FieldValue.arrayUnion(roleRef)
    });

    console.log("Role added to user's roles successfully.");
    return true
  } catch (error) {
    console.error("Error adding role to user's roles: ", error);
    return false;
  }
}
async function removeUserRole(userUID, groupID, roleID) {
  try {
    // get reference to the role
    let roleRef = db.collection('Organizations').doc(groupID).collection('Roles').doc(roleID);

    // get reference to the user's enrollments document for this group
    let userEnrollmentRef = db.collection('User-Public-Profile').doc(userUID).collection('Enrollments').doc(groupID);

    // remove the role from the user's roles array
    await userEnrollmentRef.update({
      roles: admin.firestore.FieldValue.arrayRemove(roleRef)
    });

    console.log("Role removed from user's roles successfully.");
    return true;
  } catch (error) {
    console.error("Error removing role from user's roles: ", error);
    return false;
  }
}

//Subgroup Calls
async function createNewSubGroup(groupID, formFields) {
  try {
    // create the role data
    let subGroupData = {
      group_title: formFields.group_title,
      sub_group_type: formFields.sub_group_type,
      roles_jurisdiction: [],
      roles_belonging: []
    };

    // add the role to the database
    let subGroupDocRef = await db.collection('Organizations').doc(groupID).collection('Sub_Groups').add(subGroupData);

    console.log("Role created successfully.");
    return subGroupDocRef.id;

  } catch (error) {
    console.error("Error creating subgroup: ", error);
    throw error; // rethrow the error so it can be handled by the route
  }
}
async function getSubGroupsListed(groupID) {
  const snapshot = await db.collection(`Organizations/${groupID}/Sub_Groups`).get();
  if (snapshot.empty) throw new Error('No subgroups found.');
  let subgroupsList = [];
  snapshot.forEach(doc => subgroupsList.push({ id: doc.id, ...doc.data() }));
  return subgroupsList;
}
async function getSubGroupsListQuery(groupID, category_type) {
  const snapshot = await db.collection(`Organizations/${groupID}/Sub_Groups`).where('sub_group_type', '==', category_type).get();
  if (snapshot.empty) throw new Error('No matching subgroups found.');
  let subgroupsList = [];
  snapshot.forEach(doc => subgroupsList.push({ id: doc.id, ...doc.data() }));
  return subgroupsList;
}

async function addUserSubgroup(groupID, subGroupID, userUID, leaderUID) {
  try {
    // get references for both user profiles
    let leaderRef = db.collection('User-Public-Profile').doc(leaderUID);
    let userRef = db.collection('User-Public-Profile').doc(userUID);

    // get reference to the proposed_members subcollection
    let proposedMemberRef = db.collection('Organizations').doc(groupID).collection('Sub_Groups').doc(subGroupID).collection('ProposedMembers').doc(userUID);

    // create a new document in the subcollection
    await proposedMemberRef.set({
      date: admin.firestore.FieldValue.serverTimestamp(),
      leader: leaderRef,
      userRef: userRef
    });

    console.log("User successfully added to subgroup.");
    return true;
  } catch (error) {
    console.error("Error adding user to subgroup: ", error);
    return false;
  }
}
async function removeUserSubgroup(groupID, subGroupID, userUID) {
  try {
    // get reference to the user's proposed member document
    let proposedMemberRef = db.collection('Organizations').doc(groupID).collection('Sub_Groups').doc(subGroupID).collection('Members').doc(userUID);

    // delete the document
    await proposedMemberRef.delete();

    console.log("User removed successfully from subgroup.");
    return true
  } catch (error) {
    console.error("Error removing user from subgroup.", error);
    return false;
  }
}
async function getSubgroupDetails(groupID, subgroupID) {
  const snapshot = await db.collection(`Organizations/${groupID}/Sub_Groups`).doc(subgroupID).get();
  if (!snapshot.exists) {
    throw new Error('Subgroup not found');
  }
  return { id: snapshot.id, ...snapshot.data() };
}

async function appendRoleToSubLeadership(groupID, subgroupID, roleID){
  try {
    let subgroupRef = db.collection('Organizations').doc(groupID).collection('Sub_Groups').doc(subgroupID);
    let roleRef = db.collection('Organizations').doc(groupID).collection('Roles').doc(roleID);

    // Add the role to the roles_jurisdiction array in the subgroup document
    await subgroupRef.update({
      roles_jurisdiction: admin.firestore.FieldValue.arrayUnion(roleRef)
    });

    console.log("Role successfully appended to Subgroup leadership.");
    return true;
  } catch (error) {
    console.error("Error appending role to subgroup leadership: ", error);
    return false;
  }
}

async function appendRoleToSubRoles(groupID, subgroupID, roleID){
  try {
    let subgroupRef = db.collection('Organizations').doc(groupID).collection('Sub_Groups').doc(subgroupID);
    let roleRef = db.collection('Organizations').doc(groupID).collection('Roles').doc(roleID);

    // Add the role to the roles_belonging array in the subgroup document
    await subgroupRef.update({
      roles_belonging: admin.firestore.FieldValue.arrayUnion(roleRef)
    });

    console.log("Role successfully appended to Subgroup roles.");
    return true;
  } catch (error) {
    console.error("Error appending role to subgroup roles: ", error);
    return false;
  }
}



module.exports = {
  //Firebase Calls
  getActiveAnnouncements,
  getUserDocument,
  getFirebaseDocument,
  addNewEnrollment,
  getDirectoryMembers,
  isAliasUsed,
  isPhoneNumberUsed,
  setNewUserProfile,
  setPublicProfileImage,
  getFirebaseOrgDocByJoinCode,
  getReferencedDocument,
  appendUserEnrollment,
  RemoveUserEnrollment,
  appendUserPending,
  removeUserPending,
  isUserApprover,
  isSender,
  approveJoin,
  createPresignedUrlForUpload,
  pushNotificationToUsers,
  getUserSessionTokens,
  addAnnouncement,
  removeAnnouncement,
  getNotifications,
  deleteNotification,
  addNotification,
  //Role Calls
  createNewRole,
  fetchAllRoles,
  proposeUserRole,
  approveUserRole,
  removeProposedUserRole,
  removeApprovedUserRole,
  addUserRole,
  removeUserRole,
  //Subgroup Calls:
  createNewSubGroup,
  getSubGroupsListed,
  getSubGroupsListQuery,
  addUserSubgroup,
  removeUserSubgroup,
  getSubgroupDetails,
  appendRoleToSubLeadership,
  appendRoleToSubRoles
};
