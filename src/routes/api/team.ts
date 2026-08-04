import { Router } from "express";

import TeamHandler from "../../handlers/service/team.ts";
import TeamService from "../../services/team.ts";

export function createTeamRoutes(service?: TeamService) {
  const handler = new TeamHandler(service || new TeamService());
  const router = Router();

  router.post("/", handler.createTeam);
  router.get("/", handler.getTeams);
  router.get("/:teamId", handler.getTeam);
  router.patch("/:teamId", handler.changeTeamName);
  router.delete("/:teamId", handler.deleteTeam);

  return router;
}
