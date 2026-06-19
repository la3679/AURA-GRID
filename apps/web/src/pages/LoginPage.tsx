import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Input } from '@aura-grid/ui';
import { loginSchema } from '@aura-grid/shared';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { login, mapAuthError } from '../features/auth/authService.js';
import { isFirebaseConfigured } from '../lib/firebaseClient.js';
import { toast } from '../features/toast/toastStore.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? '']),
        ),
      );
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Neural link established.');
      navigate('/dashboard');
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      toast.error(mapAuthError(code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Enter the Grid" subtitle="Sign in to resume your campaign.">
      {!isFirebaseConfigured() && (
        <p className="mb-4 rounded-lg border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-3 text-xs text-[var(--warning)]">
          Firebase is not configured. Add credentials to enable login, or play as a guest from the
          landing page.
        </p>
      )}
      <Card>
        <CardContent className="pt-5">
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-[var(--primary)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" isLoading={submitting} className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
        New operative?{' '}
        <Link to="/signup" className="text-[var(--primary)] hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
