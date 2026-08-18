import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  DbConnectionBuilder,
  DbConnectionImpl,
  makeQueryBuilder,
  procedures,
  reducers,
  schema,
  t,
  table,
  type DbConnectionConfig,
  type Identity,
  type RemoteModule,
} from "spacetimedb";
import { SpacetimeDBProvider, useSpacetimeDB, useTable } from "spacetimedb/react";

const player = table(
  { name: "player", public: true },
  {
    identity: t.identity().primaryKey(),
    x: t.f32(),
    y: t.f32(),
  },
);

const tablesSchema = schema({ player });
const reducersSchema = reducers();
const proceduresSchema = procedures();
const REMOTE_MODULE = {
  versionInfo: { cliVersion: "2.8.1" },
  tables: tablesSchema.schemaType.tables,
  reducers: reducersSchema.reducersType.reducers,
  ...proceduresSchema,
} satisfies RemoteModule<
  typeof tablesSchema.schemaType,
  typeof reducersSchema.reducersType,
  typeof proceduresSchema
>;
const tables = makeQueryBuilder(tablesSchema.schemaType);

const createDbConnection = (config: DbConnectionConfig<typeof REMOTE_MODULE>) =>
  new DbConnectionImpl(config);

const connectionBuilder = new DbConnectionBuilder(REMOTE_MODULE, createDbConnection)
  .withUri(import.meta.env.VITE_SPACETIMEDB_URI ?? "ws://localhost:3000")
  .withDatabaseName(import.meta.env.VITE_SPACETIMEDB_MODULE ?? "takeyu-game");

const PresenceView = ({
  identity,
  players,
  ready,
}: {
  identity: Identity;
  players: readonly { identity: Identity }[];
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
  return <PresenceView identity={identity} players={players} ready={playersReady} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <App />
    </SpacetimeDBProvider>
  </StrictMode>,
);
