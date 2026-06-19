import { useEffect, useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import {
  AURA_COLORS,
  CHARACTER_CLASSES,
  updateProfileSchema,
  type CharacterClassId,
} from '@aura-grid/shared';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  PageHeader,
} from '@aura-grid/ui';
import { useAuth } from '../features/auth/useAuth.js';
import { useProfileQuery, useUpdateProfileMutation } from '../features/dashboard/hooks.js';
import { toast } from '../features/toast/toastStore.js';

export default function ProfilePage() {
  const { isGuest } = useAuth();
  const profileQuery = useProfileQuery();
  const mutation = useUpdateProfileMutation();
  const profile = profileQuery.data;

  const [displayName, setDisplayName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClassId>('TITAN');
  const [auraColor, setAuraColor] = useState<string>(AURA_COLORS[0]!);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setCallsign(profile.callsign);
      setSelectedClass(profile.selectedClass);
      setAuraColor(profile.auraColor);
    }
  }, [profile]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const patch = { displayName, callsign, selectedClass, auraColor };
    const parsed = updateProfileSchema.safeParse(patch);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? '']),
        ),
      );
      return;
    }
    setErrors({});
    try {
      await mutation.mutateAsync(parsed.data);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (isGuest) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Profile" />
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-[var(--muted-foreground)]">
              Guests don't have a saved profile. Create an account to customize your operative.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" description="Customize your operative identity." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <Avatar name={callsign || 'OP'} color={auraColor} size={72} />
            <div>
              <p className="font-display text-lg font-semibold">{callsign}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{profile?.email}</p>
            </div>
            <Badge>{selectedClass}</Badge>
            {profile && (
              <p className="text-xs text-[var(--muted-foreground)]">
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
              <Input
                label="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                error={errors.displayName}
              />
              <Input
                label="Callsign"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                error={errors.callsign}
              />

              <fieldset>
                <legend className="mb-1.5 text-sm font-medium">Class</legend>
                <div className="grid grid-cols-5 gap-2">
                  {CHARACTER_CLASSES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedClass(c.id)}
                      aria-pressed={selectedClass === c.id}
                      title={c.description}
                      className={`rounded-lg border p-2 text-[10px] font-semibold ${
                        selectedClass === c.id
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
                      onClick={() => setAuraColor(color)}
                      aria-label={`Aura color ${color}`}
                      aria-pressed={auraColor === color}
                      className={`h-8 w-8 rounded-full border-2 ${
                        auraColor === color ? 'scale-110 border-[var(--foreground)]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </fieldset>

              <div>
                <Button type="submit" isLoading={mutation.isPending}>
                  <Save size={16} /> Save changes
                </Button>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Avatar upload requires Firebase Storage configuration. See docs/FIREBASE_SETUP.md.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
