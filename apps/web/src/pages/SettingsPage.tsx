import { useNavigate } from 'react-router-dom';
import { Download, LogOut, Trash2 } from 'lucide-react';
import type { ThemePreference } from '@aura-grid/shared';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
} from '@aura-grid/ui';
import { useThemeStore } from '../features/theme/themeStore.js';
import { useSettingsStore } from '../features/settings/settingsStore.js';
import { useAuth } from '../features/auth/useAuth.js';
import { useAuthStore } from '../features/auth/authStore.js';
import { useMatchesQuery, useUpdateProfileMutation } from '../features/dashboard/hooks.js';
import { logout } from '../features/auth/authService.js';
import { toast } from '../features/toast/toastStore.js';

const Toggle = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
    </div>
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

const themeOptions: ThemePreference[] = ['dark', 'light', 'system'];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const settings = useSettingsStore();
  const { isAuthenticated, isGuest } = useAuth();
  const reset = useAuthStore((s) => s.reset);
  const clearGuest = useAuthStore((s) => s.clearGuest);
  const matches = useMatchesQuery();
  const updateProfile = useUpdateProfileMutation();

  const persistPref = (patch: Partial<typeof settings>) => {
    settings.set(patch);
    if (isAuthenticated) {
      updateProfile.mutate({
        preferences: {
          reducedMotion: patch.reducedMotion ?? settings.reducedMotion,
          soundEnabled: patch.soundEnabled ?? settings.soundEnabled,
          commentaryEnabled: patch.commentaryEnabled ?? settings.commentaryEnabled,
        },
      });
    }
  };

  const exportMatches = () => {
    const data = JSON.stringify(matches.data ?? [], null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aura-grid-matches.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Match history exported.');
  };

  const handleLogout = async () => {
    await logout();
    clearGuest();
    reset();
    navigate('/');
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title="Settings" description="Tune your experience on the Grid." />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm font-medium">Theme</p>
          <div className="flex gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setTheme(opt)}
                aria-pressed={theme === opt}
                className={`flex-1 rounded-lg border py-2 text-sm capitalize ${
                  theme === opt
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--border)] text-[var(--muted-foreground)]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gameplay</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-[var(--border)]">
          <Toggle
            label="Reduced motion"
            description="Minimize animations and transitions."
            checked={settings.reducedMotion}
            onChange={(v) => persistPref({ reducedMotion: v })}
          />
          <Toggle
            label="Sound"
            description="Subtle UI sound effects (off by default)."
            checked={settings.soundEnabled}
            onChange={(v) => persistPref({ soundEnabled: v })}
          />
          <Toggle
            label="AI commentary"
            description="Gemini-powered narration during matches."
            checked={settings.commentaryEnabled}
            onChange={(v) => persistPref({ commentaryEnabled: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="outline" onClick={exportMatches} disabled={isGuest}>
            <Download size={16} /> Export match history (JSON)
          </Button>
          {isGuest && (
            <Button
              variant="outline"
              onClick={() => {
                clearGuest();
                toast.info('Guest data cleared.');
                navigate('/');
              }}
            >
              <Trash2 size={16} /> Clear local guest data
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </Button>
          <p className="text-xs text-[var(--muted-foreground)]">
            Account deletion is available on request. See docs/FIREBASE_SETUP.md for the documented
            deletion flow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
