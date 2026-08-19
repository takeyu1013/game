import { Application, extend } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useCallback } from "react";
import type { Player } from "./module-bindings/types";

extend({ Graphics });

const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 450;
const GROUND_HEIGHT = 64;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;
const SKY_COLOR = 0x87ceeb;
const GROUND_COLOR = 0x6b4f2a;
const SELF_COLOR = 0xe67e22;
const OTHER_COLOR = 0x2c3e50;

const drawScene = (
  graphics: Graphics,
  players: readonly Player[],
  identity: Player["identity"],
) => {
  graphics.clear();
  graphics.rect(0, VIEW_HEIGHT - GROUND_HEIGHT, VIEW_WIDTH, GROUND_HEIGHT);
  graphics.fill(GROUND_COLOR);
  for (const player of players) {
    graphics.rect(
      player.x,
      VIEW_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT - player.y,
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
    );
    graphics.fill(player.identity.isEqual(identity) ? SELF_COLOR : OTHER_COLOR);
  }
};

export const GameCanvas = ({
  players,
  identity,
}: {
  players: readonly Player[];
  identity: Player["identity"];
}) => {
  const draw = useCallback(
    (graphics: Graphics) => {
      drawScene(graphics, players, identity);
    },
    [players, identity],
  );
  return (
    <Application
      width={VIEW_WIDTH}
      height={VIEW_HEIGHT}
      background={SKY_COLOR}
      preference="webgl"
      hello={false}
      className="game-canvas"
    >
      <pixiGraphics draw={draw} />
    </Application>
  );
};
