import { vi, it, beforeEach, expect, describe } from "vitest";
import { mockReset } from "vitest-mock-extended";
import { prismaMock } from "../managers/prisma-mock";
import InvitationRepository from "../../../src/repositories/invitation";
import TransactionManager from "../../../src/managers/prisma-tx";
import { InvitationNotFoundError } from "../../../src/utils/error";
import { mockInvitation } from "../../mocks/invitation";

// Mock the prisma module
vi.mock("../../../src/lib/prisma.ts", () => ({
  default: prismaMock,
}));

describe("InvitationRepository", () => {
  let invitationRepo: InvitationRepository;

  beforeEach(() => {
    // Don't use mockReset as it destroys the deep mock structure
    // Just clear the mock calls and histories
    prismaMock.invitation.findUnique.mockClear();
    prismaMock.invitation.findMany.mockClear();
    prismaMock.invitation.findFirst.mockClear();
    prismaMock.invitation.create.mockClear();
    prismaMock.invitation.update.mockClear();
    prismaMock.invitation.delete.mockClear();
    prismaMock.invitation.upsert.mockClear();
    prismaMock.$transaction.mockClear();

    // Mock TransactionManager static methods
    vi.spyOn(TransactionManager, "run").mockImplementation(async (fn) => fn());
    vi.spyOn(TransactionManager, "getClient").mockReturnValue(prismaMock as any);

    // Set default transaction implementation
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback(prismaMock);
    });
    invitationRepo = new InvitationRepository();
  });

  describe("delegates to prisma client", () => {
    it("calls prisma.invitation.create", async () => {
      prismaMock.invitation.create.mockResolvedValueOnce(mockInvitation);

      const result = await invitationRepo.create({
        data: { teamId: "1", senderId: "1", recipientId: "2" },
      });

      expect(result).toEqual(mockInvitation);
      expect(prismaMock.invitation.create).toHaveBeenCalledWith({
        data: { teamId: "1", senderId: "1", recipientId: "2" },
      });
    });

    it("calls prisma.invitation.findUnique", async () => {
      prismaMock.invitation.findUnique.mockResolvedValueOnce(mockInvitation);

      const result = await invitationRepo.findUnique({
        where: { id: "1" },
      });

      expect(result).toEqual(mockInvitation);
      expect(prismaMock.invitation.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("throws InvitationNotFoundError when findUnique returns null", async () => {
      prismaMock.invitation.findUnique.mockResolvedValueOnce(null);

      await expect(
        invitationRepo.findUnique({ where: { id: "nonexistent" } }),
      ).rejects.toThrow(InvitationNotFoundError);
    });

    it("calls prisma.invitation.findMany", async () => {
      const mockInvitations = [
        mockInvitation,
        { ...mockInvitation, id: "2" },
      ];
      prismaMock.invitation.findMany.mockResolvedValueOnce(mockInvitations);

      const result = await invitationRepo.findMany({
        where: { status: "PENDING" },
      });

      expect(result).toEqual(mockInvitations);
      expect(prismaMock.invitation.findMany).toHaveBeenCalledWith({
        where: { status: "PENDING" },
      });
    });

    it("calls prisma.invitation.findFirst", async () => {
      prismaMock.invitation.findFirst.mockResolvedValueOnce(mockInvitation);

      const result = await invitationRepo.findFirst({
        where: { recipientId: "1" },
      });

      expect(result).toEqual(mockInvitation);
      expect(prismaMock.invitation.findFirst).toHaveBeenCalledWith({
        where: { recipientId: "1" },
      });
    });

    it("throws InvitationNotFoundError when findFirst returns null", async () => {
      prismaMock.invitation.findFirst.mockResolvedValueOnce(null);

      await expect(
        invitationRepo.findFirst({ where: { recipientId: "nonexistent" } }),
      ).rejects.toThrow(InvitationNotFoundError);
    });

    it("calls prisma.invitation.update", async () => {
      const updatedInvitation = { ...mockInvitation, status: "ACCEPTED" };
      prismaMock.invitation.update.mockResolvedValueOnce(updatedInvitation);

      const result = await invitationRepo.update({
        where: { id: "1" },
        data: { status: "ACCEPTED" },
      });

      expect(result).toEqual(updatedInvitation);
      expect(prismaMock.invitation.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { status: "ACCEPTED" },
      });
    });

    it("calls prisma.invitation.delete", async () => {
      prismaMock.invitation.delete.mockResolvedValueOnce(mockInvitation);

      const result = await invitationRepo.delete({ where: { id: "1" } });

      expect(result).toEqual(mockInvitation);
      expect(prismaMock.invitation.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("calls prisma.invitation.upsert", async () => {
      prismaMock.invitation.upsert.mockResolvedValueOnce(mockInvitation);

      const result = await invitationRepo.upsert({
        where: { id: "1" },
        create: { teamId: "1", senderId: "1", recipientId: "2" },
        update: { status: "ACCEPTED" },
      });

      expect(result).toEqual(mockInvitation);
      expect(prismaMock.invitation.upsert).toHaveBeenCalledWith({
        where: { id: "1" },
        create: { teamId: "1", senderId: "1", recipientId: "2" },
        update: { status: "ACCEPTED" },
      });
    });

    it("calls prisma.invitation.updateMany", async () => {
      const mockCount = { count: 2 };
      prismaMock.invitation.updateMany.mockResolvedValueOnce(mockCount);

      const result = await invitationRepo.updateMany({
        where: { status: "PENDING" },
        data: { status: "DECLINED" },
      });

      expect(result).toEqual(mockCount);
      expect(prismaMock.invitation.updateMany).toHaveBeenCalledWith({
        where: { status: "PENDING" },
        data: { status: "DECLINED" },
      });
    });
  });

  describe("uses transaction client when in transaction", () => {
    it("uses transaction client for operations", async () => {
      const mockTxClient = {
        invitation: {
          create: vi.fn().mockResolvedValueOnce(mockInvitation),
        },
      };

      // Override the TransactionManager.getClient mock for this test
      const originalGetClient = TransactionManager.getClient;
      vi.spyOn(TransactionManager, "getClient").mockReturnValueOnce(mockTxClient as any);

      await invitationRepo.create({
        data: { teamId: "1", senderId: "1", recipientId: "2" },
      });

      expect(mockTxClient.invitation.create).toHaveBeenCalledWith({
        data: { teamId: "1", senderId: "1", recipientId: "2" },
      });
      expect(prismaMock.invitation.create).not.toHaveBeenCalled();

      // Restore the original mock
      TransactionManager.getClient.mockReturnValue(originalGetClient());
    });
  });
});
