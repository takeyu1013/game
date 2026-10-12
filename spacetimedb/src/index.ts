import { ScheduleAt, schema, t, table } from "spacetimedb/server";
import {
  applyJump,
  nextSpawnX,
  nextVertical,
  nextX,
  SPAWN_Y,
  TICK_INTERVAL_MICROS,
} from "./layout";

const player = table(
  { name: "player", public: true },
  {
    identity: t.identity().primaryKey(),
    x: t.f32(),
    y: t.f32(),
    vy: t.f32(),
    left: t.bool(),
    right: t.bool(),
    jump: t.bool(),
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
    vy: 0,
    left: false,
    right: false,
    jump: false,
  });
});

export const disconnected = spacetimedb.clientDisconnected((ctx) => {
  ctx.db.player.identity.delete(ctx.sender);
});

const sameInput = (
  row: { left: boolean; right: boolean; jump: boolean },
  left: boolean,
  right: boolean,
  jump: boolean,
) => row.left === left && row.right === right && row.jump === jump;

export const setInput = spacetimedb.reducer(
  { left: t.bool(), right: t.bool(), jump: t.bool() },
  (ctx, { left, right, jump }) => {
    const row = ctx.db.player.identity.find(ctx.sender);
    if (row === null) {
      return;
    }
    const vy = applyJump(row.y, row.vy, jump);
    if (sameInput(row, left, right, jump) && vy === row.vy) {
      return;
    }
    ctx.db.player.identity.update({ ...row, left, right, jump, vy });
  },
);

export const tick = spacetimedb.reducer(
  { onSchedule: tickSchedule },
  { tickSchedule: tickSchedule.rowType },
  (ctx) => {
    [...ctx.db.player].forEach((row) => {
      const x = nextX(row.x, row.left, row.right);
      const { y, vy } = nextVertical(row.y, row.vy, row.jump);
      if (x === row.x && y === row.y && vy === row.vy) {
        return;
      }
      ctx.db.player.identity.update({ ...row, x, y, vy });
    });
  },
);

export default spacetimedb;
