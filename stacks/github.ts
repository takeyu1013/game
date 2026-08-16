import { Stack } from "alchemy";
import {
  ApiToken,
  CloudflareEnvironment,
  providers as cloudflareProviders,
  state,
} from "alchemy/Cloudflare";
import { Secret, providers as githubProviders } from "alchemy/GitHub";
import { gen } from "effect/Effect";
import { mergeAll } from "effect/Layer";
import { make } from "effect/Redacted";

const owner = "takeyu1013" as const;
const repository = "game" as const;

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
  }),
);
