# 横スク最小プロトタイプ

直線の地面の上で、複数の矩形プレイヤーが左右に移動する単一世界です。

- 世界: SpacetimeDB（ローカルまたは Maincloud）
- セッション: Effect 4
- クライアント: React
- 描画: Phaser 4
- 配信: Cloudflare Workers（Alchemy）

クライアントの SpacetimeDB スキーマは `packages/client/src/effect/db-connection.ts` に手書きしています。`spacetime generate` の生成物はコミットせず、もしローカルで出したとしてもケバブケースや lint の対象外です。

## 準備

```bash
bun install
spacetime start
```

別ターミナル:

```bash
bun run module:publish
bun run dev
```

ブラウザを 2 つ開き、矢印キー左右で移動します。

接続先は `VITE_SPACETIMEDB_URI`（既定 `ws://127.0.0.1:3000`）と `VITE_SPACETIMEDB_MODULE`（既定 `game`）です。

## デプロイ

クライアントは Alchemy 経由で Cloudflare Workers に載せます。

```bash
bun run deploy
```

本番の SpacetimeDB 接続先は `alchemy deploy` 時の `VITE_SPACETIMEDB_URI` と `VITE_SPACETIMEDB_MODULE` で渡します。
