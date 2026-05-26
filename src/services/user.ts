import prisma from "../lib/prisma.ts";
import { generateUserUpsertArgs } from "../utils/prisma.ts";

import type { User } from "../generated/prisma/client.ts";
import type { OsuProfile, DiscordProfile } from "../types/passport.types.ts";

/**
 * TODO:
 * User creation
 * @async
 * @param accessToken
 * @param refreshToken
 * @param profile - Object containing user info
 * @return user
 */
async function findOrCreateUserFromProfile<TProfile>(
  accessToken: string,
  refreshToken: string,
  profile: TProfile,
): Promise<User> {
  const args = generateUserUpsertArgs<TProfile>(
    accessToken,
    refreshToken,
    profile,
  );
  if (!args) {
    throw new Error("Could not generate query arguments from profile");
  }
  return await prisma.user.upsert(args);
}

/**
 * Fetch user from id
 * @async
 * @throws User not found Error
 * @param userId User ID
 */
async function fetchUser(userId: string): Promise<User | null> {
  return await prisma.user.findUnique({ where: { id: userId } });
}

/**
 * Attach Osu credentials to existing user
 * @async
 */
async function linkOsuProfile(
  userId: string,
  profile: OsuProfile,
): Promise<User> {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      osuId: profile.id,
      osuUsername: profile.username,
      osuAvatar: profile.avatar_url,
      countryCode: profile.country_code,
    },
  });
}

/**
 * Helper function for DiscordStrategy
 * Link discord id and username to user record
 * @async
 * @throws error
 * @param userId
 * @param profile Discord profile (discordId and discordUsername)
 * @return user promise
 */
async function linkDiscordProfile(
  userId: string,
  profile: DiscordProfile,
): Promise<User> {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      discordId: profile.id,
      discordUsername: profile.username,
    },
  });
}

/**
 * Helper function for DiscordStrategy
 * @async
 * @throws error
 * @param userId
 */
async function dropDiscordCredentials(userId: string): Promise<User> {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      discordId: null,
      discordUsername: null,
    },
  });
}

/**
 * Update timezone field of user
 * @async
 * @throws Invalid timezone error
 */
async function updateTimezone(userId: string, timezone: number): Promise<User> {
  if (timezone < -12 || timezone > 14) {
    throw new Error("Invalid timezone specified");
  }
  return await prisma.user.update({
    where: { id: userId },
    data: { timezone },
  });
}

const UserService = {
  findOrCreateUserFromProfile,
  fetchUser,
  linkOsuProfile,
  linkDiscordProfile,
  dropDiscordCredentials,
  updateTimezone,
};

export default UserService;
