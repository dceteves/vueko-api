import type { Team } from "../generated/prisma/client.ts";
import TransactionManager from "../managers/prisma-tx.ts";
import TeamRepository from "../repositories/team.ts";
import UserRepository from "../repositories/user.ts";
import {
  NotProvidedError,
  UnexpectedError,
  UserNotFoundError,
} from "../utils/error.ts";
import { ok, err, type Result } from "../utils/result.ts";

export default class TeamService {
  private userRepo: UserRepository;
  private teamRepo: TeamRepository;

  constructor(userRepo?: UserRepository, teamRepo?: TeamRepository) {
    this.userRepo = userRepo || new UserRepository();
    this.teamRepo = teamRepo || new TeamRepository();
  }

  /**
   * @param captainId - id of the captain
   * @param name - name of the team
   * @return team object
   */
  async createTeam(captainId: string, name: string): Promise<Result<Team>> {
    if (!captainId) {
      return err(new NotProvidedError("Captain ID"));
    }
    if (!name) {
      return err(new NotProvidedError("TeamName"));
    }

    const validateCaptain = async () => {
      try {
        const { discordId, teamId } = await this.userRepo.findUnique({
          where: { id: captainId },
          select: { discordId: true, teamId: true },
        });

        if (!discordId) {
          throw new Error("User does not have Discord linked");
        }

        if (teamId) {
          throw new Error("User is already on a team");
        }

        return null;
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          throw new Error("Captain not found");
        }
        throw error;
      }
    };

    const createTeam = () =>
      this.teamRepo.create({ data: { captainId, name } });

    try {
      const team = await TransactionManager.run(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, team] = await Promise.all([validateCaptain(), createTeam()]);
        return team;
      });
      return ok(team);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  async getAllTeams(): Promise<Result<Team[]>> {
    const teams = await this.teamRepo.findMany({});
    return ok(teams);
  }

  async findTeam(id: string): Promise<Result<Team>> {
    try {
      const team = await this.teamRepo.findUnique({ where: { id } });
      return ok(team);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  async updateTeam(id: string, newName: string): Promise<Result<Team>> {
    try {
      const team = await this.teamRepo.update({
        where: { id: id },
        data: { name: newName },
      });
      return ok(team);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  async removeTeam(id: string): Promise<Result<Team>> {
    const getMembers = async () =>
      await this.teamRepo.findUnique({
        where: { id },
        select: {
          members: {
            select: { id: true },
          },
        },
      });

    const getUpdateMemberTxs = async () => {
      const { members } = await getMembers();

      return members.map(({ id }) => {
        this.userRepo.update({ where: { id }, data: { teamId: null } });
      });
    };

    const tx = async () => {
      const updateMemberTxs = await getUpdateMemberTxs();
      await Promise.all(updateMemberTxs);
      return await this.teamRepo.delete({ where: { id } });
    };

    try {
      const team = await TransactionManager.run(tx);
      return ok(team);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }
}
