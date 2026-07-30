import { vi, it, beforeEach, expect, describe } from "vitest";
import { mockReset } from "vitest-mock-extended";
import { prismaMock } from "../managers/prisma-mock";
import UserRepository from "../../../src/repositories/user";
import TransactionManager from "../../../src/managers/prisma-tx";
import { UserNotFoundError } from "../../../src/utils/error";
import { mockUser } from "../../mocks/service";

// Mock the prisma module
vi.mock("../../../src/lib/prisma", () => ({
  default: prismaMock,
}));

describe("UserRepository", () => {
  let userRepo: UserRepository;

  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();
    // Set default transaction implementation
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback(prismaMock);
    });
    userRepo = new UserRepository();
  });

  describe("delegates to prisma client", () => {
    it("calls prisma.user.create", async () => {
      prismaMock.user.create.mockResolvedValueOnce(mockUser);

      const result = await userRepo.create({
        data: { osuUsername: "test" },
      });

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: { osuUsername: "test" },
      });
    });

    it("calls prisma.user.findUnique", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await userRepo.findUnique({
        where: { id: "1" },
      });

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("throws UserNotFoundError when findUnique returns null", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        userRepo.findUnique({ where: { id: "nonexistent" } }),
      ).rejects.toThrow(UserNotFoundError);
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

      await expect(
        userRepo.findFirst({ where: { osuUsername: "nonexistent" } }),
      ).rejects.toThrow(UserNotFoundError);
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
  });

  describe("uses transaction client when in transaction", () => {
    it("uses transaction client for operations", async () => {
      const mockTxClient = {
        user: {
          create: vi.fn().mockResolvedValueOnce(mockUser),
        },
      };

      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(mockTxClient as any);
      });

      await TransactionManager.run(async () => {
        await userRepo.create({ data: { osuUsername: "test" } });
      });

      expect(mockTxClient.user.create).toHaveBeenCalledWith({
        data: { osuUsername: "test" },
      });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });
});
