import {
  DbConnectionBuilder,
  DbConnectionImpl,
  SubscriptionBuilderImpl,
  makeQueryBuilder,
  procedures,
  reducerSchema,
  reducers,
  schema,
  t,
  table,
  type DbConnectionConfig,
  type QueryBuilder,
  type RemoteModule,
} from "spacetimedb";

const tablesSchema = schema({
  player: table(
    { name: "player" },
    t.row({
      identity: t.identity().primaryKey(),
      x: t.f32(),
      y: t.f32(),
      dir: t.i32(),
      hue: t.u32(),
      online: t.bool(),
    }),
  ),
});

const reducersSchema = reducers(reducerSchema("set_input", { left: t.bool(), right: t.bool() }));
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

export const tables: QueryBuilder<typeof tablesSchema.schemaType> = makeQueryBuilder(
  tablesSchema.schemaType,
);

export class DbConnection extends DbConnectionImpl<typeof REMOTE_MODULE> {
  static builder = (): DbConnectionBuilder<DbConnection> =>
    new DbConnectionBuilder(
      REMOTE_MODULE,
      (config: DbConnectionConfig<typeof REMOTE_MODULE>) => new DbConnection(config),
    );

  override subscriptionBuilder = (): SubscriptionBuilderImpl<typeof REMOTE_MODULE> =>
    new SubscriptionBuilderImpl(this);
}
