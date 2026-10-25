import { useSyncExternalStore } from 'react';
import type { UserStore } from './users';

export function UserTab({
  id,
  selected,
  store,
  onClick,
}: {
  id: number;
  selected: boolean;
  store: UserStore;
  onClick: () => void;
}) {
  const status = useSyncExternalStore(store.subscribe, () =>
    store.getStatus(id),
  );
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={selected ? 'selected' : ''}
      onClick={onClick}
    >
      User {id}
      <small>{status}</small>
    </button>
  );
}
