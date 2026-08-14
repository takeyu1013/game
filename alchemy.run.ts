import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Path } from "effect/Path";

export default Alchemy.Stack(
  "game",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const path = yield* Path;
    const web = yield* Cloudflare.Website.Vite("Website", {
      rootDir: path.resolve(import.meta.dirname, "packages/client"),
      assets: { notFoundHandling: "single-page-application" },
      dev: { port: 5173 },
    });
    return { url: web.url };
  }),
);
