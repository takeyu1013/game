export const VIEW_WIDTH = 800 as const;
export const VIEW_HEIGHT = 450 as const;
export const WORLD_WIDTH = VIEW_WIDTH;
export const GROUND_HEIGHT = 48 as const;
export const GROUND_Y = VIEW_HEIGHT - GROUND_HEIGHT;
export const PLAYER_WIDTH = 32 as const;
export const PLAYER_HEIGHT = 48 as const;
export const MOVE_SPEED = 240 as const;
export const TICK_INTERVAL_MS = 50 as const;
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

export const moveDirection = (left: boolean, right: boolean) => (right ? 1 : 0) - (left ? 1 : 0);

export const clampX = (x: number) => Math.min(Math.max(x, MIN_X), MAX_X);

export const nextX = (x: number, left: boolean, right: boolean) =>
  clampX(x + moveDirection(left, right) * MOVE_SPEED * TICK_DT);

const bunMain = (globalThis as { Bun?: { main?: string } }).Bun?.main?.replaceAll("\\", "/");
if (bunMain?.endsWith("/layout.ts") === true) {
  const cases = [
    { name: "左端で左", x: MIN_X, left: true, right: false, expected: MIN_X },
    { name: "右端で右", x: MAX_X, left: false, right: true, expected: MAX_X },
    { name: "右移動", x: 100, left: false, right: true, expected: 112 },
    { name: "左移動", x: 100, left: true, right: false, expected: 88 },
    { name: "同時押し", x: 100, left: true, right: true, expected: 100 },
    { name: "無入力", x: 100, left: false, right: false, expected: 100 },
    { name: "左端近くで左", x: 5, left: true, right: false, expected: MIN_X },
    { name: "右端近くで右", x: MAX_X - 5, left: false, right: true, expected: MAX_X },
  ];
  for (const row of cases) {
    const actual = nextX(row.x, row.left, row.right);
    if (actual !== row.expected) {
      throw new Error(`${row.name}: ${actual} !== ${row.expected}`);
    }
  }
  console.log("layout tests ok");
}
