import { Router } from "express";

import InvitationHandler from "../../handlers/service/invitation.ts";
import InvitationService from "../../services/invitation.ts";

export function createInvitationRoutes(service?: InvitationService) {
  const handler = new InvitationHandler(service || new InvitationService());
  const router = Router();

  router.post("/", (req, res) => handler.createInvitation(req, res));
  router.get("/me", (req, res) => handler.getInvitations(req, res));
  router.patch("/:invitationId/:action", (req, res) =>
    handler.updateInvitation(req, res),
  );

  return router;
}
