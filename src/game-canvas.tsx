import { Application, extend } from "@pixi/react";
import { fromNullishOr, match } from "effect/Option";
import { Graphics } from "pixi.js";
import { useCallback, useRef } from "react";
import { useReducer } from "spacetimedb/react";
import {
  GROUND_HEIGHT,
  GROUND_Y,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "../spacetimedb/src/layout";
import { reducers } from "./module-bindings";
import type { Player } from "./module-bindings/types";
import { bindPlayerInput } from "./player-input";

extend({ Graphics });

const SKY_COLOR = "#9ec9e8" as const;
const GROUND_COLOR = "#6b8f3c" as const;
const GROUND_LINE_COLOR = "#3f5c22" as const;
const SELF_COLOR = "#e15b4c" as const;
const OTHER_COLOR = "#3d5c80" as const;

const rect = (color: string, width: number, height: number) => (g: Graphics) => {
  g.clear();
  g.rect(0, 0, width, height);
  g.fill(color);
};

export const GameCanvas = ({
  identity,
  players,
}: {
  identity: Player["identity"];
  players: readonly Player[];
}) => {
  const setInput = useReducer(reducers.setInput);
  const latest = useRef(setInput);
  latest.current = setInput;
  const inputRef = useCallback(
    (node: HTMLDivElement | null) =>
      match(fromNullishOr(node), {
        onNone: () => undefined,
        onSome: () => bindPlayerInput((held) => latest.current(held)),
      }),
    [],
  );
  return (
    <div ref={inputRef}>
      <Application
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        background={SKY_COLOR}
        preference="webgl"
      >
        <pixiGraphics y={GROUND_Y} draw={rect(GROUND_COLOR, VIEW_WIDTH, GROUND_HEIGHT)} />
        <pixiGraphics y={GROUND_Y} draw={rect(GROUND_LINE_COLOR, VIEW_WIDTH, 2)} />
        {players.map((player) => (
          <pixiGraphics
            key={player.identity.toHexString()}
            x={player.x}
            y={player.y}
            draw={rect(
              player.identity.isEqual(identity) ? SELF_COLOR : OTHER_COLOR,
              PLAYER_WIDTH,
              PLAYER_HEIGHT,
            )}
          />
        ))}
      </Application>
    </div>
  );
};
