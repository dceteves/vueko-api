import { isOsuProfile, isDiscordProfile } from "../types/passport.types.ts";
import type { UserUpsertArgs } from "../generated/prisma/models.ts";

/**
 * Helper function for findOrCreateUserFromProfile
 */
export function generateUserUpsertArgs<TProfile>(
  accessToken: string,
  refreshToken: string,
  profile: TProfile,
): UserUpsertArgs | null {
  let where, data;

  if (isOsuProfile(profile)) {
    where = { osuId: profile.id };
    data = {
      accessToken,
      refreshToken,
      osuUsername: profile.username,
      osuAvatar: profile.avatar_url,
      countryCode: profile.country_code,
      tokenExpiresAt: new Date(Date.now() + 86400 * 1000),
    };
  } else if (isDiscordProfile(profile)) {
    where = { discordId: profile.id };
    data = { discordUsername: profile.username };
  } else {
    return null;
  }

  return {
    where: where,
    update: data,
    create: { ...where, ...data },
  };
}
