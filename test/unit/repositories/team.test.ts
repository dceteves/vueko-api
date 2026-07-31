/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi, it, beforeEach, expect, describe } from "vitest";
import { prismaMock } from "../../mocks/prisma";
import TeamRepository from "../../../src/repositories/team";
import TransactionManager from "../../../src/managers/prisma-tx";
import { TeamNotFoundError } from "../../../src/utils/error";
import { mockTeam } from "../../mocks/team";

// Mock the prisma module
vi.mock("../../../src/lib/prisma.ts", () => ({
  default: prismaMock,
}));

describe("TeamRepository", () => {
  let teamRepo: TeamRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock TransactionManager static methods
    vi.spyOn(TransactionManager, "run").mockImplementation(async (fn) => fn());
    vi.spyOn(TransactionManager, "getClient").mockReturnValue(
      prismaMock as any,
    );

    // Set default transaction implementation
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback(prismaMock);
    });
    teamRepo = new TeamRepository();
  });

  describe("delegates to prisma client", () => {
    it("calls prisma.team.create", async () => {
      prismaMock.team.create.mockResolvedValueOnce(mockTeam);

      const result = await teamRepo.create({
        data: { name: "test", captainId: "1" },
      });

      expect(result).toEqual(mockTeam);
      expect(prismaMock.team.create).toHaveBeenCalledWith({
        data: { name: "test", captainId: "1" },
      });
    });

    it("calls prisma.team.findUnique", async () => {
      prismaMock.team.findUnique.mockResolvedValueOnce(mockTeam);

      const result = await teamRepo.findUnique({
        where: { id: "1" },
      });

      expect(result).toEqual(mockTeam);
      expect(prismaMock.team.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("throws TeamNotFoundError when findUnique returns null", async () => {
      prismaMock.team.findUnique.mockResolvedValueOnce(null);

      await expect(
        teamRepo.findUnique({ where: { id: "nonexistent" } }),
      ).rejects.toThrow(TeamNotFoundError);
    });

    it("calls prisma.team.findMany", async () => {
      const mockTeams = [mockTeam, { ...mockTeam, id: "2" }];
      prismaMock.team.findMany.mockResolvedValueOnce(mockTeams);

      const result = await teamRepo.findMany({ where: { isRegistered: true } });

      expect(result).toEqual(mockTeams);
      expect(prismaMock.team.findMany).toHaveBeenCalledWith({
        where: { isRegistered: true },
      });
    });

    it("calls prisma.team.findFirst", async () => {
      prismaMock.team.findFirst.mockResolvedValueOnce(mockTeam);

      const result = await teamRepo.findFirst({
        where: { name: "team" },
      });

      expect(result).toEqual(mockTeam);
      expect(prismaMock.team.findFirst).toHaveBeenCalledWith({
        where: { name: "team" },
      });
    });

    it("throws TeamNotFoundError when findFirst returns null", async () => {
      prismaMock.team.findFirst.mockResolvedValueOnce(null);

      await expect(
        teamRepo.findFirst({ where: { name: "nonexistent" } }),
      ).rejects.toThrow(TeamNotFoundError);
    });

    it("calls prisma.team.update", async () => {
      const updatedTeam = { ...mockTeam, name: "updated" };
      prismaMock.team.update.mockResolvedValueOnce(updatedTeam);

      const result = await teamRepo.update({
        where: { id: "1" },
        data: { name: "updated" },
      });

      expect(result).toEqual(updatedTeam);
      expect(prismaMock.team.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { name: "updated" },
      });
    });

    it("calls prisma.team.delete", async () => {
      prismaMock.team.delete.mockResolvedValueOnce(mockTeam);

      const result = await teamRepo.delete({ where: { id: "1" } });

      expect(result).toEqual(mockTeam);
      expect(prismaMock.team.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("calls prisma.team.upsert", async () => {
      prismaMock.team.upsert.mockResolvedValueOnce(mockTeam);

      const result = await teamRepo.upsert({
        where: { id: "1" },
        create: { name: "test", captainId: "1" },
        update: { name: "updated" },
      });

      expect(result).toEqual(mockTeam);
      expect(prismaMock.team.upsert).toHaveBeenCalledWith({
        where: { id: "1" },
        create: { name: "test", captainId: "1" },
        update: { name: "updated" },
      });
    });
  });

  describe("uses transaction client when in transaction", () => {
    it("uses transaction client for operations", async () => {
      const mockTxClient = {
        team: {
          create: vi.fn().mockResolvedValueOnce(mockTeam),
        },
      };

      // Override the TransactionManager.getClient mock for this test
      const originalGetClient = TransactionManager.getClient;
      vi.spyOn(TransactionManager, "getClient").mockReturnValueOnce(
        mockTxClient as any,
      );

      await teamRepo.create({ data: { name: "test", captainId: "1" } });

      expect(mockTxClient.team.create).toHaveBeenCalledWith({
        data: { name: "test", captainId: "1" },
      });
      expect(prismaMock.team.create).not.toHaveBeenCalled();

      // Restore the original mock
      TransactionManager.getClient.mockReturnValue(originalGetClient());
    });
  });
});
