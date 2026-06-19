import { Link } from 'react-router-dom';
import { Button } from '@aura-grid/ui';
import { AuraGridLogo } from '../components/branding/AuraGridLogo.js';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <AuraGridLogo variant="icon" className="opacity-60" />
      <h1 className="font-display text-4xl font-bold">404</h1>
      <p className="text-[var(--muted-foreground)]">This sector of the Grid does not exist.</p>
      <Link to="/">
        <Button>Return to base</Button>
      </Link>
    </div>
  );
}
