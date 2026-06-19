import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useToastStore, type ToastTone } from './toastStore.js';

const icons: Record<ToastTone, typeof Info> = {
  default: Info,
  success: CheckCircle2,
  danger: TriangleAlert,
  warning: TriangleAlert,
};

const tones: Record<ToastTone, string> = {
  default: 'border-[var(--border)]',
  success: 'border-[var(--success)]',
  danger: 'border-[var(--danger)]',
  warning: 'border-[var(--warning)]',
};

export const ToastViewport = () => {
  const { toasts, dismiss } = useToastStore();
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = icons[t.tone];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border-l-4 bg-[var(--card)] p-3 text-sm text-[var(--card-foreground)] shadow-lg ${tones[t.tone]}`}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
