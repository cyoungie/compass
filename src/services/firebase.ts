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
const firebaseAuth = require('@firebase/auth');
const getReactNativePersistence = (firebaseAuth.getReactNativePersistence ?? null) as ((storage: typeof ReactNativeAsyncStorage) => unknown) | null;

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
    if (getReactNativePersistence) {
      auth = firebaseAuth.initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });
    } else {
      auth = getAuth(app);
    }
  } catch (e) {
    console.warn('[Firebase] Auth init failed, using default:', e);
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
