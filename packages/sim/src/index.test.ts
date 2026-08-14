import { expect, test } from "bun:test";
import { PLAYER_WIDTH, WORLD_WIDTH, dirFromInput, stepX } from "./index.ts";

test("dirFromInput treats opposite keys as idle", () => {
  expect(dirFromInput(true, true)).toBe(0);
  expect(dirFromInput(false, false)).toBe(0);
  expect(dirFromInput(true, false)).toBe(-1);
  expect(dirFromInput(false, true)).toBe(1);
});

test("stepX stays on the ground line bounds", () => {
  const min = PLAYER_WIDTH / 2;
  const max = WORLD_WIDTH - PLAYER_WIDTH / 2;
  expect(stepX(min, -1)).toBe(min);
  expect(stepX(max, 1)).toBe(max);
  expect(stepX(400, 1)).toBeGreaterThan(400);
});
