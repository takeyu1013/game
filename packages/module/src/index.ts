import { ScheduleAt } from "spacetimedb";
import { schema, table, t } from "spacetimedb/server";
import { PLAYER_Y, TICK_HZ, WORLD_WIDTH, dirFromInput, stepX } from "@game/sim";

const TICK_MICROS = 1_000_000n / BigInt(TICK_HZ);

const player = table(
  { name: "player", public: true },
  {
    identity: t.identity().primaryKey(),
    x: t.f32(),
    y: t.f32(),
    dir: t.i32(),
    hue: t.u32(),
    online: t.bool(),
  },
);

const tick_timer = table(
  {
    name: "tick_timer",
    scheduled: (): any => tick,
  },
  {
    scheduled_id: t.u64().primaryKey().autoInc(),
    scheduled_at: t.scheduleAt(),
  },
);

const spacetimedb = schema({ player, tick_timer });
export default spacetimedb;

export const init = spacetimedb.init((ctx) => {
  ctx.db.tick_timer.insert({
    scheduled_id: 0n,
    scheduled_at: ScheduleAt.interval(TICK_MICROS),
  });
});

export const onConnect = spacetimedb.clientConnected((ctx) => {
  const existing = ctx.db.player.identity.find(ctx.sender);
  if (existing) {
    ctx.db.player.identity.update({
      ...existing,
      online: true,
      dir: 0,
    });
    return;
  }
  ctx.db.player.insert({
    identity: ctx.sender,
    x: WORLD_WIDTH / 2,
    y: PLAYER_Y,
    dir: 0,
    hue: ctx.random.integerInRange(0, 359),
    online: true,
  });
});

export const onDisconnect = spacetimedb.clientDisconnected((ctx) => {
  ctx.db.player.identity.delete(ctx.sender);
});

export const setInput = spacetimedb.reducer(
  { left: t.bool(), right: t.bool() },
  (ctx, { left, right }) => {
    const existing = ctx.db.player.identity.find(ctx.sender);
    if (!existing) {
      return;
    }
    ctx.db.player.identity.update({
      ...existing,
      dir: dirFromInput(left, right),
    });
  },
);

export const tick = spacetimedb.reducer({ timer: tick_timer.rowType }, (ctx, _payload) => {
  for (const row of ctx.db.player.iter()) {
    if (!row.online || row.dir === 0) {
      continue;
    }
    ctx.db.player.identity.update({
      ...row,
      x: stepX(row.x, row.dir),
    });
  }
});
