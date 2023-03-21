
//const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const DB = require('./database.js');
const { PeerProxy } = require('./peerProxy.js');
const multer = require('multer');
const { ObjectId } = require('mongodb/lib/bson.js');
const bodyParser = require('body-parser');

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

// CreateAuth token for a new user
apiRouter.post('/auth/register', async (req, res) => {
  if (await DB.getUserByEmail(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else if(await DB.getUserByAlias(req.body.alias)){
    res.status(409).send({msg: 'Alias taken by other user'});
  }
  else if(await DB.getUserByPhoneNumber(req.body.phone)){
    res.status(409).send({msg: 'Phone number already registerd to another user.\nPlease login or reset your password!'});
  }
  else {
    //Create expected s3 image destination
    const profile_image_url = " ";

    const user = await DB.createUser(profile_image_url, req.body.first_name,
      req.body.last_name,req.body.preferred_name, req.body.share_pref_name, req.body.phone, req.body.share_phone,
      req.body.email, req.body.share_email, req.body.alias, req.body.dob, req.body.gender, req.body.password);
    
    

    // Set the cookie
    const alias = user.alias;
    const userAuthToken =  await DB.createAuthTokenForUser(alias);
    res.set('Authorization', `Bearer ${userAuthToken.token}`);
    res.send({
      profile_image_url: user.profile_image_url,
      creation_date: user.creation_date,
      id: user._id.toString()
    });
  }
});

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

// GetUser returns information about a user This needs to be refactor
apiRouter.get('/user/:email', async (req, res) => {
  const user = await DB.getUserByEmail(req.params.email);
  const token = extractAuth(req);
  const userFoundOnToken = await DB.getUserByToken(token);
  if (user) {
    
    res.send({
      id: user._id,
      authenticated: user.alias === userFoundOnToken.alias,
      profile_image_url: user.profile_image_url,
      first_name: user.first_name,
      last_name: user.last_name,
      preferred_name: user.preferred_name,
      email: user.email,
      alias: user.alias,

      });
    return;
  }
  res.status(404).send({ msg: 'Unknown' });
});

// secureApiRouter verifies credentials for endpoints
var secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  const token = await extractAuth(req);
  const user = await DB.getUserByToken(token);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized!', user_Was: user, tokenWas: token});
  }
});
secureApiRouter.post('/services/uploads/profiles',upload.single('image'), (req, res) => {
  //then get that user from db with authToken,
  const authToken = extractAuth(req);
  //const imageString = req?.imageString;
  // const imageData = req.headers;
  // res.status(200).send({imageData});
  const file = req.file;
  if (!file) {
    return res.status(400).send('No image uploaded!');
  }
  else{
    //process file
    res.status(200).send('Image uploaded successfully!');
    return;
  }
  console.log(imageData);
  const user = DB.getUserByToken(authToken);
  const alias = user.alias;
  const imagePath = alias + '_profileImage';
  const pathImage = DB.uploadImageToS3(imageString, 'organization-tools-user-profile-images', imagePath);
  if(pathImage){
    res.send({
      imagePath: pathImage,
      msg: 'successfully uploaded to s3',
    })
  }
  //then extract username and create URL path, convert and uplaod to s3.
});

secureApiRouter.get('/groups/list', async (req, res)=>{
  const token = extractAuth(req);
  const userToken = await DB.getUserByToken(token);
  //Insert validate token

  
  const user = await DB.getUserByAlias(userToken.alias);
  const EnrollementList = await DB.getGroupsEnrollmentList(user._id);
  const groupList = [];
  for(let i = 0; i < EnrollementList.length; ++i){
    const tempOrg = await DB.getOrgDoc(EnrollementList[i].group_enrollment_ID_Associated.toString());
    console.log(tempOrg);
    const tempOrgRoles = EnrollementList[i].roles;
    const orgRolesTempList =[];
    for(let x = 0; x < tempOrgRoles.length; ++x){
      //call get role by id
      const tempRole = await DB.getOrgRoleByRoleID(tempOrgRoles[x]);
      //extract name and push to list;
      const tempRoleName = tempRole.role_title;
      orgRolesTempList.push(tempRoleName);
    }

    console.log(tempOrgRoles);
    //make object values for html page to be injected to the table:
    const dateString = EnrollementList[i].enrollment_date.toString();
    const tIndex = dateString.indexOf('T');
    const datePart = dateString.substring(0, tIndex);
    let roles = '';
    for(let r = 0; r < orgRolesTempList.length; ++r){
      if(r === orgRolesTempList.length-1){
        roles += orgRolesTempList[r];
      }else{
        roles += orgRolesTempList[r] + ', '
      }
    }
    const groupLine = {
      id:tempOrg._id.toString(),
      OrganizationName: tempOrg.group_name,
      Description: tempOrg.group_description,
      MemberSince: datePart,
      MyOrgRoles: roles
    }
    groupList.push(groupLine);
  }
  if(groupList){
    res.status(200).send({
      groupList
    });
    return;
  }
  else{
    res.status(200).send({
      msg: 'No groups enrolled'
    });
    return;
  }

})


