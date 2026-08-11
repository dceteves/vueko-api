import { Router } from "express";

import TeamHandler from "../../handlers/service/team.ts";
import TeamService from "../../services/team.ts";

export function createTeamRoutes(service?: TeamService) {
  const handler = new TeamHandler(service || new TeamService());
  const router = Router();

  router.post("/", (req, res) => handler.createTeam(req, res));
  router.get("/", (req, res) => handler.getTeams(req, res));
  router.get("/:teamId", (req, res) => handler.getTeam(req, res));
  router.patch("/:teamId", (req, res) => handler.changeTeamName(req, res));
  router.delete("/:teamId", (req, res) => handler.deleteTeam(req, res));

  return router;
}
