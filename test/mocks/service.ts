import { mockOsuProfile, mockDiscordProfile } from "./profile.ts";

import type {
  Invitation,
  Team,
  User,
} from "../../src/generated/prisma/client.ts";

export const mockUser: User = {
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
  teamId: "1",
};

export const mockTeam: Team = {
  id: "1",
  name: "team",
  isRegistered: true,
  createdAt: new Date(),
  captainId: mockUser.id,
};

export const mockInvitation: Invitation = {
  id: "1",
  status: "PENDING",
  createdAt: new Date(),
  teamId: mockTeam.id,
  senderId: mockUser.id,
  recipientId: mockUser.id,
};
