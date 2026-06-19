import { AuthError, ExternalServiceError } from '../../utils/errors.js';
import { getAdminAuth, isFirebaseConfigured } from './firebaseAdmin.js';

export interface VerifiedUser {
  uid: string;
  email: string;
}

/**
 * Verify a Firebase ID token and return the trusted UID. The UID is ALWAYS taken
 * from the verified token — never from client-provided values.
 */
export const verifyIdToken = async (token: string): Promise<VerifiedUser> => {
  if (!isFirebaseConfigured()) {
    throw new ExternalServiceError(
      'Authentication service is not configured. Set Firebase Admin credentials.',
    );
  }
  const auth = await getAdminAuth();
  if (!auth) {
    throw new ExternalServiceError('Authentication service is temporarily unavailable.');
  }
  try {
    const decoded = await auth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? '' };
  } catch {
    throw new AuthError('Invalid or expired authentication token.');
  }
};
