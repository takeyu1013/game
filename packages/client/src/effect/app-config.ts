import { Schema } from "effect";

export const AppConfig = Schema.Struct({
  uri: Schema.String,
  moduleName: Schema.String,
});
export type AppConfig = typeof AppConfig.Type;

export const loadAppConfig = (): AppConfig =>
  Schema.decodeUnknownSync(AppConfig)({
    uri: import.meta.env.VITE_SPACETIMEDB_URI ?? "ws://127.0.0.1:3000",
    moduleName: import.meta.env.VITE_SPACETIMEDB_MODULE ?? "game",
  });
