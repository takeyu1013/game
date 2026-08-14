import { Effect, ManagedRuntime } from "effect";
import { WorldClient, WorldClientLive } from "./effect/WorldClient.ts";
import { startGame } from "./game/WorldScene.ts";

const runtime = ManagedRuntime.make(WorldClientLive);

const program = Effect.gen(function* () {
  const world = yield* WorldClient;
  yield* world.connect;
  startGame("game", {
    players: world.players,
    localId: world.localId,
    setInput: (left, right) => {
      runtime.runFork(world.setInput(left, right));
    },
  });
});

runtime.runPromise(program).catch((error: unknown) => {
  console.error(error);
  document.body.insertAdjacentHTML(
    "beforeend",
    `<p style="color:#f88;text-align:center">接続に失敗しました。SpacetimeDB を起動してください。</p>`,
  );
});
