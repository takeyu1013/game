export const VIEW_WIDTH = 800;
export const VIEW_HEIGHT = 450;
export const GROUND_HEIGHT = 48;
export const GROUND_Y = VIEW_HEIGHT - GROUND_HEIGHT;
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 48;
const SPAWN_ORIGIN_X = 48;
const SPAWN_SPACING_X = PLAYER_WIDTH + 16;
export const SPAWN_Y = GROUND_Y - PLAYER_HEIGHT;

export const nextSpawnX = (players: Iterable<{ x: number }>) => {
  let nextX = SPAWN_ORIGIN_X;
  for (const row of players) {
    const candidate = row.x + SPAWN_SPACING_X;
    if (candidate > nextX) {
      nextX = candidate;
    }
  }
  return nextX;
};
