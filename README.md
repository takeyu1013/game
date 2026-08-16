# game

Cloudflare WorkersへViteクライアントを配信します。ローカルではSpacetimeDBへ接続できます。

```bash
bun install
spacetime start
```

別ターミナル:

```bash
bun run module:publish
bun run dev
```

接続先は`VITE_SPACETIMEDB_URI`と`VITE_SPACETIMEDB_MODULE`です。デプロイは`bun run deploy`です。