// getDirectory
secureApiRouter.get('/:groupID/directory', async (req, res) => {
  //get current user
  const token = extractAuth(req);
  const userToken = await DB.getUserByToken(token);
  const user = await DB.getUserByAlias(userToken.alias);
  //check to see if that member is in the group
  const groupID = req.params.groupID;
  const directoryIDs = await DB.getDirectoryUsersIDs(groupID);
  const Organization = await DB.getOrgDoc(groupID);
  const directoryBuilt = [];
  const isInGroup = await DB.verifyUserInGroup(groupID,user._id);
 
  if(isInGroup){
    //success, use for_loop and build the directory
    for(x = 0; x < directoryIDs.length; ++x){
      //get the user and set the display name
      const currUser = directoryIDs[x];
      var currUser_display_name ='';
      if(currUser.share_pref_name){
        currUser_display_name = currUser.preferred_name;        
      }
      else{
        currUser_display_name = currUser.first_name + ' ' + currUser.last_name;        
      }
      //Fetch questionaire and set the secondary lables
      const lable2 = getLables(groupID,currUser._id);
      //Fetch roles from roles table: for now use survey responses for the roles
      const roleIDsList = await DB.getRolesIDsOfUserInGroup(user._id.toString(),Organization._id.toString());
      //With roleIDsList we have the object ids of the roles of the current user, now we get the titles for each one.
      var rolesArray = [];
      for(let x = 0; x < roleIDsList.length; ++ x){
        const result = await DB.getOrgRoleByRoleID(roleIDsList[x]);
        rolesArray.push(result.role_title);
      }
      //Put roles into a string with ', ' between
      let roles = '';
      for(let r = 0; r < rolesArray.length; ++r){
        if(r === rolesArray.length-1){
          roles += rolesArray[r];
        }else{
          roles += rolesArray[r] + ', '
        }
      }


      const userObject = {name: currUser_display_name,
        secondary_lable: lable2,
         roles: roles,
         profile_image_url: currUser.profile_image_url,
         id: currUser._id,
         
        }
      directoryBuilt.push(userObject);
    }
  }
  else{
    //return 403 forbidden 
    res.status(403).send({OrgName: Organization.group_name, data: {name: '403: Unathorized,', secondary_lable: 'please join group to view directory', roles: '403', id:null}});
    return;
  }
  
  res.send({
    OrgName: Organization.group_name,
    data: directoryBuilt
  });
});

//Join Request:
secureApiRouter.post('/groups/join/:joinCode',async(req,res) =>{
  const token = extractAuth(req);
  //this get the user's token object
  const userToken = await DB.getUserByToken(token);
  //Validate Token

  //Extract user from with alias:
  const User = await DB.getUserByAlias(userToken.alias);
  //Get Group Org Doc:
  const OrgDocs = await DB.getOrgDocByJoinCode(req.params.joinCode);
  const requiresSurveyEnrollemnt = OrgDocs.survey_required;
  //Check if user is already in group
  const is_enrolled = await DB.checkEnrollmentExists(OrgDocs._id,User._id);
  if(is_enrolled){
    res.status(409).send({msg:'User already enrolled in group!'})
    return;
  }

  //check if user is banned

  //Join Group
  const enrollSuccess = joinGroup(OrgDocs._id.toString(),User._id.toString());
  if(enrollSuccess){
    res.status(200).send({groupID: OrgDocs._id});
  }
  else{
    res.status(500);
  }
  return;
  
});

