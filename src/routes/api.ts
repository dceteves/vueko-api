import { Router } from "express";

import UserService from "../services/user.ts";
import TeamService from "../services/team.ts";
import InvitationService from "../services/invitation.ts";

import { createUserRoutes } from "./api/user.ts";
import { createTeamRoutes } from "./api/team.ts";
import { createInvitationRoutes } from "./api/invitation.ts";

const userService = new UserService();
const teamService = new TeamService();
const invitationService = new InvitationService();

const apiRouter = Router();

apiRouter.use("/users", createUserRoutes(userService));
apiRouter.use("/teams", createTeamRoutes(teamService));
apiRouter.use("/invitations", createInvitationRoutes(invitationService));

// Debug route
apiRouter.get("/debug", (req, res) => {
  console.log(req.session);
  res.redirect("/");
});

// All-route catcher
apiRouter.get("*splat", (_, res) => {
  res.status(404).json({ message: "Not found" });
});

export default apiRouter;
