import { schema, t, table } from "spacetimedb/server";

const PLAYER_SPAWN_X = 64;
const PLAYER_SPAWN_GAP = 48;
const PLAYER_SPAWN_Y = 0;

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
  const occupied = Number(ctx.db.player.count());
  ctx.db.player.insert({
    identity: ctx.sender,
    x: PLAYER_SPAWN_X + occupied * PLAYER_SPAWN_GAP,
    y: PLAYER_SPAWN_Y,
  });
});

export const disconnected = spacetimedb.clientDisconnected((ctx) => {
  ctx.db.player.identity.delete(ctx.sender);
});

export default spacetimedb;
