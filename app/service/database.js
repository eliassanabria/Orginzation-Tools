const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const AWS = require('aws-sdk');

const userName = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const hostname = process.env.MONGOHOSTNAME;
const AWS_Region = process.env.AWS_REGION;
const AWS_AccessKeyID = process.env.AWS_KEY;
const AWS_SecretKey = process.env.AWS_SECRET_KEY;

// const fs = require('fs');

AWS.config.update({
  region: AWS_Region,
  accessKeyId: AWS_AccessKeyID,
  secretAccessKey: AWS_SecretKey
});


if (!userName) {
  throw Error('Database not configured. Set environment variables');
}

const url = `mongodb+srv://${userName}:${password}@${hostname}`;

const client = new MongoClient(url);
const userCollection = client.db('Organization-Tools-DB').collection('Users');
const AuthTokenCollection = client.db('Organization-Tools-DB').collection('AuthTokens');
const organizationsCollection = client.db('Organization-Tools-DB').collection('organization_groups');
const organizations_Enrollment_Collection = client.db('Organization-Tools-DB').collection('organization_enrollement');
const organizationRolesCollection = client.db('Organization-Tools-DB').collection('organizations_roles');
const organizationSurveys = client.db('Organization-Tools-DB').collection('organization-questionares');


function getUserByEmail(email) {
  return userCollection.findOne({ email: email });
}
function getUserByAlias(Alias) {
  return userCollection.findOne({ alias: Alias });
}
function getUserBy_id(id) {
  return userCollection.findOne({ _id: id });
}
function getUserByToken(tokenPass) {
  return AuthTokenCollection.findOne({ token: tokenPass });
}
function getUserByPhoneNumber(phone_number){
  return userCollection.findOne({phone:phone_number});
}

async function createAuthTokenForUser(alias){
  var date = new Date(); // Now
  date.setDate(date.getDate() + 30);
  
  const authToken  = {
    token: uuid.v4(),
    alias: alias,
    expiriation: date,
  };
  await AuthTokenCollection.insertOne(authToken);

  return authToken;
}

async function createUser(profile_image_url, first_name,
                          last_name,preferred_name, share_pref_name, phone, share_phone,
                          email, share_email, alias, dob, gender, password) {
  // Hash the password before we insert it into the database
  const passwordHash = await bcrypt.hash(password, 10);
  const creation_date = new Date();
  const user = {
    profile_image_url: profile_image_url,
    first_name: first_name,
    last_name: last_name,
    preferred_name: preferred_name,
    share_pref_name: share_pref_name,
    phone: phone,
    share_phone: share_phone,
    email: email,
    share_email: share_email,
    alias: alias,
    dob: dob,
    gender: gender,
    password: passwordHash,
    creation_date: creation_date
  };
  await userCollection.insertOne(user);

  return user;
}

async function addMemberToOrg(orgUUID,memberUUID){
  await organizationsCollection.updateOne(
    { "_id": new ObjectId(orgUUID) }, // filter to match the document
    { $push: { "group_members": new ObjectId(memberUUID) } } // update to push the new member ID to the array
 )
 return true;
}

function addScore(score) {
  scoreCollection.insertOne(score);
}

function DeleteAuthToken(tokenPassed){
  AuthTokenCollection.deleteOne({token: tokenPassed});
}

async function getGroupsEnrollmentList(userID){
  const enrollmentListData = await organizations_Enrollment_Collection.find({enrollee_id: userID});
  const enrollmentList = await enrollmentListData.toArray();
  return enrollmentList;
}
//Create new enrollement for user:
async function enrollNewUser(groupUUID, memberUUID, standardRoleUUID){
  organizations_Enrollment_Collection.insertOne(
    {
       "group_enrollment_ID_Associated": new ObjectId(groupUUID),
       "enrollee_id": new ObjectId(memberUUID),
       "enrollment_date": new Date(),
       "roles": [new ObjectId(standardRoleUUID)]
    }
 )
 
}
async function addRoleToMemberInOrg(groupUUID, memberUUID, roleUUID){
  await organizations_Enrollment_Collection.updateOne(
    { 
       "_id": ObjectId(groupUUID),
       "enrollee_id": new ObjectId(memberUUID) 
    }, // filter to match the document with the given _id and enrollee_id
    { $push: { "roles": new ObjectId(roleUUID) } } // update to push the new role ID to the roles array
 )
}
async function removeRoleFromMemberInOrg(groupUUID,memberUUID,roleUUID){
  await organizations_Enrollment_Collection.updateOne(
    { 
       "_id": ObjectId(groupUUID),
       "enrollee_id": ObjectId(memberUUID) 
    }, // filter to match the document with the given _id and enrollee_id
    { $pull: { "roles": ObjectId(roleUUID) } } // update to remove the role ID from the roles array
 )
 return true;
}
async function getBaseMembershipIDFromOrgID(groupUUID){
  const baseMemberID = await organizationsCollection.findOne({_id: new ObjectId(groupUUID)}, {base_role: 1});
return baseMemberID.base_role.toString();
}

function getHighScores() {
  const query = {};
  const options = {
    sort: { score: -1 },
    limit: 10,
  };
  const cursor = scoreCollection.find(query, options);
  return cursor.toArray();
}

