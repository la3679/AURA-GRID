import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import type { SignupInput, UserProfile } from '@aura-grid/shared';
import { apiRequest } from '../../lib/apiClient.js';
import { getFirebaseAuth } from '../../lib/firebaseClient.js';

const requireAuth = () => {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Profile service is unavailable. Firebase is not configured.');
  }
  return auth;
};

/** Map raw Firebase auth error codes to friendly, safe messages. */
export const mapAuthError = (code: string): string => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 8 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Connection lost. Please try again.';
    default:
      return 'Authentication failed. Please try again.';
  }
};

export const signupWithProfile = async (input: SignupInput): Promise<UserProfile> => {
  const auth = requireAuth();
  const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
  await updateFirebaseProfile(cred.user, { displayName: input.callsign });

  // Bootstrap the Firestore profile via the secure backend (UID comes from token).
  return apiRequest<UserProfile>('/auth/session', {
    method: 'POST',
    auth: true,
    body: {
      displayName: input.callsign,
      callsign: input.callsign,
      selectedClass: input.selectedClass,
      auraColor: input.auraColor,
    },
  });
};

export const login = async (email: string, password: string): Promise<void> => {
  const auth = requireAuth();
  await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  const auth = requireAuth();
  await sendPasswordResetEmail(auth, email);
};

export const fetchProfile = (): Promise<UserProfile> =>
  apiRequest<UserProfile>('/users/me', { auth: true });

export const ensureSession = (): Promise<UserProfile> =>
  apiRequest<UserProfile>('/auth/session', { method: 'POST', auth: true, body: {} });
