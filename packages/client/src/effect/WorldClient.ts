import { Context, Data, Effect, Layer } from "effect";
import { DbConnection, tables } from "../module_bindings/index.ts";
import { loadAppConfig } from "./AppConfig.ts";

export class WorldError extends Data.TaggedError("WorldError")<{
  readonly reason: string;
  readonly cause?: unknown;
}> {}

export type PlayerSnapshot = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly hue: number;
};

export class WorldClient extends Context.Tag("WorldClient")<
  WorldClient,
  {
    readonly players: () => ReadonlyMap<string, PlayerSnapshot>;
    readonly localId: () => string | undefined;
    readonly connect: Effect.Effect<void, WorldError>;
    readonly setInput: (left: boolean, right: boolean) => Effect.Effect<void, WorldError>;
  }
>() {}

const TOKEN_KEY = "stdb_token";

export const WorldClientLive = Layer.effect(
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
              .withToken(localStorage.getItem(TOKEN_KEY) ?? undefined)
              .onConnectError((_ctx, error) => {
                reject(error);
              })
              .onConnect((connected, identity, token) => {
                connection = connected;
                localId = identity.toHexString();
                if (token) {
                  localStorage.setItem(TOKEN_KEY, token);
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
