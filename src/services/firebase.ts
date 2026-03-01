/**
 * Firebase Auth + Firestore. Uses JS SDK (works with Expo).
 * Auth state is persisted with AsyncStorage so sign-in survives app restarts.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../constants/config';

// RN persistence: getReactNativePersistence lives in @firebase/auth RN build
const { initializeAuth, getReactNativePersistence } = require('@firebase/auth');

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
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch (e) {
    // AsyncStorage native module not linked (e.g. dev build not rebuilt after pod install)
    console.warn('[Firebase] AsyncStorage persistence unavailable, using memory-only auth:', e);
    auth = getAuth(app);
  }
  db = getFirestore(app);
} else if (getApps().length > 0) {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  auth = null as unknown as Auth;
  db = null as unknown as Firestore;
}

export { app, auth, db };
