var admin = require("firebase-admin");

//var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(process.env.FIREBASE_KEY),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});


const db = admin.firestore();

module.exports = { admin, db };