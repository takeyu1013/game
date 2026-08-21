import { Stack } from "alchemy";
import {
  ApiToken,
  CloudflareEnvironment,
  providers as cloudflareProviders,
  state,
} from "alchemy/Cloudflare";
import { Secret, providers as githubProviders } from "alchemy/GitHub";
import { redacted } from "effect/Config";
import { gen } from "effect/Effect";
import { mergeAll } from "effect/Layer";
import { make } from "effect/Redacted";

const owner = "takeyu1013";
const repository = "game";

export default Stack(
  "github",
  {
    providers: mergeAll(cloudflareProviders(), githubProviders()),
    state: state(),
  },
  gen(function* () {
    const { accountId } = yield* yield* CloudflareEnvironment;

    const apiToken = yield* ApiToken.AccountApiToken("CIToken", {
      accountId,
      policies: [
        {
          effect: "allow",
          permissionGroups: ["Workers Scripts Write", "Secrets Store Write"],
          resources: {
            [`com.cloudflare.api.account.${accountId}`]: "*",
          },
        },
      ],
    });

    yield* Secret("cf-api-token", {
      owner,
      repository,
      name: "CLOUDFLARE_API_TOKEN",
      value: apiToken.value,
    });
    yield* Secret("cf-account-id", {
      owner,
      repository,
      name: "CLOUDFLARE_ACCOUNT_ID",
      value: make(accountId),
    });
    const spacetimeToken = yield* redacted("SPACETIMEDB_TOKEN");
    yield* Secret("spacetimedb-token", {
      owner,
      repository,
      name: "SPACETIMEDB_TOKEN",
      value: spacetimeToken,
    });
  }),
);
