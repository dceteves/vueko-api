import type { Profile } from "passport";

export const PROVIDERS = ["osu", "discord"] as const;

export type Provider = (typeof PROVIDERS)[number];

export type DiscordProfile = Profile;
export interface OsuProfile extends Profile {
  avatar_url: string;
  country_code: string;
}

export type SerializedUser = {
  id: string;
  teamId: string | null;
};

export function isProfile(profile: unknown): profile is Profile {
  return (
    typeof profile === "object" &&
    profile !== null &&
    "id" in profile &&
    "username" in profile &&
    typeof profile.id === "string" &&
    typeof profile.username === "string"
  );
}

export function isOsuProfile(profile: unknown): profile is OsuProfile {
  return (
    // isProfile(profile) &&
    typeof profile === "object" &&
    profile !== null &&
    "avatar_url" in profile &&
    "country_code" in profile &&
    typeof profile.avatar_url === "string" &&
    typeof profile.country_code === "string"
  );
}

/**
 * NOTE: Just use isProfile instead until more discord credentials are used
 */
export function isDiscordProfile(profile: unknown): profile is DiscordProfile {
  return isProfile(profile);
}
