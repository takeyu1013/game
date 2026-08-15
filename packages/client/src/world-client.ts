import { Context, Effect, Layer, Schema } from "effect";
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
const tables = makeQueryBuilder(tablesSchema.schemaType);

class DbConnection extends DbConnectionImpl<typeof REMOTE_MODULE> {
  static builder = (): DbConnectionBuilder<DbConnection> =>
    new DbConnectionBuilder(
      REMOTE_MODULE,
      (config: DbConnectionConfig<typeof REMOTE_MODULE>) => new DbConnection(config),
    );

  override subscriptionBuilder = (): SubscriptionBuilderImpl<typeof REMOTE_MODULE> =>
    new SubscriptionBuilderImpl(this);
}

export class WorldError extends Schema.TaggedError<WorldError>()("WorldError", {
  reason: Schema.String,
  cause: Schema.Unknown,
}) {}

export type PlayerSnapshot = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly hue: number;
};

export class WorldClient extends Context.Service<
  WorldClient,
  {
    readonly players: () => ReadonlyMap<string, PlayerSnapshot>;
    readonly localId: () => string | undefined;
    readonly connect: Effect.Effect<void, WorldError>;
    readonly setInput: (left: boolean, right: boolean) => Effect.Effect<void, WorldError>;
  }
>()("WorldClient") {
  static readonly layer = Layer.effect(
    WorldClient,
    Effect.sync(() => {
      const players = new Map<string, PlayerSnapshot>();
      let localId: string | undefined;
      let connection: DbConnection | undefined;
      const snapshotFrom = (row: {
        identity: { toHexString(): string };
        x: number;
        y: number;
        hue: number;
      }): PlayerSnapshot => ({
        id: row.identity.toHexString(),
        x: row.x,
        y: row.y,
        hue: row.hue,
      });
      return WorldClient.of({
        players: () => players,
        localId: () => localId,
        connect: Effect.tryPromise({
          try: () =>
            new Promise<void>((resolve, reject) => {
              DbConnection.builder()
                .withUri(import.meta.env.VITE_SPACETIMEDB_URI ?? "ws://127.0.0.1:3000")
                .withDatabaseName(import.meta.env.VITE_SPACETIMEDB_MODULE ?? "game")
                .withToken(localStorage.getItem("stdb_token") ?? undefined)
                .onConnectError((_ctx, error) => {
                  reject(error);
                })
                .onConnect((connected, identity, token) => {
                  connection = connected;
                  localId = identity.toHexString();
                  if (token) {
                    localStorage.setItem("stdb_token", token);
                  }
                  connected.db.player.onInsert((_ctx, row) => {
                    const snap = snapshotFrom(row);
                    players.set(snap.id, snap);
                  });
                  connected.db.player.onUpdate((_ctx, _old, row) => {
                    const snap = snapshotFrom(row);
                    players.set(snap.id, snap);
                  });
                  connected.db.player.onDelete((_ctx, row) => {
                    players.delete(row.identity.toHexString());
                  });
                  connected
                    .subscriptionBuilder()
                    .onApplied(() => {
                      resolve();
                    })
                    .onError((ctx) => {
                      reject(ctx.event ?? new Error("subscribe failed"));
                    })
                    .subscribe(tables.player);
                })
                .build();
            }),
          catch: (cause) => new WorldError({ reason: "connect failed", cause }),
        }),
        setInput: (left, right) =>
          Effect.tryPromise({
            try: async () => {
              if (!connection) {
                throw new Error("not connected");
              }
              await connection.reducers.setInput({ left, right });
            },
            catch: (cause) => new WorldError({ reason: "setInput failed", cause }),
          }),
      });
    }),
  );
}
