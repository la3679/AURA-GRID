import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

// firebase-admin is imported lazily so the API can boot (and tests can run)
// without credentials. Types are kept loose to avoid a hard dependency at build.
/* eslint-disable @typescript-eslint/no-explicit-any */
let app: any = null;
let authInstance: any = null;
let firestoreInstance: any = null;
let initFailed = false;

const ensureApp = async (): Promise<any | null> => {
  if (app || initFailed) return app;
  if (!env.firebase.configured) return null;
  try {
    const admin = await import('firebase-admin');
    const appMod: any = admin.default ?? admin;
    if (appMod.apps?.length) {
      app = appMod.apps[0];
    } else {
      app = appMod.initializeApp({
        credential: appMod.credential.cert({
          projectId: env.firebase.projectId,
          clientEmail: env.firebase.clientEmail,
          privateKey: env.firebase.privateKey,
        }),
      });
    }
    return app;
  } catch (err) {
    initFailed = true;
    logger.error('Firebase Admin initialization failed', { message: (err as Error).message });
    return null;
  }
};

export const getAdminAuth = async (): Promise<any | null> => {
  const initialized = await ensureApp();
  if (!initialized) return null;
  if (!authInstance) {
    const admin = await import('firebase-admin');
    authInstance = (admin.default ?? admin).auth();
  }
  return authInstance;
};

export const getFirestore = async (): Promise<any | null> => {
  const initialized = await ensureApp();
  if (!initialized) return null;
  if (!firestoreInstance) {
    const admin = await import('firebase-admin');
    firestoreInstance = (admin.default ?? admin).firestore();
  }
  return firestoreInstance;
};

export const isFirebaseConfigured = (): boolean => env.firebase.configured && !initFailed;
/* eslint-enable @typescript-eslint/no-explicit-any */
