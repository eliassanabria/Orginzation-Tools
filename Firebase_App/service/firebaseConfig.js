const admin = require('firebase-admin');


const firebaseConfig = require('./FirebaseCreds.json');

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

module.exports = admin;
