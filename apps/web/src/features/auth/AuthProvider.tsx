import { useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '../../lib/firebaseClient.js';
import { useAuthStore } from './authStore.js';
import { ensureSession } from './authService.js';

/**
 * Subscribes to Firebase auth state (the source of truth — no manual token storage).
 * On sign-in, bootstraps/loads the backend profile. Falls back to anonymous/guest
 * when Firebase is not configured.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { setStatus, setProfile, guest } = useAuthStore();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      // No Firebase — remain anonymous unless a guest session exists.
      setStatus(guest ? 'guest' : 'anonymous');
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus(useAuthStore.getState().guest ? 'guest' : 'anonymous');
        setProfile(null);
        return;
      }
      try {
        const profile = await ensureSession();
        setProfile(profile);
      } catch {
        setStatus('anonymous');
      }
    });
    return unsub;
  }, []);

  return <>{children}</>;
};
