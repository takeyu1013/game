import { Application, extend } from "@pixi/react";
import { Graphics } from "pixi.js";
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

const playerScreenY = (worldY: number) => VIEW_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT - worldY;

const drawGround = (graphics: Graphics) => {
  graphics.clear();
  graphics.rect(0, VIEW_HEIGHT - GROUND_HEIGHT, VIEW_WIDTH, GROUND_HEIGHT);
  graphics.fill(GROUND_COLOR);
};

const drawSelf = (graphics: Graphics) => {
  graphics.clear();
  graphics.rect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.fill(SELF_COLOR);
};

const drawOther = (graphics: Graphics) => {
  graphics.clear();
  graphics.rect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.fill(OTHER_COLOR);
};

export const GameCanvas = ({
  players,
  identity,
}: {
  players: readonly Player[];
  identity: Player["identity"];
}) => (
  <Application
    width={VIEW_WIDTH}
    height={VIEW_HEIGHT}
    background={SKY_COLOR}
    preference="webgl"
    hello={false}
    className="game-canvas"
  >
    <pixiGraphics draw={drawGround} />
    {players.map((player) => (
      <pixiGraphics
        key={player.identity.toHexString()}
        x={player.x}
        y={playerScreenY(player.y)}
        draw={player.identity.isEqual(identity) ? drawSelf : drawOther}
      />
    ))}
  </Application>
);
