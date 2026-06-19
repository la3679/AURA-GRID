import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
} from 'firebase/auth';
import { appEnv } from './env.js';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/** Returns the Firebase Auth instance, or null when Firebase is not configured. */
export const getFirebaseAuth = (): Auth | null => {
  if (!appEnv.firebaseConfigured) return null;
  if (!auth) {
    app = initializeApp(appEnv.firebase);
    auth = getAuth(app);
  }
  return auth;
};

export const isFirebaseConfigured = (): boolean => appEnv.firebaseConfigured;
