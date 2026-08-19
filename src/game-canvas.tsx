import { useEffect, useRef } from "react";
import {
  GROUND_HEIGHT,
  GROUND_Y,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "../spacetimedb/src/layout";
import type { Player } from "./module-bindings/types";

const SKY_COLOR = "#9ec9e8";
const GROUND_COLOR = "#6b8f3c";
const GROUND_LINE_COLOR = "#3f5c22";
const SELF_COLOR = "#e15b4c";
const OTHER_COLOR = "#3d5c80";

const playerColor = (player: Player, self: Player["identity"]) =>
  player.identity.isEqual(self) ? SELF_COLOR : OTHER_COLOR;

const drawSkyAndGround = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = SKY_COLOR;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.fillStyle = GROUND_COLOR;
  ctx.fillRect(0, GROUND_Y, VIEW_WIDTH, GROUND_HEIGHT);
  ctx.strokeStyle = GROUND_LINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(VIEW_WIDTH, GROUND_Y);
  ctx.stroke();
};

const drawGame = (
  ctx: CanvasRenderingContext2D,
  self: Player["identity"],
  players: readonly Player[],
) => {
  drawSkyAndGround(ctx);
  for (const player of players) {
    ctx.fillStyle = playerColor(player, self);
    ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
  }
};

export const GameCanvas = ({
  identity,
  players,
}: {
  identity: Player["identity"];
  players: readonly Player[];
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    drawGame(ctx, identity, players);
  }, [identity, players]);
  return <canvas ref={canvasRef} width={VIEW_WIDTH} height={VIEW_HEIGHT} />;
};
