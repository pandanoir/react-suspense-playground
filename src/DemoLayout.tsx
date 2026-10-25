import type { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { UserTab } from './UserTab';
import type { UserStore } from './users';

export function DemoLayout({
  selectedId,
  onSelect,
  store,
  boundaryKey = 'stable',
  isPending = false,
  children,
}: {
  selectedId: number;
  onSelect: (id: number) => void;
  store: UserStore;
  boundaryKey?: string | number;
  isPending?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <div className="tabs">
        {[1, 2, 3].map((id) => (
          <UserTab
            key={id}
            id={id}
            selected={selectedId === id}
            store={store}
            onClick={() => onSelect(id)}
          />
        ))}
      </div>
      <div className="metadata">
        <code>key={JSON.stringify(boundaryKey)}</code>
        <span role="status">{isPending ? 'Updating…' : '\u00a0'}</span>
      </div>
      <div className="content" aria-busy={isPending}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </>
  );
}

export function Loading() {
  return (
    <p className="loading" role="status">
      Loading…
    </p>
  );
}
