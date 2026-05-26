import OAuth2Strategy from "passport-oauth2";
import UserService from "@services/user.ts";

import type { Request } from "express";
import type { User } from "@generated/prisma/client.ts";

type ProfileFunction<TProfile> = (
  accessToken: string,
  done: (err?: unknown, profile?: TProfile) => void,
) => void;

function createVerifyFunction<
  TProfile,
>(): OAuth2Strategy.VerifyFunction<TProfile> {
  const verify = async (
    accessToken: string,
    refreshToken: string,
    profile: TProfile,
    done: OAuth2Strategy.VerifyCallback,
  ) => {
    try {
      const user = await UserService.findOrCreateUserFromProfile<TProfile>(
        accessToken,
        refreshToken,
        profile,
      );
      done(null, user);
    } catch (err) {
      done(err as Error);
    }
  };
  return verify;
}

function createVerifyFunctionWithRequest<TProfile>(
  linkFunction: (userId: string, profile: TProfile) => Promise<User>,
): OAuth2Strategy.VerifyFunctionWithRequest<TProfile> {
  return async function (
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: TProfile,
    done: OAuth2Strategy.VerifyCallback,
  ) {
    if (!req.user) {
      return done(new Error("User not found"));
    }
    try {
      const user = await linkFunction(req.user.id, profile);
      done(null, user);
    } catch (err) {
      done(err as Error);
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

export default {
  createVerifyFunction,
  createVerifyFunctionWithRequest,
  createOAuth2Strategy,
  createOAuth2StrategyWithRequest,
  createProfileFunction,
};
