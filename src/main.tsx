import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SpacetimeDBProvider, useSpacetimeDB, useTable } from "spacetimedb/react";
import { GameCanvas } from "./game-canvas";
import { DbConnection, tables } from "./module-bindings";
import type { Player } from "./module-bindings/types";

const connectionBuilder = DbConnection.builder()
  .withUri(import.meta.env.VITE_SPACETIMEDB_URI ?? "ws://localhost:3000")
  .withDatabaseName(import.meta.env.VITE_SPACETIMEDB_MODULE ?? "takeyu-game");

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
  if (connectionError) {
    return `接続に失敗しました: ${connectionError.message}`;
  }
  if (!isActive || !identity) {
    return "接続中...";
  }
  return (
    <div>
      <GameCanvas identity={identity} players={players} />
      <PresenceView identity={identity} players={players} ready={playersReady} />
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <App />
    </SpacetimeDBProvider>
  </StrictMode>,
);
