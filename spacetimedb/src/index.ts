import { ScheduleAt, schema, SenderError, t, table } from "spacetimedb/server";
import { nextSpawnX, nextX, SPAWN_Y, TICK_INTERVAL_MICROS } from "./layout";

const player = table(
  { name: "player", public: true },
  {
    identity: t.identity().primaryKey(),
    x: t.f32(),
    y: t.f32(),
    left: t.bool(),
    right: t.bool(),
  },
);

const tickSchedule = table(
  { name: "tick_schedule" },
  {
    scheduledId: t.u64().primaryKey().autoInc(),
    scheduledAt: t.scheduleAt(),
  },
);

const spacetimedb = schema({ player, tickSchedule });

const ensureTickSchedule = (rows: {
  count: () => bigint;
  insert: (row: {
    scheduledId: bigint;
    scheduledAt: ReturnType<typeof ScheduleAt.interval>;
  }) => void;
}) => {
  if (rows.count() !== 0n) {
    return;
  }
  rows.insert({
    scheduledId: 0n,
    scheduledAt: ScheduleAt.interval(TICK_INTERVAL_MICROS),
  });
};

export const init = spacetimedb.init((ctx) => {
  ensureTickSchedule(ctx.db.tickSchedule);
});

export const connected = spacetimedb.clientConnected((ctx) => {
  ensureTickSchedule(ctx.db.tickSchedule);
  if (ctx.db.player.identity.find(ctx.sender) !== null) {
    return;
  }
  ctx.db.player.insert({
    identity: ctx.sender,
    x: nextSpawnX(ctx.db.player),
    y: SPAWN_Y,
    left: false,
    right: false,
  });
});

export const disconnected = spacetimedb.clientDisconnected((ctx) => {
  ctx.db.player.identity.delete(ctx.sender);
});

export const setInput = spacetimedb.reducer(
  { left: t.bool(), right: t.bool() },
  (ctx, { left, right }) => {
    const row = ctx.db.player.identity.find(ctx.sender);
    if (row === null) {
      return;
    }
    if (row.left === left && row.right === right) {
      return;
    }
    ctx.db.player.identity.update({ ...row, left, right });
  },
);

export const tick = spacetimedb.reducer(
  { onSchedule: tickSchedule },
  { tickSchedule: tickSchedule.rowType },
  (ctx) => {
    if (!ctx.senderAuth.isInternal) {
      throw new SenderError("tick is internal");
    }
    for (const row of ctx.db.player) {
      const x = nextX(row.x, row.left, row.right);
      if (x === row.x) {
        continue;
      }
      ctx.db.player.identity.update({ ...row, x });
    }
  },
);

export default spacetimedb;
