import { useState } from 'react';
import type { GameLog } from '@aura-grid/shared';
import { Tabs } from '@aura-grid/ui';

type Filter = 'all' | 'move' | 'ai' | 'sys';

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'move', label: 'Moves' },
  { id: 'ai', label: 'AI' },
  { id: 'sys', label: 'System' },
];

const toneFor = (type: GameLog['type']): string => {
  switch (type) {
    case 'ai':
      return 'text-[var(--accent)]';
    case 'event':
      return 'text-[var(--warning)]';
    case 'move':
      return 'text-[var(--primary)]';
    default:
      return 'text-[var(--muted-foreground)]';
  }
};

export const CommentaryPanel = ({ logs }: { logs: GameLog[] }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const visible = logs.filter((l) => {
    if (filter === 'all') return true;
    if (filter === 'sys') return l.type === 'sys' || l.type === 'event';
    return l.type === filter;
  });

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Process Logs</h3>
        <Tabs
          tabs={filterTabs}
          value={filter}
          onChange={(id) => setFilter(id as Filter)}
          className="scale-90"
        />
      </div>
      <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto font-mono text-xs" aria-live="polite">
        {visible.length === 0 ? (
          <li className="text-[var(--muted-foreground)]">No entries.</li>
        ) : (
          visible.map((log) => (
            <li key={log.id} className={toneFor(log.type)}>
              <span className="opacity-50">{'> '}</span>
              {log.msg}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
