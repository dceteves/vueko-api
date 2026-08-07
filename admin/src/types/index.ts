export interface User {
  id: string;
  createdAt: string;
  osuId?: string;
  osuUsername?: string;
  osuAvatar?: string;
  countryCode?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  osuRank?: number;
  badges?: number;
  timezone?: number;
  registeredAt: string;
  dataFetchedAt?: string;
  discordId?: string;
  discordUsername?: string;
  teamId?: string;
  team?: Team;
  captainedTeam?: Team;
}

export interface Team {
  id: string;
  name: string;
  isRegistered: boolean;
  createdAt: string;
  captainId: string;
  captain?: User;
  members?: User[];
  invitations?: Invitation[];
}

export const InvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  REVOKED: "REVOKED",
} as const;

export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus];

export interface Invitation {
  id: string;
  status: InvitationStatus;
  createdAt: string;
  teamId: string;
  team?: Team;
  senderId: string;
  sender?: User;
  recipientId: string;
  recipient?: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}