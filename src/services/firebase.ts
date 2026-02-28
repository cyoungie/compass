/**
 * Firebase Auth + Firestore. Uses JS SDK (works with Expo).
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { config } from '../constants/config';

const firebaseConfig = {
  apiKey: config.firebaseApiKey,
  authDomain: config.firebaseAuthDomain,
  projectId: config.firebaseProjectId,
  storageBucket: config.firebaseStorageBucket,
  messagingSenderId: config.firebaseMessagingSenderId,
  appId: config.firebaseAppId,
};

export const isFirebaseConfigured =
  !!config.firebaseApiKey &&
  !!config.firebaseProjectId;

let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;

if (isFirebaseConfigured && getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else if (getApps().length > 0) {
  app = getApps()[0] as FirebaseApp;
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  auth = null as unknown as Auth;
  db = null as unknown as Firestore;
}

export { app, auth, db };
