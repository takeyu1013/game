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

GitHubシークレットの反映:

```bash
spacetime login
spacetime login show --token
SPACETIMEDB_TOKEN='<token>' bun alchemy deploy stacks/github.ts
```

`<token>`は`Your auth token (don't share this!) is`のあとの値です。
