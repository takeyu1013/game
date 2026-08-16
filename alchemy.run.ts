import { Stack, Stage } from "alchemy";
import { Website, providers as cloudflareProviders, state } from "alchemy/Cloudflare";
import { Comment, GitHubEnv, providers as githubProviders } from "alchemy/GitHub";
import { interpolate } from "alchemy/Output";
import { gen } from "effect/Effect";
import { mergeAll } from "effect/Layer";

export default Stack(
  "game",
  {
    providers: mergeAll(githubProviders(), cloudflareProviders()),
    state: state(),
  },
  gen(function* () {
    const stage = yield* Stage;
    const web = yield* Website.Vite("Website", {
      // prodはworkers.devのホスト名を固定し、mainマージごとにURLが変わらないようにする
      name: stage === "prod" ? "game" : undefined,
      assets: { notFoundHandling: "single-page-application" },
      env: {
        VITE_SPACETIMEDB_URI: "https://maincloud.spacetimedb.com",
      },
    });
    const github = yield* GitHubEnv;
    if (github?.pr) {
      yield* Comment("preview-comment", {
        owner: github.owner,
        repository: github.repository,
        issueNumber: github.pr,
        body: interpolate`
          ## Preview Deployed

          **URL:** ${web.url}

          Built from commit ${github.sha.slice(0, 7)}

          ---
          _This comment updates automatically with each push._
        `,
      });
    }
    return { url: web.url };
  }),
);
