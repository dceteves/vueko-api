import { Router } from "express";

import TeamRequestHandler from "../../handlers/service/team.ts";

const teamServiceRouter = Router();

teamServiceRouter.post("/", TeamRequestHandler.createTeam);
teamServiceRouter.get("/", TeamRequestHandler.getTeams);
teamServiceRouter.get("/:teamId", TeamRequestHandler.getTeam);
teamServiceRouter.patch("/:teamId", TeamRequestHandler.changeTeamName);
teamServiceRouter.delete("/:teamId", TeamRequestHandler.deleteTeam);

export default teamServiceRouter;
