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

export const startGame = (parent: HTMLElement, world: WorldHandle): Phaser.Game => {
  const sprites = new Map<string, Phaser.GameObjects.Rectangle>();
  let lastLeft = false;
  let lastRight = false;
  let cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

  const spawn = (scene: Phaser.Scene, player: PlayerSnapshot): Phaser.GameObjects.Rectangle => {
    const color = new Phaser.Display.Color();
    color.setFromHSV(player.hue / 360, 0.65, 0.95);
    const sprite = scene.add.rectangle(
      player.x,
      player.y,
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
      color.color,
    );
    sprites.set(player.id, sprite);
    return sprite;
  };

  const syncInput = (left: boolean, right: boolean): void => {
    if (left === lastLeft && right === lastRight) {
      return;
    }
    lastLeft = left;
    lastRight = right;
    world.setInput(left, right);
  };

  const syncSprites = (scene: Phaser.Scene, left: boolean, right: boolean, dt: number): void => {
    const localId = world.localId();
    const predict = left !== right;
    const seen = new Set<string>();
    for (const [id, player] of world.players()) {
      seen.add(id);
      const sprite = sprites.get(id) ?? spawn(scene, player);
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
    for (const [id, sprite] of sprites) {
      if (!seen.has(id)) {
        sprite.destroy();
        sprites.delete(id);
      }
    }
  };

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    backgroundColor: "#1b1f24",
    scene: {
      key: "world",
      create() {
        this.add.rectangle(
          WORLD_WIDTH / 2,
          GROUND_Y + GROUND_HEIGHT / 2,
          WORLD_WIDTH,
          GROUND_HEIGHT,
          0x4a7c4a,
        );
        cursors = this.input.keyboard?.createCursorKeys();
      },
      update(_time: number, delta: number) {
        const left = cursors?.left.isDown ?? false;
        const right = cursors?.right.isDown ?? false;
        syncInput(left, right);
        syncSprites(this, left, right, delta / 1000);
      },
    },
  });
};
