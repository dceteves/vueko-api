/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi, describe, it, expect, beforeEach } from "vitest";
import { prismaMock } from "../../mocks/prisma";
import InvitationService from "../../../src/services/invitation";
import { mockInvitation } from "../../mocks/invitation";
import { mockTeam } from "../../mocks/team";
import { mockUser } from "../../mocks/user";
import InvitationRepository from "../../../src/repositories/invitation";
import TeamRepository from "../../../src/repositories/team";
import UserRepository from "../../../src/repositories/user";
import TransactionManager from "../../../src/managers/prisma-tx";
import { TeamNotFoundError } from "../../../src/utils/error";

// Mock the prisma module
vi.mock("../../../src/lib/prisma.ts", () => ({
  default: prismaMock,
}));

describe("InvitationService", () => {
  let invitationService: InvitationService;
  let invRepo: InvitationRepository;
  let teamRepo: TeamRepository;
  let userRepo: UserRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock TransactionManager static methods
    vi.spyOn(TransactionManager, "run").mockImplementation(async (fn) => fn());
    vi.spyOn(TransactionManager, "getClient").mockReturnValue(prismaMock as any);

    invRepo = new InvitationRepository();
    teamRepo = new TeamRepository();
    userRepo = new UserRepository();
    invitationService = new InvitationService(invRepo, teamRepo, userRepo);
  });

  describe("acceptInvitation", () => {
    it("accepts invitation successfully", async () => {
      prismaMock.invitation.findUnique.mockResolvedValueOnce({
        status: "PENDING",
        recipientId: "1",
        teamId: "team-1",
      });
      prismaMock.user.update.mockResolvedValueOnce(mockUser);
      prismaMock.invitation.update.mockResolvedValueOnce(mockInvitation);
      prismaMock.invitation.updateMany.mockResolvedValueOnce({ count: 1 });

      const result = await invitationService.acceptInvitation("inv-1", "1");

      expect(result.ok).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { teamId: "team-1" },
      });
      expect(prismaMock.invitation.update).toHaveBeenCalledWith({
        where: { id: "inv-1" },
        data: { status: "ACCEPTED" },
      });
    });

    it("returns error when invitation is not for the user", async () => {
      prismaMock.invitation.findUnique.mockResolvedValueOnce({
        status: "PENDING",
        recipientId: "different-user",
        teamId: "team-1",
      });

      const result = await invitationService.acceptInvitation("inv-1", "1");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Invalid or expired");
      }
    });

    it("returns error when invitation is not pending", async () => {
      prismaMock.invitation.findUnique.mockResolvedValueOnce({
        status: "ACCEPTED",
        recipientId: "1",
        teamId: "team-1",
      });

      const result = await invitationService.acceptInvitation("inv-1", "1");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Invalid or expired");
      }
    });
  });

  describe("declineInvitation", () => {
    it("declines invitation successfully", async () => {
      prismaMock.invitation.update.mockResolvedValueOnce({
        ...mockInvitation,
        status: "DECLINED",
      });

      const result = await invitationService.declineInvitation("inv-1");

      expect(result.ok).toBe(true);
      expect(prismaMock.invitation.update).toHaveBeenCalledWith({
        where: { id: "inv-1" },
        data: { status: "DECLINED" },
      });
    });

    it("returns error when update fails", async () => {
      prismaMock.invitation.update.mockRejectedValueOnce(
        new Error("Update failed"),
      );

      const result = await invitationService.declineInvitation("inv-1");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Update failed");
      }
    });
  });

  describe("revokeInvitation", () => {
    it("revokes pending invitation successfully", async () => {
      prismaMock.invitation.findUnique.mockResolvedValueOnce({
        status: "PENDING",
      });
      prismaMock.invitation.update.mockResolvedValueOnce({
        ...mockInvitation,
        status: "REVOKED",
      });

      const result = await invitationService.revokeInvitation("inv-1");

      expect(result.ok).toBe(true);
      expect(prismaMock.invitation.update).toHaveBeenCalledWith({
        where: { id: "inv-1" },
        data: { status: "REVOKED" },
      });
    });

    it("returns error when invitation is not pending", async () => {
      prismaMock.invitation.findUnique.mockResolvedValueOnce({
        status: "ACCEPTED",
      });

      const result = await invitationService.revokeInvitation("inv-1");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("unrevokable");
      }
    });

    it("returns error when find fails", async () => {
      prismaMock.invitation.findUnique.mockRejectedValueOnce(
        new Error("Not found"),
      );

      const result = await invitationService.revokeInvitation("inv-1");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Not found");
      }
    });
  });

  describe("createOrSendInvitation", () => {
    it("creates new invitation successfully", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser); // sender
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser); // recipient
      prismaMock.team.findUnique.mockResolvedValueOnce(mockTeam);
      prismaMock.invitation.findFirst.mockResolvedValueOnce(null);
      prismaMock.invitation.upsert.mockResolvedValueOnce(mockInvitation);

      const result = await invitationService.createOrSendInvitation(
        "sender-1",
        "recipient-1",
        "team-1",
      );

      expect(result.ok).toBe(true);
      expect(prismaMock.invitation.upsert).toHaveBeenCalledWith({
        where: { id: undefined },
        update: { status: "PENDING" },
        create: {
          senderId: "sender-1",
          recipientId: "recipient-1",
          teamId: "team-1",
          status: "PENDING",
        },
      });
    });

    it("updates existing invitation when found", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser); // sender
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser); // recipient
      prismaMock.team.findUnique.mockResolvedValueOnce(mockTeam);
      prismaMock.invitation.findFirst.mockResolvedValueOnce({
        id: "existing-inv",
        status: "DECLINED",
      });
      prismaMock.invitation.upsert.mockResolvedValueOnce(mockInvitation);

      const result = await invitationService.createOrSendInvitation(
        "sender-1",
        "recipient-1",
        "team-1",
      );

      expect(result.ok).toBe(true);
      expect(prismaMock.invitation.upsert).toHaveBeenCalledWith({
        where: { id: "existing-inv" },
        update: { status: "PENDING" },
        create: {
          senderId: "sender-1",
          recipientId: "recipient-1",
          teamId: "team-1",
          status: "PENDING",
        },
      });
    });

    it("returns error when pending invitation already exists", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser); // sender
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser); // recipient
      prismaMock.team.findUnique.mockResolvedValueOnce(mockTeam);
      prismaMock.invitation.findFirst.mockResolvedValueOnce({
        id: "existing-inv",
        status: "PENDING",
      });

      const result = await invitationService.createOrSendInvitation(
        "sender-1",
        "recipient-1",
        "team-1",
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("already exists");
      }
    });

    it("returns error when sender does not exist", async () => {
      prismaMock.user.findUnique.mockRejectedValueOnce(
        new Error("User not found"),
      );

      const result = await invitationService.createOrSendInvitation(
        "sender-1",
        "recipient-1",
        "team-1",
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("User not found");
      }
    });

    it("returns error when recipient does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser); // sender
      prismaMock.user.findUnique.mockRejectedValueOnce(
        new Error("User not found"),
      ); // recipient

      const result = await invitationService.createOrSendInvitation(
        "sender-1",
        "recipient-1",
        "team-1",
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("User not found");
      }
    });

    it("returns error when team does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: "1" }); // sender
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: "2" }); // recipient
      prismaMock.team.findUnique.mockRejectedValueOnce(new TeamNotFoundError());

      const result = await invitationService.createOrSendInvitation(
        "sender-1",
        "recipient-1",
        "team-1",
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Team not found");
      }
    });
  });

  describe("fetchPendingInvitationsFromUser", () => {
    it("fetches pending invitations successfully", async () => {
      const mockInvitations = [mockInvitation, { ...mockInvitation, id: "2" }];
      prismaMock.user.findUnique.mockResolvedValueOnce({
        receivedInvites: mockInvitations,
      });

      const result =
        await invitationService.fetchPendingInvitationsFromUser("1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockInvitations);
      }
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        select: { receivedInvites: true },
      });
    });

    it("returns error when user not found", async () => {
      prismaMock.user.findUnique.mockRejectedValueOnce(
        new Error("User not found"),
      );

      const result =
        await invitationService.fetchPendingInvitationsFromUser("1");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("User not found");
      }
    });
  });
});
