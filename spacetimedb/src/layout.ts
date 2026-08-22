export const VIEW_WIDTH = 800 as const;
export const VIEW_HEIGHT = 450 as const;
const WORLD_WIDTH = VIEW_WIDTH;
export const GROUND_HEIGHT = 48 as const;
export const GROUND_Y = VIEW_HEIGHT - GROUND_HEIGHT;
export const PLAYER_WIDTH = 32 as const;
export const PLAYER_HEIGHT = 48 as const;
const MOVE_SPEED = 240 as const;
const TICK_INTERVAL_MS = 50 as const;
export const TICK_INTERVAL_MICROS = BigInt(TICK_INTERVAL_MS) * 1000n;
const TICK_DT = TICK_INTERVAL_MS / 1000;
const SPAWN_ORIGIN_X = 48 as const;
const SPAWN_SPACING_X = PLAYER_WIDTH + 16;
export const SPAWN_Y = GROUND_Y - PLAYER_HEIGHT;
const MIN_X = 0 as const;
const MAX_X = WORLD_WIDTH - PLAYER_WIDTH;

export const nextSpawnX = (players: Iterable<{ x: number }>) =>
  [...players]
    .map((row) => row.x + SPAWN_SPACING_X)
    .reduce((nextX, candidate) => Math.max(nextX, candidate), SPAWN_ORIGIN_X);

const moveDirection = (left: boolean, right: boolean) => (right ? 1 : 0) - (left ? 1 : 0);

const clampX = (x: number) => Math.min(Math.max(x, MIN_X), MAX_X);

export const nextX = (x: number, left: boolean, right: boolean) =>
  clampX(x + moveDirection(left, right) * MOVE_SPEED * TICK_DT);
