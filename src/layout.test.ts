import { describe, it } from "@effect/vitest";
import { fail, fn } from "effect/Effect";
import { PLAYER_WIDTH, VIEW_WIDTH, nextX } from "../spacetimedb/src/layout";

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

const expectNextX = fn("expectNextX")(function* (row: (typeof cases)[number]) {
  const actual = nextX(row.x, row.left, row.right);
  if (actual === row.expected) {
    return;
  }
  return yield* fail(`${row.name}: ${actual} !== ${row.expected}`);
});

describe("nextX", () => {
  it.effect.each(cases)("$name", (row) => expectNextX(row));
});
