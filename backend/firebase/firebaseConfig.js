// firebase/firebaseConfig.js
const admin = require('firebase-admin');
const serviceAccount = require('../firebaseServiceKey.json'); // your downloaded file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
