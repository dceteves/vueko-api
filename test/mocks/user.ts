import { mockOsuProfile, mockDiscordProfile } from "./profile.ts";

export const mockUser = {
  id: mockOsuProfile.id,
  createdAt: new Date(),
  osuId: mockOsuProfile.id,
  osuUsername: mockOsuProfile.username,
  osuAvatar: mockOsuProfile.avatar_url,
  countryCode: mockOsuProfile.country_code,
  accessToken: "access",
  refreshToken: "refresh",
  tokenExpiresAt: new Date(),
  osuRank: 1,
  badges: 1,
  timezone: 1,
  registeredAt: new Date(),
  dataFetchedAt: new Date(),
  discordId: mockDiscordProfile.id,
  discordUsername: mockDiscordProfile.username,
};
