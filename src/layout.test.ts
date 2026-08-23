import { describe, it } from "@effect/vitest";
import { fail, fn } from "effect/Effect";
import {
  PLAYER_WIDTH,
  SPAWN_Y,
  VIEW_WIDTH,
  applyJump,
  nextVertical,
  nextX,
} from "../spacetimedb/src/layout";

const MIN_X = 0 as const;
const MAX_X = VIEW_WIDTH - PLAYER_WIDTH;

const cases = [
  { name: "左端で左", x: MIN_X, left: true, right: false, expected: MIN_X },
  { name: "右端で右", x: MAX_X, left: false, right: true, expected: MAX_X },
  { name: "右移動", x: 100, left: false, right: true, expected: 112 },
  { name: "左移動", x: 100, left: true, right: false, expected: 88 },
  { name: "同時押し", x: 100, left: true, right: true, expected: 100 },
  { name: "無入力", x: 100, left: false, right: false, expected: 100 },
  { name: "左端近くで左", x: 5, left: true, right: false, expected: MIN_X },
  { name: "右端近くで右", x: MAX_X - 5, left: false, right: true, expected: MAX_X },
] as const;

const verticalCases = [
  { name: "接地で無入力", y: SPAWN_Y, vy: 0, jump: false, expectedY: SPAWN_Y, expectedVy: 0 },
  { name: "接地でジャンプ", y: SPAWN_Y, vy: 0, jump: true, expectedY: 330, expectedVy: -480 },
  { name: "空中で重力", y: 330, vy: -480, jump: false, expectedY: 309, expectedVy: -420 },
  { name: "空中でジャンプ無効", y: 330, vy: -480, jump: true, expectedY: 309, expectedVy: -420 },
  { name: "着地", y: 350, vy: 200, jump: false, expectedY: SPAWN_Y, expectedVy: 0 },
  { name: "空中で落下開始", y: 300, vy: 0, jump: false, expectedY: 303, expectedVy: 60 },
] as const;

const jumpCases = [
  { name: "接地でジャンプ入力", y: SPAWN_Y, vy: 0, jump: true, expected: -480 },
  { name: "空中でジャンプ入力", y: 300, vy: -100, jump: true, expected: -100 },
  { name: "接地でジャンプ解除", y: SPAWN_Y, vy: -480, jump: false, expected: -480 },
] as const;

const expectNextX = fn("expectNextX")(function* (row: (typeof cases)[number]) {
  const actual = nextX(row.x, row.left, row.right);
  if (actual === row.expected) {
    return;
  }
  return yield* fail(`${row.name}: ${actual} !== ${row.expected}`);
});

const expectNextVertical = fn("expectNextVertical")(function* (
  row: (typeof verticalCases)[number],
) {
  const actual = nextVertical(row.y, row.vy, row.jump);
  if (actual.y === row.expectedY && actual.vy === row.expectedVy) {
    return;
  }
  return yield* fail(
    `${row.name}: ${actual.y},${actual.vy} !== ${row.expectedY},${row.expectedVy}`,
  );
});

const expectApplyJump = fn("expectApplyJump")(function* (row: (typeof jumpCases)[number]) {
  const actual = applyJump(row.y, row.vy, row.jump);
  if (actual === row.expected) {
    return;
  }
  return yield* fail(`${row.name}: ${actual} !== ${row.expected}`);
});

const expectAirInertia = fn("expectAirInertia")(function* () {
  const x = nextX(100, false, true);
  const vertical = nextVertical(300, 0, false);
  if (x === 112 && vertical.y === 303 && vertical.vy === 60) {
    return;
  }
  return yield* fail(`空中で右: ${x},${vertical.y},${vertical.vy} !== 112,303,60`);
});

describe("nextX", () => {
  it.effect.each(cases)("$name", (row) => expectNextX(row));
});

describe("nextVertical", () => {
  it.effect.each(verticalCases)("$name", (row) => expectNextVertical(row));
});

describe("applyJump", () => {
  it.effect.each(jumpCases)("$name", (row) => expectApplyJump(row));
});

describe("空中慣性", () => {
  it.effect("空中で右", () => expectAirInertia());
});
