import { Router } from "express";

import TeamHandler from "../../handlers/service/team.ts";
import TeamService from "../../services/team.ts";

export function createTeamRoutes(service?: TeamService) {
  const handler = new TeamHandler(service || new TeamService());
  const router = Router();

  router.post("/", handler.createTeam.bind(handler));
  router.get("/", handler.getTeams.bind(handler));
  router.get("/:teamId", handler.getTeam.bind(handler));
  router.patch("/:teamId", handler.changeTeamName.bind(handler));
  router.delete("/:teamId", handler.deleteTeam.bind(handler));

  return router;
}
