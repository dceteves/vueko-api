import { Router } from "express";

import InvitationRequestHandler from "../../handlers/service/invitation.ts";

const invitationServiceRouter = Router();

invitationServiceRouter.post("/", InvitationRequestHandler.createInvitation);
invitationServiceRouter.get("/me", InvitationRequestHandler.getInvitations);
invitationServiceRouter.patch(
  "/:invitationId/:action",
  InvitationRequestHandler.updateInvitation,
);

export default invitationServiceRouter;
