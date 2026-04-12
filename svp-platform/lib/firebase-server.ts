/**
 * Firebase Server-Side Configuration
 * 
 * This module provides Firebase Firestore access for API routes.
 * It initializes Firebase with the client SDK but is designed for server-side use.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let serverApp: FirebaseApp | null = null;
let serverDb: Firestore | null = null;

function initializeServerFirebase(): Firestore | null {
  // Return cached instance if available
  if (serverDb) {
    return serverDb;
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Check if we have valid config
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase Server: Missing required environment variables");
    console.error("NEXT_PUBLIC_FIREBASE_API_KEY:", firebaseConfig.apiKey ? "set" : "missing");
    console.error("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", firebaseConfig.projectId ? "set" : "missing");
    return null;
  }

  try {
    // Use existing app or create new one
    serverApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    serverDb = getFirestore(serverApp);
    return serverDb;
  } catch (error) {
    console.error("Error initializing Firebase Server:", error);
    return null;
  }
}

export function getServerDb(): Firestore | null {
  return initializeServerFirebase();
}

export { serverApp, serverDb };
