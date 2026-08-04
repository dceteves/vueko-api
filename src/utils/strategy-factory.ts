import OAuth2Strategy from "passport-oauth2";
import UserService from "../services/user.ts";

import type { Request } from "express";
import type { User } from "../generated/prisma/client.ts";
import type { Result } from "./result.ts";
import { UserNotFoundError } from "./error.ts";
import type { Profile } from "passport";

type ProfileFunction<TProfile> = (
  accessToken: string,
  done: (err?: unknown, profile?: TProfile) => void,
) => void;

const service = new UserService();

function createVerifyFunction<
  T extends Profile,
>(): OAuth2Strategy.VerifyFunction<T> {
  return async (
    accessToken: string,
    refreshToken: string,
    profile: T,
    done: OAuth2Strategy.VerifyCallback,
  ) => {
    const result = await service.userFromProfile(
      accessToken,
      refreshToken,
      profile,
    );

    if (result.ok) {
      done(null, result.value);
    } else {
      done(result.error);
    }
  };
}

function createVerifyFunctionWithRequest<TProfile>(
  linkFunction: (userId: string, profile: TProfile) => Promise<Result<User>>,
): OAuth2Strategy.VerifyFunctionWithRequest<TProfile> {
  return async function (
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: TProfile,
    done: OAuth2Strategy.VerifyCallback,
  ) {
    if (!req.user) {
      done(new UserNotFoundError());
      return;
    }

    const result = await linkFunction(req.user.id, profile);

    if (result.ok) {
      done(null, result.value);
    } else {
      done(result.error);
    }
  };
}

function createProfileFunction<TProfile>(
  profileUrl: string | URL,
): ProfileFunction<TProfile> {
  return async function (
    accessToken: string,
    done: (err?: unknown, profile?: TProfile) => void,
  ) {
    // prettier-ignore
    const opts = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    };
    try {
      const profileResponse = await fetch(profileUrl, opts);
      const profileData = (await profileResponse.json()) as TProfile;
      done(null, profileData);
    } catch (err) {
      done(err as Error);
    }
  };
}

function createOAuth2Strategy<TProfile>(
  options: OAuth2Strategy.StrategyOptions,
  verify: OAuth2Strategy.VerifyFunction<TProfile>,
  userProfile: ProfileFunction<TProfile>,
) {
  const strategy = new OAuth2Strategy(options, verify);
  strategy.userProfile = userProfile;
  return strategy;
}

function createOAuth2StrategyWithRequest<TProfile>(
  options: OAuth2Strategy.StrategyOptionsWithRequest,
  verify: OAuth2Strategy.VerifyFunctionWithRequest<TProfile>,
  userProfile: ProfileFunction<TProfile>,
) {
  const strategy = new OAuth2Strategy(options, verify);
  strategy.userProfile = userProfile;
  return strategy;
}

const StrategyFactory = {
  createVerifyFunction,
  createVerifyFunctionWithRequest,
  createOAuth2Strategy,
  createOAuth2StrategyWithRequest,
  createProfileFunction,
};
export default StrategyFactory;
