import Phaser from "phaser";
import {
  GROUND_HEIGHT,
  GROUND_Y,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  MOVE_SPEED,
} from "@game/sim";
import type { PlayerSnapshot } from "../effect/world-client.ts";

export type WorldHandle = {
  readonly players: () => ReadonlyMap<string, PlayerSnapshot>;
  readonly localId: () => string | undefined;
  readonly setInput: (left: boolean, right: boolean) => void;
};

const hsl = (hue: number): number => {
  const color = new Phaser.Display.Color();
  color.setFromHSV(hue / 360, 0.65, 0.95);
  return color.color;
};

export class WorldScene extends Phaser.Scene {
  private readonly sprites = new Map<string, Phaser.GameObjects.Rectangle>();
  private lastLeft = false;
  private lastRight = false;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(private readonly world: WorldHandle) {
    super("world");
  }

  create(): void {
    this.add.rectangle(
      WORLD_WIDTH / 2,
      GROUND_Y + GROUND_HEIGHT / 2,
      WORLD_WIDTH,
      GROUND_HEIGHT,
      0x4a7c4a,
    );
    this.cursors = this.input.keyboard?.createCursorKeys();
  }

  update(_time: number, delta: number): void {
    const left = this.cursors?.left.isDown ?? false;
    const right = this.cursors?.right.isDown ?? false;
    if (left !== this.lastLeft || right !== this.lastRight) {
      this.lastLeft = left;
      this.lastRight = right;
      this.world.setInput(left, right);
    }

    const localId = this.world.localId();
    const dt = delta / 1000;
    const players = this.world.players();
    const seen = new Set<string>();

    for (const [id, player] of players) {
      seen.add(id);
      const sprite = this.sprites.get(id) ?? this.spawn(player);
      if (id === localId && (left || right) && !(left && right)) {
        const dir = left ? -1 : 1;
        sprite.x = Phaser.Math.Clamp(
          sprite.x + dir * MOVE_SPEED * dt,
          PLAYER_WIDTH / 2,
          WORLD_WIDTH - PLAYER_WIDTH / 2,
        );
      } else {
        sprite.x = Phaser.Math.Linear(sprite.x, player.x, 0.35);
      }
      sprite.y = player.y;
    }

    for (const [id, sprite] of this.sprites) {
      if (!seen.has(id)) {
        sprite.destroy();
        this.sprites.delete(id);
      }
    }
  }

  private spawn(player: PlayerSnapshot): Phaser.GameObjects.Rectangle {
    const sprite = this.add.rectangle(
      player.x,
      player.y,
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
      hsl(player.hue),
    );
    this.sprites.set(player.id, sprite);
    return sprite;
  }
}

export const startGame = (parent: string, world: WorldHandle): Phaser.Game =>
  new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    backgroundColor: "#1b1f24",
    scene: [new WorldScene(world)],
  });
