import InvitationService from "../../services/invitation.ts";

import type { Invitation } from "../../generated/prisma/client.ts";
import type { InvitationAction } from "../../types/invitation.types.ts";
import type {
  InvitationRequest,
  InvitationResponse,
} from "../../types/handler.types.ts";
import type { Result } from "../../utils/result.ts";

export default class InvitationHandler {
  private service: InvitationService;

  constructor(service?: InvitationService) {
    this.service = service || new InvitationService();
  }

  async createInvitation(req: InvitationRequest, res: InvitationResponse) {
    const teamId = req.user!.teamId;
    const senderId = req.user!.id;
    const { recipientId } = req.body;

    if (!senderId) {
      return res.status(401).json({ message: "senderId not specified" });
    }
    if (!recipientId) {
      return res.status(401).json({ message: "recipientId not specified" });
    }
    if (!teamId) {
      return res.status(401).json({ message: "teamId not specified" });
    }

    const result = await this.service.createOrSendInvitation(
      senderId,
      recipientId,
      teamId,
    );

    if (result.ok) {
      res.json(result.value);
    } else {
      res.status(404).json({ message: result.error.message });
    }
  }

  async getInvitations(req: InvitationRequest, res: InvitationResponse) {
    const result = await this.service.fetchPendingInvitationsFromUser(
      req.user!.id,
    );

    if (result.ok) {
      res.json(result.value);
    } else {
      res.status(404).json({ message: result.error.message });
    }
  }

  async updateInvitation(req: InvitationRequest, res: InvitationResponse) {
    const { invitationId, action } = req.params;

    const invitationHandlers = {
      accept: () => this.service.acceptInvitation(invitationId, req.user!.id),
      decline: () => this.service.declineInvitation(invitationId),
      revoke: () => this.service.revokeInvitation(invitationId),
    } satisfies Record<InvitationAction, () => Promise<Result<Invitation>>>;

    const result = await invitationHandlers[action]();

    if (result.ok) {
      res.json(result.value);
    } else {
      res.status(404).json({ message: result.error.message });
    }
  }
}
