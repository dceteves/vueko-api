/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi, describe, it, expect, beforeEach } from "vitest";
import { prismaMock } from "../../mocks/prisma";
import TeamService from "../../../src/services/team";
import { mockTeam } from "../../mocks/team";
import { mockUser } from "../../mocks/user";
import { NotProvidedError, UserNotFoundError } from "../../../src/utils/error";
import TransactionManager from "../../../src/managers/prisma-tx";
import UserRepository from "../../../src/repositories/user";
import TeamRepository from "../../../src/repositories/team";

// Mock the prisma module
vi.mock("../../../src/lib/prisma", () => ({
  default: prismaMock,
}));

describe("TeamService", () => {
  let teamService: TeamService;
  let userRepo: UserRepository;
  let teamRepo: TeamRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default transaction implementation
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback(prismaMock);
    });

    vi.spyOn(TransactionManager, "getClient").mockReturnValue(
      prismaMock as any,
    );

    vi.spyOn(TransactionManager, "run").mockImplementation(async (fn) => fn());

    // Create mock repositories
    userRepo = new UserRepository();
    teamRepo = new TeamRepository();
    teamService = new TeamService(userRepo, teamRepo);
  });

  describe("createTeam", () => {
    it("returns error when captainId is not provided", async () => {
      const result = await teamService.createTeam("", "teamName");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotProvidedError);
        expect(result.error.message).toContain("Captain ID");
      }
    });

    it("returns error when name is not provided", async () => {
      const result = await teamService.createTeam("1", "");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotProvidedError);
        expect(result.error.message).toContain("TeamName");
      }
    });

    it("returns error when captain does not exist", async () => {
      prismaMock.user.findUnique.mockRejectedValueOnce(new UserNotFoundError());

      const result = await teamService.createTeam("nonexistent", "teamName");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Captain not found");
      }
    });

    it("returns error when captain does not have Discord linked", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        discordId: null,
        teamId: null,
      });

      const result = await teamService.createTeam("1", "teamName");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Discord linked");
      }
    });

    it("returns error when captain is already on a team", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        discordId: "123",
        teamId: "existing-team",
      });

      const result = await teamService.createTeam("1", "teamName");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("already on a team");
      }
    });

    it("creates team successfully when captain is valid", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        discordId: "123",
        teamId: null,
      });
      prismaMock.team.create.mockResolvedValueOnce(mockTeam);

      const result = await teamService.createTeam("1", "teamName");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockTeam);
      }
      expect(prismaMock.team.create).toHaveBeenCalledWith({
        data: { captainId: "1", name: "teamName" },
      });
    });
  });

  describe("getAllTeams", () => {
    it("returns all teams", async () => {
      const mockTeams = [mockTeam, { ...mockTeam, id: "2" }];
      prismaMock.team.findMany.mockResolvedValueOnce(mockTeams);

      const result = await teamService.getAllTeams();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockTeams);
      }
      expect(prismaMock.team.findMany).toHaveBeenCalledWith({});
    });
  });

  describe("findTeam", () => {
    it("returns team for valid id", async () => {
      prismaMock.team.findUnique.mockResolvedValueOnce(mockTeam);

      const result = await teamService.findTeam("1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockTeam);
      }
      expect(prismaMock.team.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("returns error when team is not found", async () => {
      prismaMock.team.findUnique.mockRejectedValueOnce(
        new Error("Team not found"),
      );

      const result = await teamService.findTeam("nonexistent");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Team not found");
      }
    });
  });

  describe("updateTeam", () => {
    it("updates team name successfully", async () => {
      const updatedTeam = { ...mockTeam, name: "updatedName" };
      prismaMock.team.update.mockResolvedValueOnce(updatedTeam);

      const result = await teamService.updateTeam("1", "updatedName");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(updatedTeam);
      }
      expect(prismaMock.team.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { name: "updatedName" },
      });
    });

    it("returns error when update fails", async () => {
      prismaMock.team.update.mockRejectedValueOnce(new Error("Update failed"));

      const result = await teamService.updateTeam("1", "updatedName");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Update failed");
      }
    });
  });

  describe("removeTeam", () => {
    it("removes team and updates members successfully", async () => {
      const mockMembers = [{ id: "1" }, { id: "2" }];

      prismaMock.team.findUnique.mockResolvedValueOnce({
        members: mockMembers,
      });
      prismaMock.user.update.mockResolvedValueOnce(mockUser);
      prismaMock.team.delete.mockResolvedValueOnce(mockTeam);

      const result = await teamService.removeTeam("1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockTeam);
      }
      expect(prismaMock.team.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        select: {
          members: {
            select: { id: true },
          },
        },
      });
      expect(prismaMock.user.update).toHaveBeenCalledTimes(2);
      expect(prismaMock.team.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("removes team with no members successfully", async () => {
      prismaMock.team.findUnique.mockResolvedValueOnce({ members: [] });
      prismaMock.team.delete.mockResolvedValueOnce(mockTeam);

      const result = await teamService.removeTeam("1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockTeam);
      }
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(prismaMock.team.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("returns error when team not found", async () => {
      prismaMock.team.findUnique.mockRejectedValueOnce(
        new Error("Team not found"),
      );

      const result = await teamService.removeTeam("1");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Team not found");
      }
    });

    it("returns error when deletion fails", async () => {
      prismaMock.team.findUnique.mockResolvedValueOnce({ members: [] });
      prismaMock.team.delete.mockRejectedValueOnce(new Error("Delete failed"));

      const result = await teamService.removeTeam("1");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Delete failed");
      }
    });
  });
});
