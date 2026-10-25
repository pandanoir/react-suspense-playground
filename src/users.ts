export type User = {
  id: number;
  name: string;
  role: string;
  color: string;
  initials: string;
  bio: string;
};
export type Status = '未取得' | '取得中' | '取得済み' | 'エラー';

// A fresh store per experiment keeps old requests from affecting a reset demo.
export function createUserStore() {
  const cache = new Map<number, Promise<User>>();
  const statuses = new Map<number, Status>();
  const listeners = new Set<() => void>();
  let queued = false;
  function publish(id: number, status: Status) {
    statuses.set(id, status);
    // getUser can be called while rendering. Notify subscribers after that render.
    if (!queued) {
      queued = true;
      queueMicrotask(() => {
        queued = false;
        listeners.forEach((listener) => {
          listener();
        });
      });
    }
  }
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getStatus(id: number): Status {
      return statuses.get(id) ?? '未取得';
    },
    getUser(id: number, delay: number): Promise<User> {
      const cached = cache.get(id);
      if (cached) return cached;
      publish(id, '取得中');
      const promise = fetch(`/api/users/${id}?delay=${delay}`)
        .then((response) => {
          if (!response.ok) throw new Error('ユーザーの取得に失敗しました');
          return response.json() as Promise<User>;
        })
        .then((user) => {
          publish(id, '取得済み');
          return user;
        });
      // Observe rejection without leaving a hidden prefetch unhandled.
      void promise.catch(() => publish(id, 'エラー'));
      cache.set(id, promise);
      return promise;
    },
  };
}
export type UserStore = ReturnType<typeof createUserStore>;
