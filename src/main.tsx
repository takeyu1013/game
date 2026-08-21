import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { fn, fromNullishOr, runSync, sync } from "effect/Effect";
import { fromNullishOr as optionFromNullishOr, getOrElse, match } from "effect/Option";
import { decodeUnknownEffect, String, Struct } from "effect/Schema";
import { SpacetimeDBProvider, useSpacetimeDB, useTable } from "spacetimedb/react";
import { GameCanvas } from "./game-canvas";
import { DbConnection, tables } from "./module-bindings";
import type { Player } from "./module-bindings/types";

const defaultSpacetimeUri = "ws://localhost:3000" as const;
const defaultSpacetimeModule = "takeyu-game" as const;

const spacetimeEnvSchema = Struct({
  VITE_SPACETIMEDB_URI: String,
  VITE_SPACETIMEDB_MODULE: String,
});

const PresenceView = ({
  identity,
  players,
  ready,
}: {
  identity: Player["identity"];
  players: readonly Player[];
  ready: boolean;
}) => {
  if (!ready) {
    return "接続中...";
  }
  return (
    <div>
      <GameCanvas identity={identity} players={players} />
      <p>{`接続しました: ${identity.toHexString()}`}</p>
      <p>{`在席: ${players.length}人`}</p>
      <ul>
        {players.map((row) => (
          <li key={row.identity.toHexString()}>
            {row.identity.toHexString()}
            {row.identity.isEqual(identity) ? "（自分）" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

const App = () => {
  const { isActive, identity, connectionError } = useSpacetimeDB();
  const [players, playersReady] = useTable(tables.player);
  return match(optionFromNullishOr(connectionError), {
    onSome: (error) => `接続に失敗しました: ${error.message}`,
    onNone: () =>
      match(optionFromNullishOr(isActive ? identity : undefined), {
        onNone: () => "接続中...",
        onSome: (id) => <PresenceView identity={id} players={players} ready={playersReady} />,
      }),
  });
};

const mount = fn("mount")(function* () {
  const env = yield* decodeUnknownEffect(spacetimeEnvSchema)({
    VITE_SPACETIMEDB_URI: getOrElse(
      optionFromNullishOr(import.meta.env.VITE_SPACETIMEDB_URI),
      () => defaultSpacetimeUri,
    ),
    VITE_SPACETIMEDB_MODULE: getOrElse(
      optionFromNullishOr(import.meta.env.VITE_SPACETIMEDB_MODULE),
      () => defaultSpacetimeModule,
    ),
  });
  const root = yield* fromNullishOr(document.getElementById("root"));
  const connectionBuilder = DbConnection.builder()
    .withUri(env.VITE_SPACETIMEDB_URI)
    .withDatabaseName(env.VITE_SPACETIMEDB_MODULE);
  yield* sync(() => {
    createRoot(root).render(
      <StrictMode>
        <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
          <App />
        </SpacetimeDBProvider>
      </StrictMode>,
    );
  });
});

runSync(mount());
