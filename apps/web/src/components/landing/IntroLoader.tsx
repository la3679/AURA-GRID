import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AuraGridLogo } from '../branding/AuraGridLogo.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

const STAGES = [
  'Initializing Aura Core',
  'Calibrating Split Engine',
  'Synchronizing Neural Grid',
  'Access Granted',
];

const SESSION_KEY = 'aura-grid:intro-seen';

/**
 * Brief boot sequence shown once per session. Respects reduced motion (shows a
 * static frame and exits quickly) and never blocks the user permanently.
 */
export const IntroLoader = () => {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(() => {
    if (typeof sessionStorage === 'undefined') return true;
    return sessionStorage.getItem(SESSION_KEY) !== '1';
  });
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!visible) return;
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(SESSION_KEY, '1');

    const stepMs = reduced ? 120 : 500;
    const timers = STAGES.map((_, i) => setTimeout(() => setStage(i), i * stepMs));
    const done = setTimeout(() => setVisible(false), STAGES.length * stepMs + 300);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [visible, reduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="aura-grid-bg fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-[var(--background)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          role="status"
          aria-label="Loading AURA-GRID"
        >
          <motion.div
            animate={reduced ? {} : { scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          >
            <AuraGridLogo variant="icon" className="h-16 w-16" />
          </motion.div>
          <div className="h-5 font-mono text-sm tracking-widest text-[var(--primary)]">
            {STAGES[stage]}
            <span className="animate-pulse">_</span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-xs text-[var(--muted-foreground)] underline hover:text-[var(--foreground)]"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
