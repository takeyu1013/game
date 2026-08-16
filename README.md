# game

Cloudflare WorkersへViteクライアントを配信します。ローカルではSpacetimeDBへ接続できます。`spacetime`は`devbox`で入ります。

```bash
bun install
spacetime start
```

別ターミナル:

```bash
bun run spacetime:publish:local
bun run dev
```

接続先は`VITE_SPACETIMEDB_URI`と`VITE_SPACETIMEDB_MODULE`です。デプロイは`bun run deploy`です。
