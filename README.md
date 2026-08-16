# game

Cloudflare WorkersへViteクライアントを配信します。ローカルではSpacetimeDBへ接続できます。`spacetime`は`devbox`で入ります。本番はMaincloudへ接続します。GitHubのデプロイではクライアントとあわせてモジュールも公開します。

```bash
bun install
spacetime start
```

別ターミナル:

```bash
bun run spacetime:publish:local
bun run dev
```

本番向けの公開:

```bash
spacetime login
bun run spacetime:publish
```

接続先は`VITE_SPACETIMEDB_URI`と`VITE_SPACETIMEDB_MODULE`です。デプロイは`bun run deploy`です。GitHub Actionsは公式の`spacetime`導入と`spacetime login --token`で`takeyu-game`へ公開します。`SPACETIMEDB_TOKEN`が必要です。値は`spacetime login show --token`です。
