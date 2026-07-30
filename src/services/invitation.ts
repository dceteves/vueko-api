import TransactionManager from "../managers/prisma-tx.ts";

import InvitationRepository from "../repositories/invitation.ts";
import TeamRepository from "../repositories/team.ts";
import UserRepository from "../repositories/user.ts";
import { ok, err, type Result } from "../utils/result.ts";
import { UnexpectedError, ResourceNotFoundError } from "../utils/error.ts";
import type { GetBatchResult } from "@prisma/client/runtime/client";
import type { Invitation } from "../generated/prisma/client.ts";

export default class InvitationService {
  private invRepo: InvitationRepository;
  private teamRepo: TeamRepository;
  private userRepo: UserRepository;

  constructor(
    invRepo?: InvitationRepository,
    teamRepo?: TeamRepository,
    userRepo?: UserRepository,
  ) {
    this.invRepo = invRepo || new InvitationRepository();
    this.teamRepo = teamRepo || new TeamRepository();
    this.userRepo = userRepo || new UserRepository();
  }

  /**
   * @param id - id of the invitation
   * @param userId - id of the user
   * @return invitation object
   */
  async acceptInvitation(
    id: string,
    userId: string,
  ): Promise<Result<Invitation & GetBatchResult>> {
    const validateInv = async () => {
      const { status, recipientId, teamId } = await this.invRepo.findUnique({
        where: { id },
        select: { status: true, recipientId: true, teamId: true },
      });

      if (recipientId !== userId || status !== "PENDING") {
        throw new Error("Invalid or expired invitation.");
      }

      return teamId;
    };

    const userJoinTeam = async () => {
      const teamId = await validateInv();
      await this.userRepo.update({ where: { id: userId }, data: { teamId } });
    };

    const updateInvitation = async () =>
      await this.invRepo.update({
        where: { id },
        data: { status: "ACCEPTED" },
      });

    const declineRecipientInvs = async () =>
      await this.invRepo.updateMany({
        where: {
          recipientId: userId,
          status: "PENDING",
          id: { not: id },
        },
        data: { status: "DECLINED" },
      });

    const tx = async () => {
      await userJoinTeam();
      const invitation = await updateInvitation();
      const declinedCount = await declineRecipientInvs();
      return { invitation, declinedCount };
    };

    try {
      const { invitation, declinedCount } = await TransactionManager.run(tx);
      const result = { ...invitation, ...declinedCount };
      return ok(result);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  /**
   * Update invitation status to "declined"
   */
  async declineInvitation(id: string): Promise<Result<Invitation>> {
    try {
      const invitation = await this.invRepo.update({
        where: { id },
        data: { status: "DECLINED" },
      });
      return ok(invitation);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  async revokeInvitation(id: string): Promise<Result<Invitation>> {
    try {
      const { status } = await this.invRepo.findUnique({
        where: { id },
        select: { status: true },
      });

      if (status !== "PENDING") {
        throw new Error("Invitation is unrevokable");
      }

      const invitation = await this.invRepo.update({
        where: { id },
        data: { status: "REVOKED" },
      });

      return ok(invitation);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  /**
   *  TODO:
   * Create invite record between sender & recipient
   * @async
   * @param senderId - id of sender
   * @param recipientId - id of recipient
   * @param teamId - id of team
   * @return invitation object
   */
  async createOrSendInvitation(
    senderId: string,
    recipientId: string,
    teamId: string,
  ): Promise<Result<Invitation>> {
    const validateUser = async (id: string) =>
      await this.userRepo.findUnique({ where: { id } });

    const validateTeam = async (id: string) => {
      await this.teamRepo.findUnique({ where: { id } });
    };

    const findInvitation = async () => {
      try {
        // try find invitation
        const { id, status } = await this.invRepo.findFirst({
          where: { senderId, recipientId },
          select: { id: true, status: true },
        });
        if (status === "PENDING") {
          throw new Error("Invite already exists");
        }
        return id;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Only catch ResourceNotFoundError, re-throw others
        if (error instanceof ResourceNotFoundError) {
          return undefined;
        }
        throw error;
      }
    };

    const upsertInvitation = async (id: string | undefined) => {
      return await this.invRepo.upsert({
        where: { id },
        update: { status: "PENDING" },
        create: {
          senderId,
          recipientId,
          teamId,
          status: "PENDING",
        },
      });
    };

    try {
      const invitation = await TransactionManager.run(async () => {
        await validateUser(senderId);
        await validateUser(recipientId);
        await validateTeam(teamId);

        const foundInviteId = await findInvitation();

        return await upsertInvitation(foundInviteId);
      });
      return ok(invitation);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }

  async fetchPendingInvitationsFromUser(
    id: string,
  ): Promise<Result<Invitation[]>> {
    try {
      const { receivedInvites } = await this.userRepo.findUnique({
        where: { id },
        select: { receivedInvites: true },
      });
      return ok(receivedInvites);
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      return err(new UnexpectedError());
    }
  }
}
