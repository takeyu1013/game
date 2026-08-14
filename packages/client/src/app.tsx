import { Effect, ManagedRuntime } from "effect";
import { useEffect, useState } from "react";
import { WorldClient } from "./effect/world-client.ts";
import { GameCanvas } from "./game/game-canvas.tsx";
import type { WorldHandle } from "./game/world-scene.ts";

export const App = () => {
  const [world, setWorld] = useState<WorldHandle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runtime = ManagedRuntime.make(WorldClient.layer);
    let cancelled = false;
    const program = Effect.gen(function* () {
      const client = yield* WorldClient;
      yield* client.connect;
      return client;
    });
    runtime.runPromise(program).then(
      (client) => {
        if (cancelled) {
          return;
        }
        setWorld({
          players: client.players,
          localId: client.localId,
          setInput: (left, right) => {
            runtime.runFork(client.setInput(left, right));
          },
        });
      },
      (cause: unknown) => {
        console.error(cause);
        if (!cancelled) {
          setError("接続に失敗しました。SpacetimeDB を起動してください。");
        }
      },
    );
    return () => {
      cancelled = true;
      void runtime.dispose();
    };
  }, []);

  return (
    <main>
      {error ? <p className="error">{error}</p> : null}
      {world ? <GameCanvas world={world} /> : null}
    </main>
  );
};
