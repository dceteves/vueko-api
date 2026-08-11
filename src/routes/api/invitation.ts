import { Router } from "express";

import InvitationHandler from "../../handlers/service/invitation.ts";
import InvitationService from "../../services/invitation.ts";

export function createInvitationRoutes(service?: InvitationService) {
  const handler = new InvitationHandler(service || new InvitationService());
  const router = Router();

  router.post("/", handler.createInvitation.bind(handler));
  router.get("/me", handler.getInvitations.bind(handler));
  router.patch(
    "/:invitationId/:action",
    handler.updateInvitation.bind(handler),
  );

  return router;
}
