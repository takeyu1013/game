import { schema, t, table } from "spacetimedb/server";

const player = table(
  { name: "player", public: true },
  {
    identity: t.identity().primaryKey(),
    x: t.f32(),
    y: t.f32(),
  },
);

const spacetimedb = schema({ player });

export const connected = spacetimedb.clientConnected((ctx) => {
  if (ctx.db.player.identity.find(ctx.sender) !== null) {
    return;
  }
  ctx.db.player.insert({ identity: ctx.sender, x: 0, y: 0 });
});

export const disconnected = spacetimedb.clientDisconnected((ctx) => {
  ctx.db.player.identity.delete(ctx.sender);
});

export default spacetimedb;