async function getOrgRoleByRoleID(roleID){
  const Role = await organizationRolesCollection.findOne({_id: roleID});
  return Role;

}

async function getOrgDoc(groupID){
  return await organizationsCollection.findOne({_id: new ObjectId(groupID)});
}
function getGroupLables(groupID){
  return null;
}
async function getOrgDocByJoinCode(joinCode){
  return await organizationsCollection.findOne({group_join_code: joinCode});
}

async function verifyUserInGroup(groupID, userID) {
  const directory = await organizationsCollection.findOne({ _id: new ObjectId(groupID) });
  const members = directory.group_members.map(member => member.toString());
  const userIDString = userID.toString();
  if (members.includes(userIDString)) {
    return true;
  }
  return false;
}
async function checkEnrollmentExists(groupId, userId) {
  const enrollment = await organizations_Enrollment_Collection.findOne({
    group_enrollment_ID_Associated: groupId,
    enrollee_id: userId,
  });
  return enrollment !== null;
}


async function getRolesIDsOfUserInGroup(userID,groupID){
  const EnrollementFound = await organizations_Enrollment_Collection.findOne({group_enrollment_ID_Associated: new ObjectId(groupID),enrollee_id: new ObjectId(userID)});
  const roleIDs = EnrollementFound.roles;
  return roleIDs;
}


async function getDirectoryUsersIDs(groupID) {
  const directory = await organizationsCollection.findOne({_id: new ObjectId(groupID)});
  
  let members = directory.group_members;
  //return members;
  if (!Array.isArray(members)) {
    members = members.split(',').map(member => ObjectId(member.trim()));
  }
 
  members = await userCollection.find({_id: {$in: members}},{
    _id: 1,
    profile_image_url: 1,
    first_name: 1,
    last_name: 1,
    preferred_name: 1,
    share_pref_name: 1,
    phone: 1,
    share_phone: 1,
    email: 1,
    share_email: 1,
    alias: 1,
    dob: 0,
    gender: 0,
    password: 0,
    creation_date:0
  
  }).toArray();
  return members;
}

async function getRequiredSurveysGroups(groupUUID) {
  const surveyIDsFound = await organizationSurveys
    .find({ is_required: true, group_origin: new ObjectId(groupUUID) }, { _id: 1 })
    .toArray();

  const surveyIDStrings = surveyIDsFound.map((survey) => survey._id.toString());
  console.log(surveyIDStrings);
  return surveyIDStrings;
}

async function checkDocumentExists(documentOwner, survey_origin) {
  //console.log("document_owner:", documentOwner);
  //console.log("survey_origin:", survey_origin);
  const documentExists = await organizationSurveys.findOne({
  survey_origin: new ObjectId(survey_origin),
  document_type: 'Questionnaire_Response',
  document_owner: new ObjectId(documentOwner),
  }, {_id: 1});

  //console.log("documentExists:", documentExists);
  
  return !documentExists;
}

async function addUserSubmission(submission){
  await organizationSurveys.insertOne(submission);
return true;
}



async function getSurveyHTML(groupUUID, survey_id){
  const survey_object = await organizationSurveys.findOne({group_origin: new ObjectId(groupUUID), _id: new ObjectId(survey_id)});
  return survey_object;
}

//For websockets:
async function getAllGroupMembers(memberId) {
  const result = await organizationsCollection.find(
     {
      "group_members": new ObjectId(memberId)
     },
     {
        "group_members": 1
     }
  );
  const allMembers = [];
  result.forEach(doc => {
     allMembers.push(...doc.group_members);
  });
  return allMembers;
}



const s3 = new AWS.S3();
function uploadImageToS3(imageData, bucketName, objectName) {
  // convert the image data to a buffer
  const fileContent = Buffer.from(imageData, 'base64');

  // set the parameters for the S3 upload
  const params = {
    Bucket: bucketName,
    Key: objectName,
    Body: fileContent
  };

  // upload the file to S3
  s3.upload(params, function(err, data) {
    if (err) {
      console.log("Error uploading image to S3:", err);
    } else {
      console.log("Successfully uploaded image to S3:", data.Location);
    }
  });
}

module.exports = {
  getAllGroupMembers,
  getUserByEmail,
  getUserBy_id,
  getUserByAlias,
  getUserByPhoneNumber,
  createAuthTokenForUser,
  getUserByToken,
  createUser,
  DeleteAuthToken,
  getOrgDocByJoinCode,
  addMemberToOrg,
  enrollNewUser,
  addScore,
  getHighScores,
  getDirectoryUsersIDs,
  verifyUserInGroup,
  checkEnrollmentExists,
  addRoleToMemberInOrg,
  removeRoleFromMemberInOrg,
  getOrgDoc,
  getGroupLables,
  uploadImageToS3,
  getGroupsEnrollmentList,
  getOrgRoleByRoleID,
  getRolesIDsOfUserInGroup,
  getBaseMembershipIDFromOrgID,
  getRequiredSurveysGroups,
  checkDocumentExists,
  getSurveyHTML,
  addUserSubmission,

};
