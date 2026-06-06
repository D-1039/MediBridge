const admin = require("firebase-admin");

let initialized = false;

function initFirebase() {
  if (initialized) return admin;

  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn("Firebase not configured – image uploads will fail");
    return null;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  initialized = true;
  return admin;
}

function getBucket() {
  const app = initFirebase();
  if (!app) return null;
  return admin.storage().bucket();
}

module.exports = { initFirebase, getBucket, admin };
