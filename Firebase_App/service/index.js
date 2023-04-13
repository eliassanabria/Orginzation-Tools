
//const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const DB = require('./database.js');
const { PeerProxy } = require('./peerProxy.js');
const multer = require('multer');
const { ObjectId } = require('mongodb/lib/bson.js');
const bodyParser = require('body-parser');
const admin = require('./firebaseConfig.js');
//const axios = require('axios');
const upload = multer();
const authCookieName = 'token';
app.use(bodyParser.urlencoded({ extended: false }));

// The service port may be set on the command line
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
//app.use(cookieParser());

// Serve up the applications static content
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

//Upload image to S3


// GetAuth token for the provided credentials
apiRouter.post('/auth/login', async (req, res) => {
  const user = await DB.getUserByEmail(req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const alias = user.alias;
      const userAuthToken = await DB.createAuthTokenForUser(alias);
      //setAuthCookie(res, userAuthToken.token);
      res.set('Authorization', `Bearer ${userAuthToken.token}`);
      res.send({
        id: user._id.toString(),
        profile_image_url: user.profile_image_url,
        first_name: user.first_name,
        last_name: user.last_name,
        preferred_name: user.preferred_name,
        email: user.email,
        alias: user.alias,
        creation_date: user.creation_date,

      });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth token if stored in cookie
apiRouter.delete('/auth/logout', (_req, res) => {
  const token = extractAuth(_req);
  DB.DeleteAuthToken(token);
  //res.clearCookie(authCookieName);
  res.status(204).end();
});

// secureApiRouter verifies credentials for endpoints
var secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  try {
    const token = await extractAuth(req);
    const decodeValue = await admin.auth().verifyIdToken(token);
    if (decodeValue) {
      //console.log(decodeValue);
      req.user_id = await decodeValue.user_id;
      req.user_record = await decodeValue;
      next();
    } else {
      res.status(401).send({ msg: 'Unauthorized!' });
    }
  }
  catch (error) {
    res.status(500).send({ msg: 'Interal Error!' });
  }

});

// CreateAuth token for a new user
secureApiRouter.post('/auth/create/profile', async (req, res) => {
  const userUID = await req.user_record.user_id;
  const requestBody = req.body;
  const user = await DB.getUserDocument(userUID);
  if (user) {
    res.status(409).send({ msg: 'Profile already exists' });
  }
  else if (DB.isAliasUsed(requestBody.alias)) {
    res.status(409).send({ msg: 'Alias taken by other user' });
  }
  else if (DB.isPhoneNumberUsed(requestBody.phone)) {
    res.status(409).send({ msg: 'Phone number already registerd to another user.\nPlease login or reset your password!' });
  }
  else {
    //Create expected s3 image destination
    requestBody.profile_image_url = "https://cdn-icons-png.flaticon.com/512/456/456212.png";

    const userProfile = DB.setNewUserProfile(userUID, requestBody);
    if (!userProfile) {
      res.status(500);
      return;
    }
    else {
      res.status(201).send({ msg: 'Successfuly created public profile!' });
      return;
    }

    const user = await DB.createUser(profile_image_url, req.body.first_name,
      req.body.last_name, req.body.preferred_name, req.body.share_pref_name, req.body.phone, req.body.share_phone,
      req.body.email, req.body.share_email, req.body.alias, req.body.dob, req.body.gender, req.body.password);



    // Set the cookie
    const alias = user.alias;
    const userAuthToken = await DB.createAuthTokenForUser(alias);
    res.set('Authorization', `Bearer ${userAuthToken.token}`);
    res.send({
      profile_image_url: user.profile_image_url,
      creation_date: user.creation_date,
      id: user._id.toString()
    });
  }
});
// GetUser returns information about a user This needs to be refactor
secureApiRouter.get('/user/:email', async (req, res) => {
  const user = await DB.getUserDocument(await req.user_record.user_id);
  if (user) {
    res.status(200).send({
      id: user.id,
      authenticated: true,
      profile_image_url: req.user_record.picture ?? user.profile_image_url,
      first_name: user.first_name,
      last_name: user.last_name,
      preferred_name: user.preferred_name,
      email: req.user_record.email
    })
    return;
  }
  else {
    res.status(422).send({ msg: 'Incomplete profile!' });
  }
});




//get user document for /settings page of user
secureApiRouter.get('/account/settings', async (req, res) => {
  const token = extractAuth(req);
  const userUID = await extract_UID_From_Token(token)
  const user = await DB.getUserByFirebaseUID(userUID);
  if (user) {
    const UserDocument = {
      _id: user._id,
      profile_image_url: user.profile_image_url,
      first_name: user.first_name,
      last_name: user.last_name,
      preferred_name: user.preferred_name,
      share_pref_name: user.share_pref_name,
      phone: user.phone,
      share_phone: user.share_phone,
      email: user.email,
      share_email: user.share_email,
      alias: user.alias,
      dob: user.dob,
      gender: user.gender,

      creation_date: user.creation_date
    }
    res.status(200).send({ UserDocument });
  }
  else {
    res.status(401).send({ msg: 'Unauthorized Request' });
  }

});
//Sets the specific value of a user's parameter on the document
secureApiRouter.patch('/accounts/change/:setting', async (req, res) => {

});

secureApiRouter.patch('/services/updateImageURL', async (req, res) => {
  const url = await req.body.url;
  const userUID = await req.user_record.user_id;
  const user = await DB.getUserDocument(userUID);
  if (!user) {
    res.status(404).send({ msg: 'User profile not found!' });
    return;
  }

  const submission = await DB.setPublicProfileImage(userUID, url);
  if (submission) {
    res.status(201).send({ msg: 'OK' })
  }
  else {
    res.status(500).send({ msg: 'Failed to upload image url to profile!' });
  }
});


secureApiRouter.post('/services/uploads/profiles', async (req, res) => {
  const contentType = await req.body.Content_Type;
  const userUID = await req.user_record.user_id;
  const user = await DB.getUserDocument(userUID);
  if (!user) {
    res.status(404).send({ msg: 'User profile not found!' });
    return;
  }
  const fileExtention = contentType.replace('image/', '');
  const bucketName = 'organization-tools-user-profile-images';
  const objectKey = `${userUID}.${fileExtention}`;
  const expiresIn = 60; // URL will expire in 1 munute (60 seconds)

  try {
    const uploadUrl = await DB.createPresignedUrlForUpload(bucketName, objectKey, contentType, expiresIn);
    res.status(200).json({ url: uploadUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to generate Presigned URL' });
  }
});

//Push Notifications:
secureApiRouter.post(`/notifications/push/token/store/:token`, async (req, res) => {
  const notificationToken = req.params.token;
  const token = extractAuth(req);
  //Validate Token:
  //const successTokenAdd = await DB.addClientPushToken(token, notificationToken);
  //if (successTokenAdd) {
  res.status(201).send({ msg: `OK` });
  //}
  //else {
  // res.status(400).send({ msg: `Failed to store client push notification` });
  //}
})

secureApiRouter.get('/groups/list', async (req, res) => {

  const user = await DB.getUserDocument(await req.user_record.user_id);
  if (!user) {
    res.status(401).send({ msg: 'User is not registered, please create account.' })
    return;
  }
  const groupList = [];
  var Enrollments = user.collections.Enrollments;
  if (!Enrollments) {
    Enrollments = [];
  }
  for (let i = 0; i < Enrollments.length; ++i) {
    const EnrollmentTemp = Enrollments[i];
    const OrgTempRef = EnrollmentTemp.group_id;
    const RolesRefList = EnrollmentTemp.roles;
    const OrgData = await OrgTempRef.get();
    if (OrgData.exists) {
      // Access the fields of the document using the `data()` method:
      const data = OrgData.data();
      const OrgName = data.group_name;
      const OrgDesc = data.group_description;
      const OrgID = OrgData.id;
      const OrgStatus = EnrollmentTemp.enrollment_status;
      const orgRolesTempList = [];
      for (let x = 0; x < RolesRefList.length; ++x) {
        const RoleTempRef = RolesRefList[x];
        const RoleDataRef = await RoleTempRef.get();
        if (RoleDataRef.exists) {
          const roleData = RoleDataRef.data();
          const roleTitle = roleData.role_title;
          orgRolesTempList.push(roleTitle);
        }
      }
      let roles = '';
      for (let r = 0; r < orgRolesTempList.length; ++r) {
        if (r === orgRolesTempList.length - 1) {
          roles += orgRolesTempList[r];
        } else {
          roles += orgRolesTempList[r] + ', '
        }
      }
      //Add user Actions Later
      const groupLine = {
        id: OrgID,
        OrganizationName: OrgName,
        Description: OrgDesc,
        MemberSince: EnrollmentTemp.enrollment_date.toDate(),
        MyOrgRoles: roles,
        Status: OrgStatus
      }
      groupList.push(groupLine);
      console.log(groupLine)
    }




  }

  if (groupList.length > 0) {
    res.status(200).send({
      groupList
    });
    return;
  }
  else {
    res.status(200).send({
      msg: 'No groups enrolled'
    });
    return;
  }

})

// getDirectory
secureApiRouter.get('/:groupID/directory', async (req, res) => {
  const groupID = req.params.groupID;
  const user = await DB.getUserDocument(await req.user_record.user_id);
  //verify enrollment
  var Enrollments = user.collections.Enrollments;
  if (!Enrollments) {
    res.status(401).send({ msg: 'User not enrolled in any groups!' });
  }
  for (let index = 0; index < Enrollments.length; ++index) {
    const currentEnrollment = Enrollments[index];
    const group_enrollment_assoicated_ref = currentEnrollment.group_id;
    const OrgData = await group_enrollment_assoicated_ref.get();
    if (OrgData.exists) {
      const data = OrgData.data();
      if (OrgData.id === groupID) {
        if (currentEnrollment.enrollment_status === 'Enrolled') {
          //Call get directory regular
          const directory = await getDirectoryRegular(groupID);
          res.status(200).send({
            OrgName: directory.OrgName,
            data: directory.data
          });
          return;
        }
        else if (currentEnrollment.enrollment_status === 'Action Pending'){
          //Check if survey is present
          //if it is present, verify enrollment is approved:
          //If not approved set to Waiting Approval status return 
          //If it is Approved call regular directory
          //update status to Enrolled
          
          //Fetch Survey for User to fill:
        }
        else if(currentEnrollment.enrollment_status === 'Waiting Approval'){
          res.status(202).send({msg: 'Waiting approval from a leader...'});
          return;
        }
      }
    }
  }
  res.status(403).send({ msg: `You don't have permission to access this group, please join the group with a join code provided by your group leader.` });

  return;
  //const groupID = req.params.groupID;
  const directoryIDs = await DB.getDirectoryUsersIDs(groupID);
  const Organization = await DB.getOrgDoc(groupID);
  const directoryBuilt = [];
  const isInGroup = await DB.verifyUserInGroup(groupID, user._id);

  if (isInGroup) {
    //success, use for_loop and build the directory
    for (x = 0; x < directoryIDs.length; ++x) {
      //get the user and set the display name
      const currUser = directoryIDs[x];
      var currUser_display_name = '';
      if (currUser.share_pref_name) {
        currUser_display_name = currUser.preferred_name;
      }
      else {
        currUser_display_name = currUser.first_name + ' ' + currUser.last_name;
      }
      //Fetch questionaire and set the secondary lables
      const lable2 = await getLables(groupID, currUser._id);
      //Fetch roles from roles table: for now use survey responses for the roles
      const roleIDsList = await DB.getRolesIDsOfUserInGroup(currUser._id.toString(), Organization._id.toString());
      //With roleIDsList we have the object ids of the roles of the current user, now we get the titles for each one.
      var rolesArray = [];
      for (let x = 0; x < roleIDsList.length; ++x) {
        const result = await DB.getOrgRoleByRoleID(roleIDsList[x]);
        rolesArray.push(result.role_title);
      }
      //Put roles into a string with ', ' between
      let roles = '';
      for (let r = 0; r < rolesArray.length; ++r) {
        if (r === rolesArray.length - 1) {
          roles += rolesArray[r];
        } else {
          roles += rolesArray[r] + ', '
        }
      }


      const userObject = {
        name: currUser_display_name,
        secondary_lable: lable2,
        roles: roles,
        profile_image_url: currUser.profile_image_url,
        id: currUser._id,

      }
      directoryBuilt.push(userObject);
    }
  }
  else {
    //return 403 forbidden 
    res.status(403).send({ OrgName: Organization.group_name, data: { name: '403: Unathorized,', secondary_lable: 'please join group to view directory', roles: '403', id: null } });
    return;
  }

  res.send({
    OrgName: Organization.group_name,
    data: directoryBuilt
  });
});

//Join Request:
secureApiRouter.post('/groups/join/:joinCode', async (req, res) => {
  const userID = await req.user_record.user_id;
  const user = await DB.getUserDocument(userID);
  const group = await DB.getFirebaseOrgDocByJoinCode(req.params.joinCode);
  if (!group) {
    //Null
    res.status(404).send({ msg: 'Group not found, please verify group code and try again' })
    return;
  }
  const group_id = group.id;
  //Verify no enrollment
  const is_enrolled = await DB.getFirebaseDocument(`User-Public-Profile/${userID}/Enrollments/${group_id}`);

  const EnrollmentDoc = await is_enrolled.get();
  if (EnrollmentDoc.exists) {
    console.log("User already enrolled!");
    res.status(409).send({ msg: 'User already Enrolled!' });
    return;
  }
  const joinSurveyRequired = group.survey_required;
  const approvalJoinRequired = group.requires_approval;
  //Create new Enrollment Document data here:
  var enrollmentStatus = '';
  if (approvalJoinRequired) {
    enrollmentStatus = 'Waiting Approval';
  }
  if (joinSurveyRequired) {
    enrollmentStatus = 'Attention Required';
  }
  const base_role = await group.base_role.get();
  if (!base_role.exists) {
    res.status(500).send({ msg: `Base role not available, contact administrator to fix!` });
    return;
  }
  //GetBaseRoleRef
  const baseRoleRef = DB.getReferencedDocument(`Organizations/${group_id}/Roles/${base_role.id}`);
  //Get Ref GroupID
  const groupRef = DB.getReferencedDocument(`Organizations/${group_id}`);

  const EnrollmentData = {
    enrollment_status: enrollmentStatus,
    group_id: groupRef,
    roles: [baseRoleRef]
  }



  try {
    await DB.appendUserEnrollment(group_id, userID);
    await DB.addNewEnrollment(`User-Public-Profile/${userID}/Enrollments`, group_id, EnrollmentData);
  }
  catch (error) {
    console.error("Error: ", error);
  }

  //Join Group
  const enrollSuccess = true;
  if (enrollSuccess) {
    res.status(200).send({ groupID: group_id });
  }
  else {
    res.status(500);
  }
  return;

});

//Validate the user has no pending required surveys set by group leaders
secureApiRouter.get('/:groupID/membership/validate', async (req, res) => {
  const token = extractAuth(req);
  //this get the user's token object
  const userUID = await extract_UID_From_Token(token)


  const User = await DB.getUserByFirebaseUID(userUID);
  const requiredSurveys = await DB.getRequiredSurveysGroups(req.params.groupID);
  var survey_pending = [];
  //console.log(requiredSurveys);
  for (let x = 0; x < requiredSurveys.length; ++x) {
    const is_not_taken = await DB.checkDocumentExists(User._id.toString(), requiredSurveys[x]);
    //console.log(is_not_taken);
    if (is_not_taken) {
      survey_pending.push(requiredSurveys[x]);
    }
  }
  if (survey_pending.length === 0) {
    res.status(200).send({ msg: 'OK' });
    return;
  }
  else {
    res.status(412).send({
      data: survey_pending,
    })
    return;
  }
});
//Join Request Required Form:
secureApiRouter.get('/:groupID/surveys/:surveyDocumentID', async (req, res) => {
  const token = extractAuth(req);
  const { groupID, surveyDocumentID } = req.params;
  const userToken = await DB.getUserByToken(token);
  //Validate Token

  //get survey document from database
  const surveyDocument = await DB.getSurveyHTML(groupID, surveyDocumentID);
  //convert document into html:


  res.status(200).send({ FormData: surveyDocument });

});
//Join Request:
//Can be either after submittion of join survey or no survye required.
secureApiRouter.post('/:groupID/surveys/:surveyDocumentID/submit', async (req, res) => {
  const token = extractAuth(req);
  const userToken = await DB.getUserByToken(token);
  const { groupID, surveyDocumentID } = req.params;
  //Validate Token
  const surveyDocumentTemplate = await DB.getSurveyHTML(groupID, surveyDocumentID);
  const User = await DB.getUserByAlias(userToken.alias);
  //check for existing submission:
  const alreadyExists = await DB.checkDocumentExists(User._id, surveyDocumentTemplate._id)
  if (!alreadyExists) {
    res.status(409).send({ msg: 'Survey already taken. Please delete response to resubmit.' });
    return;
  }
  //map responses to question ids
  const body = await req.body;
  const responses = body.data;
  const survey_questions = surveyDocumentTemplate.survey_questions;
  for (let index = 0; index < survey_questions.length; ++index) {
    const current_question_id = survey_questions[index].question_id.toString();

    if (responses[current_question_id]) {
      //console.log("This question was answered.")
      survey_questions[index].value = responses[current_question_id];
    }
    else if (survey_questions[index].is_required) {
      //throw exception missing required field
      res.status(400).send({
        msg: 'Missing required question response for: ' + survey_questions[index].label,
      })
      return;
    }
  }
  //create submission object
  const newSubmission = {
    _id: new ObjectId(),
    group_origin: new ObjectId(groupID),
    document_type: 'Questionnaire_Response',
    document_owner: User._id,
    survey_origin: surveyDocumentTemplate._id,
    survey_questions: survey_questions,
    document_title: surveyDocumentTemplate.document_title
  }
  //console.log(newSubmission);
  if (await DB.addUserSubmission(newSubmission)) {
    res.status(200).send({
      msg: 'Your response has been recorded.',
    })
  }
});



//Get the info on group requesting to join and verify they are not a member of the group.
secureApiRouter.get('/group/:JoinCode/info', async (req, res) => {
  const userID = await req.user_record.user_id;
  const user = await DB.getUserDocument(userID);
  if (!user) {
    res.status(500).send({ msg: 'User profile not found!' });
  }

  const group = await DB.getFirebaseOrgDocByJoinCode(req.params.JoinCode);
  if (!group) {
    //Null
    res.status(404).send({ msg: 'Group not found, please verify group code and try again' })
    return;
  }
  const group_id = group.id;
  //Verify no enrollment
  const is_enrolled = await DB.getFirebaseDocument(`User-Public-Profile/${userID}/Enrollments/${group_id}`);
  const EnrollmentDoc = await is_enrolled.get();
  if (EnrollmentDoc.exists) {
    console.log("User already enrolled!");
    res.status(409).send({ msg: 'User already Enrolled!' });
    return;
  }
  const User_Owner = await group.group_owner.get();
  if (!User_Owner.exists) {
    res.status(404).send({ msg: `Group found, group owner not found. If you know the owner's contact info, notify them ASAP!` })
  }
  const group_owner_details = await User_Owner.data();
  res.status(200).send(
    {
      group_name: group.group_name,
      group_description: group.group_description,
      group_creation: group.group_creation_date.toDate(),
      member_count: group.group_members.length,
      survey_required: group.survey_required,
      //survey_id: group.survey_id,
      owner_name: group_owner_details.pref_name,
      owner_contact: group_owner_details.email,
    })
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// setAuthCookie in the HTTP response
// function setAuthCookie(res, authToken) {
//   res.cookie(authCookieName, authToken, {
//     secure: true,
//     httpOnly: true,
//     sameSite: 'strict',
//   });
// }

const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

function extractAuth(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    return token;
  } else {
    return null;
  }
}
async function getLables(groupID, currUserID) {
  const groupLables = await DB.getGroupLables(groupID);
  return 'Test lable';
}

async function joinGroup(groupUUID, userUUID) {
  //get base membership level
  const baseMemberID = await DB.getBaseMembershipIDFromOrgID(groupUUID);
  //Add user to group Member list:
  await DB.addMemberToOrg(groupUUID, userUUID);
  //Create new enrollement document
  await DB.enrollNewUser(groupUUID, userUUID, baseMemberID);
  //Send enrollment completed:
  return true;
}

async function getDirectoryRegular(groupID) {
  const Organization = await DB.getDirectoryMembers(groupID);
  console.log(Organization);
  const directory = [];
  const DirectoryRefList = Organization.group_members;
  for (let index = 0; index < DirectoryRefList.length; ++index) {
    const MemberTempRef = DirectoryRefList[index];
    const MemberTempObj = await MemberTempRef.get();
    if (!MemberTempObj.exists) {
      console.log("Member not found");
      continue;
    }
    const MemberTempData = MemberTempObj.data();
    //Set diplay name for member in directory
    var currUser_display_name = '';
    if (MemberTempData.share_pref_name) {
      currUser_display_name = MemberTempData.pref_name;
    }
    else {
      currUser_display_name = MemberTempData.first_name + ' ' + MemberTempData.last_name;
    }
    //Set Lables

    //Set Roles
    //First get enrollment document
    console.log(MemberTempObj.id);
    console.log(groupID);

    const EnrollmentDocRef = await DB.getFirebaseDocument(`User-Public-Profile/${MemberTempObj.id}/Enrollments/${groupID}`);
    const EnrollmentDoc = await EnrollmentDocRef.get();
    if (!EnrollmentDoc.exists) {
      console.log("User enrollment not found!");
    }
    //Extract enrollment data:
    const EnrollmentData = EnrollmentDoc.data();
    if (EnrollmentData.enrollment_status !== "Enrolled") {
      console.log("User not fully enrolled");
      continue;
    }
    //With enrollment extracted, extract roles
    const RolesRefList = EnrollmentData.roles;
    const orgRolesTempList = [];
    for (let x = 0; x < RolesRefList.length; ++x) {
      const RoleTempRef = RolesRefList[x];
      const RoleDataRef = await RoleTempRef.get();
      if (RoleDataRef.exists) {
        const roleData = RoleDataRef.data();
        const roleTitle = roleData.role_title;
        orgRolesTempList.push(roleTitle);
      }
    }
    let roles = '';
    for (let r = 0; r < orgRolesTempList.length; ++r) {
      if (r === orgRolesTempList.length - 1) {
        roles += orgRolesTempList[r];
      } else {
        roles += orgRolesTempList[r] + ', '
      }
    }

    const userObject = {
      name: currUser_display_name,
      //secondary_lable: lable2,
      roles: roles,
      profile_image_url: MemberTempData.profile_image_url,
      id: MemberTempObj.id,

    }
    directory.push(userObject);
  }



  return {
    OrgName: Organization.group_name,
    data: directory
  }
}

async function extract_UID_From_Token(token) {
  const decodeValue = await admin.auth().verifyIdToken(token);
  if (decodeValue) {
    return decodeValue.uid;
  }
  else {
    return null;
  }
}

new PeerProxy(httpService);
