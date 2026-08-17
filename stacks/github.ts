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
import { make, value as reveal } from "effect/Redacted";

const owner = "takeyu1013" as const;
const repository = "game" as const;

const spacetimeAuthToken = (raw: string) => {
  const match = /Your auth token \(don't share this!\) is\s+(\S+)/.exec(raw);
  return (match?.[1] ?? raw).replace(/[\r\n]/g, "").trim();
};

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
      value: make(spacetimeAuthToken(reveal(spacetimeToken))),
    });
  }),
);
