import { use } from 'react';
import type { UserStore } from './users';

export function UserProfile({
  id,
  delay,
  store,
}: {
  id: number;
  delay: number;
  store: UserStore;
}) {
  const user = use(store.getUser(id, delay));
  return (
    <article className="profile">
      <div className="avatar" style={{ background: user.color }}>
        {user.initials}
      </div>
      <div>
        <h2>{user.name}</h2>
        <p>{user.role}</p>
        <p>{user.bio}</p>
      </div>
    </article>
  );
}
