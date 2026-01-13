import * as InvitationService from '../../services/invitation.ts';
import type { InvitationResponse, InvitationRequest } from '../../types/handler.types.ts';

async function createInvitation(req: InvitationRequest, res: InvitationResponse) {
  const teamId = req.user!.teamId;
  const senderId = req.user!.id;
  const { recipientId } = req.body;

  if (!senderId) {
    return res.status(401).json({ message: 'senderId not specified' });
  }
  if (!recipientId) {
    return res.status(401).json({ message: 'recipientId not specified' });
  }
  if (!teamId) {
    return res.status(401).json({ message: 'teamId not specified' });
  }

  try {
    res.json(await InvitationService.createOrSendInvitation(senderId, recipientId, teamId));
  } catch (err) {
    res.status(401).json({ message: (err as Error).message });
  }
}

async function getInvitations(req: InvitationRequest, res: InvitationResponse) {
  res.json(await InvitationService.fetchInvitations(req.user!.id));
}

async function updateInvitation(req: InvitationRequest, res: InvitationResponse) {
  const { invitationId, action } = req.params;

  // prettier-ignore
  const INVITATION_ACTIONS = {
    'accept': InvitationService.acceptInvitation(req.user!.id, invitationId),
    'decline': InvitationService.declineInvitation(invitationId),
    'revoke': InvitationService.revokeInvitation(invitationId),
  } as const;

  try {
    res.json(await INVITATION_ACTIONS[action]);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
}

export default {
  createInvitation,
  getInvitations,
  updateInvitation,
};
