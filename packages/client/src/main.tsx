import { Effect, ManagedRuntime } from "effect";
import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { WorldClient, worldClientLayer } from "./world-client.ts";
import { startGame, type WorldHandle } from "./world-scene.ts";

const GameCanvas = ({ world }: { readonly world: WorldHandle }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) {
      return;
    }
    const game = startGame(parent, world);
    return () => {
      game.destroy(true);
    };
  }, [world]);
  return <div ref={parentRef} className="game" />;
};

const App = () => {
  const [world, setWorld] = useState<WorldHandle | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const runtime = ManagedRuntime.make(worldClientLayer);
    let cancelled = false;
    runtime
      .runPromise(
        Effect.gen(function* () {
          const client = yield* WorldClient;
          yield* client.connect;
          return client;
        }),
      )
      .then(
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
