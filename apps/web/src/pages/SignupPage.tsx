import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Input } from '@aura-grid/ui';
import { AURA_COLORS, CHARACTER_CLASSES, signupSchema } from '@aura-grid/shared';
import type { CharacterClassId } from '@aura-grid/shared';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { mapAuthError, signupWithProfile } from '../features/auth/authService.js';
import { useAuthStore } from '../features/auth/authStore.js';
import { isFirebaseConfigured } from '../lib/firebaseClient.js';
import { toast } from '../features/toast/toastStore.js';

export default function SignupPage() {
  const navigate = useNavigate();
  const setProfile = useAuthStore((s) => s.setProfile);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    callsign: '',
    selectedClass: 'TITAN' as CharacterClassId,
    auraColor: AURA_COLORS[0]!,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
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
      const profile = await signupWithProfile(parsed.data);
      setProfile(profile);
      toast.success('Operative registered. Welcome to the Grid.');
      navigate('/onboarding');
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      toast.error(code ? mapAuthError(code) : (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Register Operative" subtitle="Forge your callsign and choose your class.">
      {!isFirebaseConfigured() && (
        <p className="mb-4 rounded-lg border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-3 text-xs text-[var(--warning)]">
          Firebase is not configured. Signup requires backend credentials — you can still play as a
          guest from the landing page.
        </p>
      )}
      <Card>
        <CardContent className="pt-5">
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              error={errors.email}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                error={errors.password}
              />
              <Input
                label="Confirm"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
              />
            </div>
            <Input
              label="Callsign"
              hint="3–16 chars, uppercase letters, numbers, - or _"
              value={form.callsign}
              onChange={(e) => update('callsign', e.target.value.toUpperCase())}
              error={errors.callsign}
            />

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Class</legend>
              <div className="grid grid-cols-5 gap-2">
                {CHARACTER_CLASSES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => update('selectedClass', c.id)}
                    aria-pressed={form.selectedClass === c.id}
                    title={c.description}
                    className={`rounded-lg border p-2 text-[10px] font-semibold transition-colors ${
                      form.selectedClass === c.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'border-[var(--border)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    {c.id}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Aura color</legend>
              <div className="flex flex-wrap gap-2">
                {AURA_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => update('auraColor', color)}
                    aria-label={`Aura color ${color}`}
                    aria-pressed={form.auraColor === color}
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${
                      form.auraColor === color ? 'scale-110 border-[var(--foreground)]' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </fieldset>

            <Button type="submit" isLoading={submitting} className="w-full">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
        Already registered?{' '}
        <Link to="/login" className="text-[var(--primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
