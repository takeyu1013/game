# 横スク最小プロトタイプ

直線の地面の上で、複数の矩形プレイヤーが左右に移動する単一世界です。

- 世界: SpacetimeDB
- セッション: Effect 4
- クライアント: React, Phaser 4
- 配信: Cloudflare Workers（Alchemy）

`spacetime`は`devbox`で入ります。本番はMaincloudへ接続します。GitHubのデプロイではクライアントとあわせてモジュールも公開します。

```bash
bun install
spacetime start
```

別ターミナル:

```bash
bun run spacetime:publish:local
bun run dev
```

矢印キー左右で移動します。接続先は`VITE_SPACETIMEDB_URI`と`VITE_SPACETIMEDB_MODULE`です。

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
