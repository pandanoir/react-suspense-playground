import { StrictMode, Suspense, useState, useTransition } from 'react';
import { createRoot } from 'react-dom/client';
import { DemoLayout, Loading } from './DemoLayout';
import { UserPanels } from './UserPanels';
import { createUserStore } from './users';
import './style.css';

const updateMethods = [
  { value: 'normal', label: 'Normal' },
  { value: 'transition', label: 'Transition' },
  { value: 'reset', label: 'Reset key' },
] as const;
type Mode = (typeof updateMethods)[number]['value'];
type DemoProps = { delay: number; prefetch: boolean };

function NormalDemo({ delay, prefetch }: DemoProps) {
  const [store] = useState(createUserStore);
  const [id, setId] = useState(1);

  return (
    <DemoLayout selectedId={id} onSelect={setId} store={store}>
      <Suspense key="stable" fallback={<Loading />}>
        <UserPanels id={id} delay={delay} prefetch={prefetch} store={store} />
      </Suspense>
    </DemoLayout>
  );
}

function TransitionDemo({ delay, prefetch }: DemoProps) {
  const [store] = useState(createUserStore);
  const [id, setId] = useState(1);
  const [requestedId, setRequestedId] = useState(1);
  const [isPending, startTransition] = useTransition();

  function selectUser(nextId: number) {
    setRequestedId(nextId);
    startTransition(() => setId(nextId));
  }

  return (
    <DemoLayout
      selectedId={requestedId}
      onSelect={selectUser}
      store={store}
      isPending={isPending}
    >
      <Suspense key="stable" fallback={<Loading />}>
        <UserPanels id={id} delay={delay} prefetch={prefetch} store={store} />
      </Suspense>
    </DemoLayout>
  );
}

function ResetKeyDemo({ delay, prefetch }: DemoProps) {
  const [store] = useState(createUserStore);
  const [id, setId] = useState(1);
  const [requestedId, setRequestedId] = useState(1);
  const [isPending, startTransition] = useTransition();

  function selectUser(nextId: number) {
    setRequestedId(nextId);
    startTransition(() => setId(nextId));
  }

  return (
    <DemoLayout
      selectedId={requestedId}
      onSelect={selectUser}
      store={store}
      boundaryKey={id}
      isPending={isPending}
    >
      <Suspense key={id} fallback={<Loading />}>
        <UserPanels id={id} delay={delay} prefetch={prefetch} store={store} />
      </Suspense>
    </DemoLayout>
  );
}

const demos = {
  normal: NormalDemo,
  transition: TransitionDemo,
  reset: ResetKeyDemo,
};

function App() {
  const [mode, setMode] = useState<Mode>('transition');
  const [delay, setDelay] = useState(800);
  const [prefetch, setPrefetch] = useState(false);
  const [session, setSession] = useState(0);
  const Demo = demos[mode];

  function reset() {
    setSession((value) => value + 1);
  }
  return (
    <main>
      <div className="controls">
        <fieldset className="control-group">
          <legend>更新方法</legend>
          <div className="segments">
            {updateMethods.map(({ value, label }) => (
              <label key={value}>
                <input
                  type="radio"
                  name="mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => {
                    setMode(value);
                    reset();
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="control-group">
          <legend>待ち時間</legend>
          <div className="segments">
            {[
              { value: 800, label: '普通' },
              { value: 3000, label: '長め' },
            ].map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="delay"
                  value={option.value}
                  checked={delay === option.value}
                  onChange={() => {
                    setDelay(option.value);
                    reset();
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="button" onClick={reset}>
          キャッシュを削除
        </button>
      </div>
      <label className="prefetch">
        <input
          type="checkbox"
          checked={prefetch}
          onChange={(event) => {
            setPrefetch(event.target.checked);
            reset();
          }}
        />
        Activity で非表示の User を prefetch
      </label>
      <Demo key={session} delay={delay} prefetch={prefetch} />
    </main>
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
