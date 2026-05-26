import "dotenv/config";
import passport from "passport";
import { OsuStrategy, OsuStrategyWithRequest } from "@lib/passport/osu.ts";
import {
  DiscordStrategy,
  DiscordStrategyWithRequest,
} from "@lib/passport/discord.ts";

import type OAuth2Strategy from "passport-oauth2";
import type { Provider, SerializedUser } from "types/passport.types.ts";

const PROVIDER_STRATEGIES: Record<Provider, [OAuth2Strategy, OAuth2Strategy]> =
  {
    osu: [OsuStrategy, OsuStrategyWithRequest],
    discord: [DiscordStrategy, DiscordStrategyWithRequest],
  } as const;

passport.serializeUser<SerializedUser>((user, done) => {
  const serialized: SerializedUser = {
    id: user.id,
    teamId: user.teamId,
  };
  done(null, serialized);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

for (const [provider, strategies] of Object.entries(PROVIDER_STRATEGIES)) {
  const [strategy, strategyWithRequest] = strategies;
  passport.use(provider, strategy);
  passport.use(`${provider}-link`, strategyWithRequest);
}

export default passport;
