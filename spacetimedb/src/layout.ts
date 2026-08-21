export const VIEW_WIDTH = 800 as const;
export const VIEW_HEIGHT = 450 as const;
export const GROUND_HEIGHT = 48 as const;
export const GROUND_Y = VIEW_HEIGHT - GROUND_HEIGHT;
export const PLAYER_WIDTH = 32 as const;
export const PLAYER_HEIGHT = 48 as const;
const SPAWN_ORIGIN_X = 48 as const;
const SPAWN_SPACING_X = PLAYER_WIDTH + 16;
export const SPAWN_Y = GROUND_Y - PLAYER_HEIGHT;

export const nextSpawnX = (players: Iterable<{ x: number }>) =>
  [...players]
    .map((row) => row.x + SPAWN_SPACING_X)
    .reduce((nextX, candidate) => Math.max(nextX, candidate), SPAWN_ORIGIN_X);
