import { Activity } from 'react';
import { UserProfile } from './UserProfile';
import type { UserStore } from './users';

export function UserPanels({
  id,
  delay,
  prefetch,
  store,
}: {
  id: number;
  delay: number;
  prefetch: boolean;
  store: UserStore;
}) {
  if (!prefetch) return <UserProfile id={id} delay={delay} store={store} />;

  return [1, 2, 3].map((userId) => (
    <Activity key={userId} mode={userId === id ? 'visible' : 'hidden'}>
      <UserProfile id={userId} delay={delay} store={store} />
    </Activity>
  ));
}
