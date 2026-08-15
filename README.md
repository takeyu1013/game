# 横スク最小プロトタイプ

直線の地面の上で、複数の矩形プレイヤーが左右に移動する単一世界です。

- 世界: SpacetimeDB
- セッション: Effect 4
- クライアント: React, Phaser 4
- 配信: Cloudflare Workers（Alchemy）

```bash
bun install
spacetime start
```

別ターミナル:

```bash
bun run module:publish
bun run dev
```

矢印キー左右で移動します。接続先は`VITE_SPACETIMEDB_URI`と`VITE_SPACETIMEDB_MODULE`です。デプロイは`bun run deploy`です。
