import { Layer, Line, Rect, Stage } from "react-konva";
import {
  GROUND_HEIGHT,
  GROUND_Y,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "../spacetimedb/src/layout";
import type { Player } from "./module-bindings/types";
import { usePlayerInput } from "./player-input";

const SKY_COLOR = "#9ec9e8" as const;
const GROUND_COLOR = "#6b8f3c" as const;
const GROUND_LINE_COLOR = "#3f5c22" as const;
const SELF_COLOR = "#e15b4c" as const;
const OTHER_COLOR = "#3d5c80" as const;

const playerColor = (player: Player, self: Player["identity"]) =>
  player.identity.isEqual(self) ? SELF_COLOR : OTHER_COLOR;

const PlayerRect = ({ player, self }: { player: Player; self: Player["identity"] }) => (
  <Rect
    x={player.x}
    y={player.y}
    width={PLAYER_WIDTH}
    height={PLAYER_HEIGHT}
    fill={playerColor(player, self)}
    listening={false}
  />
);

export const GameCanvas = ({
  identity,
  players,
}: {
  identity: Player["identity"];
  players: readonly Player[];
}) => {
  const input = usePlayerInput();
  return (
    <div
      ref={input.ref}
      tabIndex={input.tabIndex}
      autoFocus={input.autoFocus}
      onClick={input.onClick}
      onKeyDown={input.onKeyDown}
      onKeyUp={input.onKeyUp}
      onBlur={input.onBlur}
      style={{ outline: "none", width: VIEW_WIDTH }}
    >
      <Stage width={VIEW_WIDTH} height={VIEW_HEIGHT} listening={false}>
        <Layer listening={false}>
          <Rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={SKY_COLOR} />
          <Rect y={GROUND_Y} width={VIEW_WIDTH} height={GROUND_HEIGHT} fill={GROUND_COLOR} />
          <Line
            points={[0, GROUND_Y, VIEW_WIDTH, GROUND_Y]}
            stroke={GROUND_LINE_COLOR}
            strokeWidth={2}
          />
          {players.map((player) => (
            <PlayerRect key={player.identity.toHexString()} player={player} self={identity} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
