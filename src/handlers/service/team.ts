import TeamService from "../../services/team.ts";
import type { TeamRequest, TeamResponse } from "../../types/handler.types.ts";

export default class TeamHandler {
  private service: TeamService;

  constructor(service?: TeamService) {
    this.service = service || new TeamService();
  }

  async createTeam(req: TeamRequest, res: TeamResponse) {
    const captainId = req.user!.id;
    const { name } = req.body;

    const result = await this.service.createTeam(captainId, name.toString());

    if (result.ok) {
      const team = result.value;
      req.user!.teamId = team.id;
      res.json(team);
    } else {
      res.status(401).json({ message: result.error.message });
    }
  }

  async getTeams(_req: TeamRequest, res: TeamResponse) {
    const result = await this.service.getAllTeams();

    if (result.ok) {
      res.json(result.value);
    } else {
      res.status(400).json({ message: "Unexpected error" });
    }
  }

  async getTeam(req: TeamRequest, res: TeamResponse) {
    const { teamId } = req.params;

    const result = await this.service.findTeam(teamId);

    if (result.ok) {
      res.json(result.value);
    } else {
      res.json({ message: result.error.message });
    }
  }

  async changeTeamName(req: TeamRequest, res: TeamResponse) {
    const { teamId } = req.params;
    const { name } = req.body;

    const result = await this.service.updateTeam(teamId, name);

    if (result.ok) {
      res.json(result.value);
    } else {
      res.json({ message: result.error.message });
    }
  }

  async deleteTeam(req: TeamRequest, res: TeamResponse) {
    const { teamId } = req.params;

    const result = await this.service.removeTeam(teamId);

    if (result.ok) {
      res.json(result.value);
    } else {
      res.json({ message: result.error.message });
    }
  }
}
