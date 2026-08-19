import { schema, t, table } from "spacetimedb/server";
import { nextSpawnX, SPAWN_Y } from "./layout";

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
  ctx.db.player.insert({
    identity: ctx.sender,
    x: nextSpawnX(ctx.db.player),
    y: SPAWN_Y,
  });
});

export const disconnected = spacetimedb.clientDisconnected((ctx) => {
  ctx.db.player.identity.delete(ctx.sender);
});

export default spacetimedb;
