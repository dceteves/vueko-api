import UserService from "../services/user.ts";
import StrategyFactory from "../utils/strategy-factory.ts";

import type { DiscordProfile } from "../types/passport.types.ts";
import type {
  StrategyOptions,
  StrategyOptionsWithRequest,
} from "passport-oauth2";

const userProfileURL = "https://discord.com/api/v10/users/@me";

const discordStrategyOptions: StrategyOptions = {
  clientID: `${process.env.DISCORD_CLIENT_ID}`,
  clientSecret: `${process.env.DISCORD_CLIENT_SECRET}`,
  callbackURL: `${process.env.DISCORD_CALLBACK}`,
  authorizationURL: "https://discord.com/oauth2/authorize",
  tokenURL: "https://osu.ppy.sh/api/oauth/token",
};

const discordStrategyOptionsWithRequest: StrategyOptionsWithRequest = {
  ...discordStrategyOptions,
  passReqToCallback: true,
};

const fetchDiscordProfile =
  StrategyFactory.createProfileFunction<DiscordProfile>(userProfileURL);

const verifyDiscordProfile =
  StrategyFactory.createVerifyFunction<DiscordProfile>();

const verifyDiscordProfileWithRequest =
  StrategyFactory.createVerifyFunctionWithRequest<DiscordProfile>(
    UserService.linkDiscordProfile,
  );

const DiscordStrategy = StrategyFactory.createOAuth2Strategy(
  discordStrategyOptions,
  verifyDiscordProfile,
  fetchDiscordProfile,
);
const DiscordStrategyWithRequest =
  StrategyFactory.createOAuth2StrategyWithRequest<DiscordProfile>(
    discordStrategyOptionsWithRequest,
    verifyDiscordProfileWithRequest,
    fetchDiscordProfile,
  );

export { DiscordStrategy, DiscordStrategyWithRequest };
