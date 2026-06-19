import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, Input } from '@aura-grid/ui';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { mapAuthError, resetPassword } from '../features/auth/authService.js';
import { toast } from '../features/toast/toastStore.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Reset signal transmitted. Check your inbox.');
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      toast.error(code ? mapAuthError(code) : (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Recover Access" subtitle="We'll send a reset link to your email.">
      <Card>
        <CardContent className="pt-5">
          {sent ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              If an account exists for <span className="text-[var(--foreground)]">{email}</span>, a
              password reset link is on its way.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" isLoading={submitting} className="w-full">
                Send Reset Link
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
        <Link to="/login" className="text-[var(--primary)] hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
