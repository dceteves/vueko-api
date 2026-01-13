import type { Request, Response } from 'express';
import type { Team, User, Invitation } from '../generated/prisma/client';
import type { InvitationAction } from './invitation.types';
import type { Provider } from './passport.types';

export declare type SimpleTeam = Pick<Team, 'name' | 'id'>;

export declare type TeamIdParams = { teamId: string };
export declare type UserIdParams = { userId: string };
export declare type InvitationIdParams = { invitationId: string };
export declare type ActionParams = { action: InvitationAction };
export declare type ProviderParams = { provider: Provider };
export declare type UpdateInvitationParams = InvitationIdParams & ActionParams;

export declare type MessageBody = { message: string };
export declare type NameBody = { name: string };
export declare type RecipientIdBody = { recipientId: string };
export declare type TeamBody = Team | Team[] | SimpleTeam;
export declare type InvitationBody = Invitation | Invitation[];
export declare type StateQuery = { state: string };
export declare type TimezoneBody = { timezone: number };

export declare type ProviderReqBody = MessageBody;
export declare type ProviderRequest = Request<ProviderParams>;
export declare type ProviderResponse = Response<ProviderReqBody>;

export declare type TeamParams = TeamIdParams;
export declare type TeamReqBody = TeamBody & NameBody;
export declare type TeamResBody = MessageBody | TeamBody;
export declare type TeamRequest = Request<TeamParams, null, TeamReqBody>;
export declare type TeamResponse = Response<TeamResBody>;

export declare type UserParams = UserIdParams;
export declare type UserReqBody = TimezoneBody;
export declare type UserRequest = Request<UserParams, null, UserReqBody>;
export declare type UserResponse = Response<MessageBody | User>;

export declare type CreateInvitationRequest = Request<null, null, RecipientIdBody>;
export declare type UpdateInvitationRequest = Request<UpdateInvitationParams>;

export declare type InvitationParams = UpdateInvitationParams;
export declare type InvitationReqBody = RecipientIdBody;
export declare type InvitationResBody = MessageBody | InvitationBody;
export declare type InvitationRequest = Request<InvitationParams, null, InvitationReqBody>;
export declare type InvitationResponse = Response<InvitationResBody>;