//Validate the user has no pending required surveys set by group leaders
secureApiRouter.get('/:groupID/membership/validate', async(req,res) =>{
  const token = extractAuth(req);
  //this get the user's token object
  const userToken = await DB.getUserByToken(token);
  //Validate Token

  //Extract user from with alias:
  const User = await DB.getUserByAlias(userToken.alias);
  const requiredSurveys = await DB.getRequiredSurveysGroups(req.params.groupID);
  var survey_pending = [];
  //console.log(requiredSurveys);
  for(let x = 0; x < requiredSurveys.length; ++x){
    const is_not_taken = await DB.checkDocumentExists(User._id.toString(), requiredSurveys[x]);
    console.log(is_not_taken);
     if(is_not_taken){
      survey_pending.push(requiredSurveys[x]);
     }
  }
  if(survey_pending.length === 0){
    res.status(200).send({msg:'OK'});
    return;
  }
  else{
    res.status(412).send({
      data: survey_pending,
    })
    return;
  }
});
//Join Request Required Form:
secureApiRouter.get('/:groupID/surveys/:surveyDocumentID',async(req,res) =>{
  const token = extractAuth(req);
  const {groupID, surveyDocumentID} = req.params;
  const userToken = await DB.getUserByToken(token);
  //Validate Token

  //get survey document from database
 const surveyDocument = await DB.getSurveyHTML(groupID,surveyDocumentID);
 //convert document into html:
 

  res.status(200).send({FormData:surveyDocument});

});
//Join Request:
//Can be either after submittion of join survey or no survye required.
secureApiRouter.post('/:groupID/surveys/:surveyDocumentID/submit',async(req,res) =>{
  const token = extractAuth(req);
  const userToken = await DB.getUserByToken(token);
  const {groupID, surveyDocumentID} = req.params;
  //Validate Token
  const surveyDocumentTemplate = await DB.getSurveyHTML(groupID,surveyDocumentID);
  const User = await DB.getUserByAlias(userToken.alias);
  //check for existing submission:

  //map responses to question ids
  const body = await req.body;
  const first = body.formData['6419b2f3686b594aca8af2d6'];
console.log(first);
  //create submission object
  const newSubmission ={
    _id: new ObjectId(),
    group_origin:groupID,
    document_type: 'Questionnaire_Response',
    document_owner: User._id,
    survey_origin: surveyDocumentTemplate._id,

  }


});

// SubmitScore
secureApiRouter.post('/score', async (req, res) => {
  await DB.addScore(req.body);
  const scores = await DB.getHighScores();
  res.send(scores);
});

//Get the info on group requesting to join and verify they are not a member of the group.
secureApiRouter.get('/group/:JoinCode/info', async(req,res)=>{
  const token = extractAuth(req);
  const userToken = await DB.getUserByToken(token);
  const User = await DB.getUserByAlias(userToken.alias);
  //validate Tokens
  const OrgDocs = await DB.getOrgDocByJoinCode(req.params.JoinCode);
  const User_Owner = await DB.getUserBy_id(OrgDocs.group_owner);
  //Check enrollment:
  const is_enrolled = await DB.checkEnrollmentExists(OrgDocs._id,User._id);
  if(is_enrolled){
    res.status(409).send({msg: 'User already Enrolled!'});
    return;
  }
  res.status(200).send(
   {
    group_name: OrgDocs.group_name,
    group_description: OrgDocs.group_description,
    group_creation: OrgDocs.group_creation_date,
    member_count: OrgDocs.group_members.length,
    survey_required: OrgDocs.survey_required,
    survey_id: OrgDocs.survey_id,
    owner_name: User_Owner.preferred_name,
    owner_contact: User_Owner.email,
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

function extractAuth(req){
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    return token;
  } else {
    return null;
  }
}
async function getLables(groupID,currUserID){
  const groupLables = await DB.getGroupLables(groupID);
  return '';
}

async function joinGroup(groupUUID, userUUID){
  //get base membership level
  const baseMemberID = await DB.getBaseMembershipIDFromOrgID(groupUUID);
  //Add user to group Member list:
  await DB.addMemberToOrg(groupUUID,userUUID);
  //Create new enrollement document
  await DB.enrollNewUser(groupUUID, userUUID,baseMemberID);
  //Send enrollment completed:
  return true;
}

new PeerProxy(httpService);
