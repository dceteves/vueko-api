import {
  isOsuProfile,
  isDiscordProfile,
  type OsuProfile,
  type DiscordProfile,
} from "../types/passport.types.ts";

/**
 * Helper function for userFromProfile
 */
export function extractProfile(profile: unknown) {
  if (isOsuProfile(profile)) {
    return extractOsuProfile(profile);
  }

  if (isDiscordProfile(profile)) {
    return extractDiscordProfile(profile);
  }

  return null;
}

function extractOsuProfile(profile: OsuProfile) {
  return {
    where: { osuId: profile.id },
    update: {
      osuUsername: profile.username || profile.displayName,
      osuAvatar: profile.avatar_url,
      countryCode: profile.country_code,
    },
  };
}

function extractDiscordProfile(profile: DiscordProfile) {
  return {
    where: { discordId: profile.id },
    update: { discordUsername: profile.username || profile.displayName },
  };
}
