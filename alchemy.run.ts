import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "game",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const web = yield* Cloudflare.Website.Vite("Website", {
      rootDir: "./packages/client",
      assets: { notFoundHandling: "single-page-application" },
    });
    return { url: web.url };
  }),
);
