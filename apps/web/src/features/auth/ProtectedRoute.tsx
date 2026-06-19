import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Spinner } from '@aura-grid/ui';
import { useAuth } from './useAuth.js';

/**
 * Guards routes that require a signed-in user. Guests/anonymous users are
 * redirected to /login. The game route allows guests (see allowGuest).
 */
export const ProtectedRoute = ({
  children,
  allowGuest = false,
}: {
  children: ReactNode;
  allowGuest?: boolean;
}) => {
  const { isLoading, isAuthenticated, isGuest } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (isAuthenticated || (allowGuest && isGuest)) {
    return <>{children}</>;
  }

  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
};
