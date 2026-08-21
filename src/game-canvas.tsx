import kaplay from "kaplay";
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

const SKY_COLOR = "#9ec9e8" as const;
const GROUND_COLOR = "#6b8f3c" as const;
const GROUND_LINE_COLOR = "#3f5c22" as const;
const SELF_COLOR = "#e15b4c" as const;
const OTHER_COLOR = "#3d5c80" as const;

type Live = {
  identity: Player["identity"];
  players: readonly Player[];
  setInput: (input: { left: boolean; right: boolean }) => unknown;
};

export const GameCanvas = ({
  identity,
  players,
}: {
  identity: Player["identity"];
  players: readonly Player[];
}) => {
  const setInput = useReducer(reducers.setInput);
  const live = useRef<Live>({ identity, players, setInput });
  live.current = { identity, players, setInput };

  const rootRef = useCallback((root: HTMLDivElement | null) => {
    if (!root) {
      return;
    }
    const k = kaplay({
      root,
      width: VIEW_WIDTH,
      height: VIEW_HEIGHT,
      global: false,
      background: SKY_COLOR,
      debug: false,
      loadingScreen: false,
      buttons: {
        left: { keyboard: ["left", "a"] },
        right: { keyboard: ["right", "d"] },
      },
    });
    bindPlayerInput(k, (input) => live.current.setInput(input));
    k.onDraw(() => {
      const { identity: self, players: rows } = live.current;
      k.drawRect({
        pos: k.vec2(0, GROUND_Y),
        width: VIEW_WIDTH,
        height: GROUND_HEIGHT,
        color: k.Color.fromHex(GROUND_COLOR),
      });
      k.drawLine({
        p1: k.vec2(0, GROUND_Y),
        p2: k.vec2(VIEW_WIDTH, GROUND_Y),
        width: 2,
        color: k.Color.fromHex(GROUND_LINE_COLOR),
      });
      rows.forEach((player) => {
        k.drawRect({
          pos: k.vec2(player.x, player.y),
          width: PLAYER_WIDTH,
          height: PLAYER_HEIGHT,
          color: k.Color.fromHex(player.identity.isEqual(self) ? SELF_COLOR : OTHER_COLOR),
        });
      });
    });
    return () => k.quit();
  }, []);

  return <div ref={rootRef} />;
};
