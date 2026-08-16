import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  DbConnectionBuilder,
  DbConnectionImpl,
  procedures,
  reducers,
  schema,
  type DbConnectionConfig,
  type RemoteModule,
} from "spacetimedb";
import { SpacetimeDBProvider, useSpacetimeDB } from "spacetimedb/react";

const tablesSchema = schema({});
const reducersSchema = reducers();
const proceduresSchema = procedures();
const REMOTE_MODULE = {
  versionInfo: { cliVersion: "2.8.1" as const },
  tables: tablesSchema.schemaType.tables,
  reducers: reducersSchema.reducersType.reducers,
  ...proceduresSchema,
} satisfies RemoteModule<
  typeof tablesSchema.schemaType,
  typeof reducersSchema.reducersType,
  typeof proceduresSchema
>;

const createDbConnection = (config: DbConnectionConfig<typeof REMOTE_MODULE>) =>
  new DbConnectionImpl(config);

const connectionBuilder = new DbConnectionBuilder(REMOTE_MODULE, createDbConnection)
  .withUri(import.meta.env.VITE_SPACETIMEDB_URI ?? "ws://127.0.0.1:3000")
  .withDatabaseName(import.meta.env.VITE_SPACETIMEDB_MODULE ?? "game");

const App = () => {
  const { isActive, identity, connectionError } = useSpacetimeDB();
  if (connectionError) {
    return `接続に失敗しました: ${connectionError.message}`;
  }
  if (!isActive || !identity) {
    return "接続中...";
  }
  return `接続しました: ${identity.toHexString()}`;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <App />
    </SpacetimeDBProvider>
  </StrictMode>,
);
