import { Stack } from "alchemy";
import { Website, providers, state } from "alchemy/Cloudflare";
import { gen } from "effect/Effect";

export default Stack(
  "game",
  {
    providers: providers(),
    state: state(),
  },
  gen(function* () {
    const web = yield* Website.Vite("Website", {
      assets: { notFoundHandling: "single-page-application" },
    });
    return { url: web.url };
  }),
);
