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
import type { PlayerSnapshot } from "./world-client.ts";

export type WorldHandle = {
  readonly players: () => ReadonlyMap<string, PlayerSnapshot>;
  readonly localId: () => string | undefined;
  readonly setInput: (left: boolean, right: boolean) => void;
};

class WorldScene extends Phaser.Scene {
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
    this.syncInput(left, right);
    this.syncSprites(left, right, delta / 1000);
  }

  private syncInput(left: boolean, right: boolean): void {
    if (left === this.lastLeft && right === this.lastRight) {
      return;
    }
    this.lastLeft = left;
    this.lastRight = right;
    this.world.setInput(left, right);
  }

  private syncSprites(left: boolean, right: boolean, dt: number): void {
    const localId = this.world.localId();
    const predict = left !== right;
    const seen = new Set<string>();
    for (const [id, player] of this.world.players()) {
      seen.add(id);
      const sprite = this.sprites.get(id) ?? this.spawn(player);
      sprite.x =
        id === localId && predict
          ? Phaser.Math.Clamp(
              sprite.x + (left ? -1 : 1) * MOVE_SPEED * dt,
              PLAYER_WIDTH / 2,
              WORLD_WIDTH - PLAYER_WIDTH / 2,
            )
          : Phaser.Math.Linear(sprite.x, player.x, 0.35);
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
    const color = new Phaser.Display.Color();
    color.setFromHSV(player.hue / 360, 0.65, 0.95);
    const sprite = this.add.rectangle(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT, color.color);
    this.sprites.set(player.id, sprite);
    return sprite;
  }
}

export const startGame = (parent: HTMLElement, world: WorldHandle): Phaser.Game =>
  new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    backgroundColor: "#1b1f24",
    scene: [new WorldScene(world)],
  });
