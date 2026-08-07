import type { Request, Response } from "express";
import type {
  Team,
  User,
  Invitation,
  Admin,
} from "../generated/prisma/client.ts";
import type { InvitationAction } from "./invitation.types.ts";
import type { Provider } from "./passport.types.ts";

export type SimpleTeam = Pick<Team, "name" | "id">;

export type TeamIdParams = { teamId: string };
export type UserIdParams = { userId: string };
export type InvitationIdParams = { invitationId: string };
export type ActionParams = { action: InvitationAction };
export type ProviderParams = { provider: Provider };
export type UpdateInvitationParams = InvitationIdParams & ActionParams;

export type MessageBody = { message: string };
export type NameBody = { name: string };
export type RecipientIdBody = { recipientId: string };
export type TeamBody = Team | Team[] | SimpleTeam;
export type InvitationBody = Invitation | Invitation[];
export type StateQuery = { state: string };
export type TimezoneBody = { timezone: number };

export type ProviderReqBody = MessageBody;
export type ProviderRequest = Request<ProviderParams>;
export type ProviderResponse = Response<ProviderReqBody>;

export type TeamParams = TeamIdParams;
export type TeamReqBody = TeamBody & NameBody;
export type TeamResBody = MessageBody | TeamBody;
export type TeamRequest = Request<TeamParams, null, TeamReqBody>;
export type TeamResponse = Response<TeamResBody>;

export type UserParams = UserIdParams;
export type UserReqBody = TimezoneBody;
export type UserRequest = Request<UserParams, null, UserReqBody>;
export type UserResponse = Response<MessageBody | User>;

export type CreateInvitationRequest = Request<null, null, RecipientIdBody>;
export type UpdateInvitationRequest = Request<UpdateInvitationParams>;

export type InvitationParams = UpdateInvitationParams;
export type InvitationReqBody = RecipientIdBody;
export type InvitationResBody = MessageBody | InvitationBody;
export type InvitationRequest = Request<
  InvitationParams,
  null,
  InvitationReqBody
>;
export type InvitationResponse = Response<InvitationResBody>;

export type AdminParams = Partial<UserIdParams>;
export type AdminReqBody = MessageBody | Admin | Admin[] | { isAdmin: boolean };
export type AdminRequest = Request<AdminParams, null, AdminReqBody>;
export type AdminResponse = Response<AdminReqBody>;
