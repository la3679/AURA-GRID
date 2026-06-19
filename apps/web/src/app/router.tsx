import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Spinner } from '@aura-grid/ui';
import { ProtectedRoute } from '../features/auth/ProtectedRoute.js';
import { AppShell } from '../components/layout/AppShell.js';

const LandingPage = lazy(() => import('../pages/LandingPage.js'));
const LoginPage = lazy(() => import('../pages/LoginPage.js'));
const SignupPage = lazy(() => import('../pages/SignupPage.js'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage.js'));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage.js'));
const DashboardPage = lazy(() => import('../pages/DashboardPage.js'));
const GamePage = lazy(() => import('../pages/GamePage.js'));
const ProfilePage = lazy(() => import('../pages/ProfilePage.js'));
const SettingsPage = lazy(() => import('../pages/SettingsPage.js'));
const LeaderboardPage = lazy(() => import('../pages/LeaderboardPage.js'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.js'));

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Spinner size={28} />
  </div>
);

const Suspended = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

const ShellLayout = () => (
  <AppShell>
    <Outlet />
  </AppShell>
);

export const router = createBrowserRouter([
  { path: '/', element: <Suspended><LandingPage /></Suspended> },
  { path: '/login', element: <Suspended><LoginPage /></Suspended> },
  { path: '/signup', element: <Suspended><SignupPage /></Suspended> },
  { path: '/forgot-password', element: <Suspended><ForgotPasswordPage /></Suspended> },
  {
    element: (
      <ProtectedRoute>
        <ShellLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/onboarding', element: <Suspended><OnboardingPage /></Suspended> },
      { path: '/dashboard', element: <Suspended><DashboardPage /></Suspended> },
      { path: '/profile', element: <Suspended><ProfilePage /></Suspended> },
      { path: '/settings', element: <Suspended><SettingsPage /></Suspended> },
    ],
  },
  {
    element: (
      <ProtectedRoute allowGuest>
        <ShellLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/game', element: <Suspended><GamePage /></Suspended> },
      { path: '/leaderboard', element: <Suspended><LeaderboardPage /></Suspended> },
    ],
  },
  { path: '*', element: <Suspended><NotFoundPage /></Suspended> },
]);
