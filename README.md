# Suspense デモ

記事への埋め込みを想定した React + TypeScript + Vite の小さなデモ。

```sh
npm install
npm run dev
```

http://127.0.0.1:5173 を開く。

- Normal: 通常の `setId`。未取得の User への切替時に Loading を表示。
- Transition: `startTransition`。取得中は以前のプロフィールと Updating を表示。
- Reset key: Transition 内で更新し、`Suspense` の `key` を User ID にする。
- Activity prefetch: 同じ `Suspense` 内で各 User を `Activity` で囲み、選択中は `visible`、非選択は `hidden` にする。`use()` によるデータ取得と描画を先行させ、選択時はそのツリーを表示する。OFF では Activity を使わず、選択中の User だけを描画する。Reset key では外側の Suspense ごと作り直すため Activity のツリーもリセットされる（Promise キャッシュは残る）。

タブ名の「未取得 / 取得中 / 取得済み / エラー」は Promise キャッシュの状態を `useSyncExternalStore` で購読して表示する。hidden Activity では Effect がマウントされないため、子の Effect から通知しない。「取得済み」はデータ取得完了であり、Activity の描画完了を意味しない。選択していない User の「取得中」が prefetch の状況に相当する。

初回は全モードで Loading。キャッシュ済みの User は即表示。リセット・モード変更・prefetch 切替でキャッシュと選択を初期化する。待ち時間は普通（0.8秒）と長め（3秒）の2択。切替時もリセットする。Updating 中は表示中のプロフィールを薄くする。`isPending` は通信状態ではなく Transition の状態を示す。

`src/main.tsx` にデモの中心となる `App` と `NormalDemo` / `TransitionDemo` / `ResetKeyDemo`（設定、各モードの state・更新処理・Suspense）を置く。`DemoLayout.tsx` はタブ・待機状態などの共通表示、`UserPanels.tsx` は Activity による表示切替、`ErrorBoundary.tsx` はエラー表示、`UserProfile.tsx` はデータの読み取りとプロフィール表示、`UserTab.tsx` は取得状態の購読とタブ表示。`src/users.ts` が実験ごとの Promise キャッシュ。モック API は `server/users.ts` に共通化し、開発・preview では Vite のミドルウェア、本番では `worker/index.ts` から呼ぶ。外部 API・認証は不要。

```sh
npm run build
npm run preview
```

Cloudflare Workers に画面（Static Assets）と API をまとめてデプロイする。このクライアントキャッシュは学習用。

参考: https://react.dev/reference/react/Activity#pre-rendering-content-thats-not-visible-yet

## コード整形・チェック

Biome を使用。2スペース・80桁・シングルクォート。

```sh
npm run format        # 整形
npm run format:check  # 整形の確認
npm run lint          # lint
npm run check         # 整形・lint・import 順をまとめて確認
```

## デプロイ・自動更新

Node.js 24 を使用（`.node-version`）。Cloudflare Workers の Static Assets で `dist` を配信し、`/api/*` のみ Worker にルーティングする。`wrangler.jsonc` の Worker 名は `react-suspense-playground`。

- Pull request: Biome、API テスト、TypeScript / Vite ビルド、Worker の dry run。
- main への push: 同じチェックを通過後、Cloudflare Workers に自動デプロイ。
- 手動再実行: GitHub Actions の `CI and deploy` → `Run workflow`。

GitHub リポジトリの Actions secrets に以下を登録する。

- `CLOUDFLARE_API_TOKEN`: 対象アカウントに限定した「Edit Cloudflare Workers」テンプレートの API トークン。
- `CLOUDFLARE_ACCOUNT_ID`: 配信先の Cloudflare アカウント ID。

API トークンの作成: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/

初回公開のコマンド（新規リポジトリの場合のみ）。secrets を登録してから最初の push を行う。

```sh
git init -b main
git commit --allow-empty -m "chore: initialize repository"
git add .
git commit -m "feat: add React Suspense demo with automatic Cloudflare deployment"
gh repo create react-suspense-playground --public --source=. --remote=origin
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
git push -u origin main
gh run watch
```

`gh secret set` は値を対話入力する。成功後の公開 URL は Actions の deploy ログに表示される（`https://react-suspense-playground.<アカウントのサブドメイン>.workers.dev`）。

ローカルからデプロイする場合:

```sh
npx wrangler login
npm run deploy
```

ローカルで CI と同じ検証:

```sh
npm run check
npm test
npm run build
npm run deploy:check
```
