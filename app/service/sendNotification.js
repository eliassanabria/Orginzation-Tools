const admin = require('./firebaseConfig');

async function sendNotification(title, body, url, targetTokens) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: {
      url: url,
    },
    tokens: targetTokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

module.exports = sendNotification;
