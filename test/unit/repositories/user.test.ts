/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi, it, beforeEach, expect, describe } from "vitest";
import { mockUser } from "../../mocks/user";
import { prismaMock } from "../../mocks/prisma";

import UserRepository from "../../../src/repositories/user";
import TransactionManager from "../../../src/managers/prisma-tx";
import { UserNotFoundError } from "../../../src/utils/error";

// Mock the prisma module
vi.mock("../../../src/lib/prisma.ts", () => ({
  default: prismaMock,
}));

describe("UserRepository", () => {
  let userRepo: UserRepository;

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

    userRepo = new UserRepository();
  });

  describe("delegates to prisma client", () => {
    it("calls prisma.user.create", async () => {
      prismaMock.user.create.mockResolvedValueOnce(mockUser);

      const result = await userRepo.create({ data: { osuUsername: "test" } });

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: { osuUsername: "test" },
      });
    });

    it("calls prisma.user.findUnique", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await userRepo.findUnique({ where: { id: "1" } });

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("throws UserNotFoundError when findUnique returns null", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      const operation = userRepo.findUnique({ where: { id: "nonexistent" } });

      await expect(operation).rejects.toThrow(UserNotFoundError);
    });

    it("calls prisma.user.findMany", async () => {
      const mockUsers = [mockUser, { ...mockUser, id: "2" }];
      prismaMock.user.findMany.mockResolvedValueOnce(mockUsers);

      const result = await userRepo.findMany({ where: { teamId: "1" } });

      expect(result).toEqual(mockUsers);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: { teamId: "1" },
      });
    });

    it("calls prisma.user.findFirst", async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(mockUser);

      const result = await userRepo.findFirst({
        where: { osuUsername: "player" },
      });

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { osuUsername: "player" },
      });
    });

    it("throws UserNotFoundError when findFirst returns null", async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);

      const operation = userRepo.findFirst({
        where: { osuUsername: "nonexistent" },
      });

      await expect(operation).rejects.toThrow(UserNotFoundError);
    });

    it("calls prisma.user.update", async () => {
      const updatedUser = { ...mockUser, osuUsername: "updated" };
      prismaMock.user.update.mockResolvedValueOnce(updatedUser);

      const result = await userRepo.update({
        where: { id: "1" },
        data: { osuUsername: "updated" },
      });

      expect(result).toEqual(updatedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { osuUsername: "updated" },
      });
    });

    it("calls prisma.user.delete", async () => {
      prismaMock.user.delete.mockResolvedValueOnce(mockUser);

      const result = await userRepo.delete({ where: { id: "1" } });

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("calls prisma.user.upsert", async () => {
      prismaMock.user.upsert.mockResolvedValueOnce(mockUser);

      const result = await userRepo.upsert({
        where: { id: "1" },
        create: { osuUsername: "test" },
        update: { osuUsername: "updated" },
      });

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: { id: "1" },
        create: { osuUsername: "test" },
        update: { osuUsername: "updated" },
      });
    });

    it("calls prisma.user.upsert", async () => {
      prismaMock.user.upsert.mockResolvedValueOnce(mockUser);

      const result = await userRepo.upsert({
        where: { id: "1" },
        create: { osuUsername: "test" },
        update: { osuUsername: "updated" },
      });

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: { id: "1" },
        create: { osuUsername: "test" },
        update: { osuUsername: "updated" },
      });
    });
  });

  describe("uses transaction client when in transaction", () => {
    it("uses transaction client for operations", async () => {
      const mockTxClient = {
        user: { create: vi.fn().mockResolvedValueOnce(mockUser) },
      };

      // Override the TransactionManager.getClient mock for this test
      const originalGetClient = TransactionManager.getClient;
      vi.spyOn(TransactionManager, "getClient").mockReturnValueOnce(
        mockTxClient as any,
      );

      await userRepo.create({ data: { osuUsername: "test" } });

      expect(mockTxClient.user.create).toHaveBeenCalledWith({
        data: { osuUsername: "test" },
      });
      expect(prismaMock.user.create).not.toHaveBeenCalled();

      // Restore the original mock
      vi.spyOn(TransactionManager, "getClient").mockReturnValue(
        originalGetClient(),
      );
    });
  });
});
