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
  const expiriation = new Date() + 30;
  const authToken  = {
    token: uuid.v4(),
    alias: alias,
    expiriation: expiriation,
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
  return await organizationsCollection.findOne({_id: ObjectId(groupID)});
}
function getGroupLables(groupID){
  return null;
}

async function verifyUserInGroup(groupID, userID) {
  const directory = await organizationsCollection.findOne({ _id: ObjectId(groupID) });
  const members = directory.group_members.map(member => member.toString());
  const userIDString = userID.toString();
  if (members.includes(userIDString)) {
    return true;
  }
  return false;
}


async function getDirectoryUsersIDs(groupID) {
  const directory = await organizationsCollection.findOne({_id: ObjectId(groupID)});
  
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
  getUserByEmail,
  getUserBy_id,
  getUserByAlias,
  getUserByPhoneNumber,
  createAuthTokenForUser,
  getUserByToken,
  createUser,
  DeleteAuthToken,
  addScore,
  getHighScores,
  getDirectoryUsersIDs,
  verifyUserInGroup,
  getOrgDoc,
  getGroupLables,
  uploadImageToS3,
  getGroupsEnrollmentList,
  getOrgRoleByRoleID,
};
