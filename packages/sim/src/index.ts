export const TICK_HZ = 20;
export const TICK_DT = 1 / TICK_HZ;
export const MOVE_SPEED = 220;
export const WORLD_WIDTH = 800;
export const WORLD_HEIGHT = 450;
export const GROUND_HEIGHT = 24;
export const GROUND_Y = WORLD_HEIGHT - GROUND_HEIGHT;
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 48;
export const PLAYER_Y = GROUND_Y - PLAYER_HEIGHT / 2;

export function dirFromInput(left: boolean, right: boolean): number {
  if (left === right) {
    return 0;
  }
  return left ? -1 : 1;
}

export function stepX(x: number, dir: number): number {
  const min = PLAYER_WIDTH / 2;
  const max = WORLD_WIDTH - PLAYER_WIDTH / 2;
  return Math.min(max, Math.max(min, x + dir * MOVE_SPEED * TICK_DT));
}
