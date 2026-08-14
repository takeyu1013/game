import { Context, Effect, Layer, Schema } from "effect";
import { DbConnection, tables } from "./db-connection.ts";
import { loadAppConfig } from "./app-config.ts";

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
              const config = loadAppConfig();
              DbConnection.builder()
                .withUri(config.uri)
                .withDatabaseName(config.moduleName)
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
