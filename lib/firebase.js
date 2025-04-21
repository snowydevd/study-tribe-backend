// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// check if firestore collection exists
async function checkIfCollectionExists(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).limit(1).get();
    if (!snapshot.empty) {
      console.log(`Collection ${collectionName} exists and is not empty.`);
      return true;
    } else {
      console.log(`Collection ${collectionName} exists but is empty.`);
      return true;
    }
  } catch (error) {
    console.error(
      `Error checking if collection ${collectionName} exists: ${error}`
    );
    return false;
  }
}

module.exports = { app, auth, db, checkIfCollectionExists };
