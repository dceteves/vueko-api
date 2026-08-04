import StrategyFactory from "../utils/strategy-factory.ts";
import UserService from "../services/user.ts";

import type {
  StrategyOptions,
  StrategyOptionsWithRequest,
} from "passport-oauth2";
import type { OsuProfile } from "../types/passport.types.ts";

const service = new UserService();

const osuConfigOptions: StrategyOptions = {
  clientID: `${process.env.OSU_CLIENT_ID}`,
  clientSecret: `${process.env.OSU_CLIENT_SECRET}`,
  callbackURL: `${process.env.OSU_CALLBACK}`,
  authorizationURL: "https://osu.ppy.sh/oauth/authorize",
  tokenURL: "https://osu.ppy.sh/oauth/token",
};

const osuConfigOptionsWithRequest: StrategyOptionsWithRequest = {
  ...osuConfigOptions,
  passReqToCallback: true,
};

const userProfileURL = "https://osu.ppy.sh/api/v2/me";

const verifyOsuProfile = StrategyFactory.createVerifyFunction<OsuProfile>();
const verifyOsuProfileWithRequest =
  StrategyFactory.createVerifyFunctionWithRequest<OsuProfile>(
    service.linkOsuProfile,
  );
const fetchOsuProfile =
  StrategyFactory.createProfileFunction<OsuProfile>(userProfileURL);

const OsuStrategy = StrategyFactory.createOAuth2Strategy<OsuProfile>(
  osuConfigOptions,
  verifyOsuProfile,
  fetchOsuProfile,
);

const OsuStrategyWithRequest =
  StrategyFactory.createOAuth2StrategyWithRequest<OsuProfile>(
    osuConfigOptionsWithRequest,
    verifyOsuProfileWithRequest,
    fetchOsuProfile,
  );

export { OsuStrategy, OsuStrategyWithRequest };
