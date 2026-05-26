import TeamService from "@services/team.ts";
import type { TeamRequest, TeamResponse } from "../../types/handler.types.ts";

async function createTeam(req: TeamRequest, res: TeamResponse) {
  const captainId = req.user!.id;
  const { name } = req.body;
  if (!name) {
    return res.status(401).json({ message: "Name not specified" });
  }
  try {
    const team = await TeamService.createTeam(captainId, name.toString());
    req.user!.teamId = team.id;
    res.json(team);
  } catch (err) {
    res.status(401).json({ message: (err as Error).message });
  }
}

async function getTeams(_req: TeamRequest, res: TeamResponse) {
  res.json(await TeamService.getAllTeams());
}

async function getTeam(req: TeamRequest, res: TeamResponse) {
  const { teamId } = req.params;
  try {
    res.json(await TeamService.findTeam(teamId));
  } catch (err) {
    res.json({ message: (err as Error).message });
  }
}

async function changeTeamName(req: TeamRequest, res: TeamResponse) {
  const { teamId } = req.params;
  const { name } = req.body;

  try {
    res.json(await TeamService.updateTeam(teamId, name));
  } catch (err) {
    res.json({ message: (err as Error).message });
  }
}

async function deleteTeam(req: TeamRequest, res: TeamResponse) {
  const { teamId } = req.params;
  try {
    await TeamService.deleteTeam(teamId);
    res.json({ message: "Team successfully deleted" });
  } catch (err) {
    res.json({ message: (err as Error).message });
  }
}

export default {
  createTeam,
  getTeams,
  getTeam,
  changeTeamName,
  deleteTeam,
};
