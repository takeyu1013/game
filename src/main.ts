import {
  DbConnectionBuilder,
  DbConnectionImpl,
  procedures,
  reducers,
  schema,
  type DbConnectionConfig,
  type RemoteModule,
} from "spacetimedb";

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

const uri = import.meta.env.VITE_SPACETIMEDB_URI ?? "ws://127.0.0.1:3000";
const database = import.meta.env.VITE_SPACETIMEDB_MODULE ?? "game";

new DbConnectionBuilder(REMOTE_MODULE, createDbConnection)
  .withUri(uri)
  .withDatabaseName(database)
  .onConnectError((_ctx, error) => {
    document.body.textContent = `接続に失敗しました: ${error.message}`;
  })
  .onConnect((_connection, identity) => {
    document.body.textContent = `接続しました: ${identity.toHexString()}`;
  })
  .build();
