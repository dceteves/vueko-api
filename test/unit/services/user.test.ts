/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi, describe, it, expect, beforeEach } from "vitest";
import { prismaMock } from "../../mocks/prisma";
import UserService from "../../../src/services/user";
import UserRepository from "../../../src/repositories/user";
import { mockUser } from "../../mocks/user";
import { mockDiscordProfile, mockOsuProfile } from "../../mocks/profile";
import { NotProvidedError } from "../../../src/utils/error";
import TransactionManager from "../../../src/managers/prisma-tx";

// Mock the prisma module
vi.mock("../../../src/lib/prisma", () => ({
  default: prismaMock,
}));

describe("UserService", () => {
  let userService: UserService;
  let userRepo: UserRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(TransactionManager, "getClient").mockReturnValue(
      prismaMock as any,
    );

    // Create a mock repository using the prisma mock
    userRepo = new UserRepository();
    userService = new UserService(userRepo);
  });

  describe("userFromProfile", () => {
    it("returns error when access token is not provided", async () => {
      const result = await userService.userFromProfile(
        "",
        "refresh",
        mockOsuProfile,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotProvidedError);
        expect(result.error.message).toContain("Access token");
      }
    });

    it("returns error when refresh token is not provided", async () => {
      const result = await userService.userFromProfile(
        "access",
        "",
        mockOsuProfile,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotProvidedError);
        expect(result.error.message).toContain("Refresh token");
      }
    });

    it("returns error when profile is invalid", async () => {
      const invalidProfile = { foo: "bar" } as any;
      const result = await userService.userFromProfile(
        "access",
        "refresh",
        invalidProfile,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Invalid profile");
      }
    });

    it("returns user for valid osu profile", async () => {
      prismaMock.user.upsert.mockResolvedValueOnce(mockUser);

      const result = await userService.userFromProfile(
        "access",
        "refresh",
        mockOsuProfile,
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockUser);
      }
      expect(prismaMock.user.upsert).toHaveBeenCalled();
    });

    it("returns user for valid discord profile", async () => {
      prismaMock.user.upsert.mockResolvedValueOnce(mockUser);

      const result = await userService.userFromProfile(
        "access",
        "refresh",
        mockDiscordProfile,
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockUser);
      }
      expect(prismaMock.user.upsert).toHaveBeenCalled();
    });
  });

  describe("findUser", () => {
    it("returns error when id is not provided", async () => {
      const result = await userService.findUser("");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotProvidedError);
        expect(result.error.message).toContain("Id");
      }
    });

    it("returns user for valid id", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await userService.findUser("1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockUser);
      }
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });
  });

  describe("linkOsuProfile", () => {
    it("returns error when id is not provided", async () => {
      const result = await userService.linkOsuProfile("", mockOsuProfile);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotProvidedError);
        expect(result.error.message).toContain("Id");
      }
    });

    it("returns user when osu profile is linked successfully", async () => {
      const updatedUser = { ...mockUser, osuId: mockOsuProfile.id };
      prismaMock.user.update.mockResolvedValueOnce(updatedUser);

      const result = await userService.linkOsuProfile("1", mockOsuProfile);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(updatedUser);
      }
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          osuId: mockOsuProfile.id,
          osuUsername: mockOsuProfile.username,
          osuAvatar: mockOsuProfile.avatar_url,
          countryCode: mockOsuProfile.country_code,
        },
      });
    });

    it("returns error when update fails", async () => {
      prismaMock.user.update.mockRejectedValueOnce(new Error("Update failed"));

      const result = await userService.linkOsuProfile("1", mockOsuProfile);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Update failed");
      }
    });
  });

  describe("linkDiscordProfile", () => {
    it("returns error when id is not provided", async () => {
      const result = await userService.linkDiscordProfile(
        "",
        mockDiscordProfile,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotProvidedError);
        expect(result.error.message).toContain("Id");
      }
    });

    it("returns user when discord profile is linked successfully", async () => {
      const updatedUser = { ...mockUser, discordId: mockDiscordProfile.id };
      prismaMock.user.update.mockResolvedValueOnce(updatedUser);

      const result = await userService.linkDiscordProfile(
        "1",
        mockDiscordProfile,
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(updatedUser);
      }
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          discordId: mockDiscordProfile.id,
          discordUsername: mockDiscordProfile.username,
        },
      });
    });

    it("returns error when update fails", async () => {
      prismaMock.user.update.mockRejectedValueOnce(new Error("Update failed"));

      const result = await userService.linkDiscordProfile(
        "1",
        mockDiscordProfile,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Update failed");
      }
    });
  });

  describe("dropDiscordCredentials", () => {
    it("returns error when id is not provided", async () => {
      const result = await userService.dropDiscordCredentials("");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotProvidedError);
        expect(result.error.message).toContain("Id");
      }
    });

    it("returns user when discord credentials are dropped successfully", async () => {
      const updatedUser = {
        ...mockUser,
        discordId: null,
        discordUsername: null,
      };
      prismaMock.user.update.mockResolvedValueOnce(updatedUser);

      const result = await userService.dropDiscordCredentials("1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(updatedUser);
      }
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          discordId: null,
          discordUsername: null,
        },
      });
    });

    it("returns error when update fails", async () => {
      prismaMock.user.update.mockRejectedValueOnce(new Error("Update failed"));

      const result = await userService.dropDiscordCredentials("1");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("Update failed");
      }
    });
  });

  describe("updateTimezone", () => {
    it("returns error when id is not provided", async () => {
      const result = await userService.updateTimezone("", 5);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotProvidedError);
        expect(result.error.message).toContain("Id");
      }
    });

    it("returns error when timezone is invalid (too low)", async () => {
      const result = await userService.updateTimezone("1", -13);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotProvidedError);
        expect(result.error.message).toContain("Invalid timezone");
      }
    });

    it("returns error when timezone is invalid (too high)", async () => {
      const result = await userService.updateTimezone("1", 15);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotProvidedError);
        expect(result.error.message).toContain("Invalid timezone");
      }
    });

    it("returns user when timezone is updated successfully", async () => {
      const updatedUser = { ...mockUser, timezone: 5 };
      prismaMock.user.update.mockResolvedValueOnce(updatedUser);

      const result = await userService.updateTimezone("1", 5);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(updatedUser);
      }
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { timezone: 5 },
      });
    });

    it("returns error when user not found", async () => {
      prismaMock.user.update.mockRejectedValueOnce(new Error("User not found"));

      const result = await userService.updateTimezone("1", 5);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain("User not found");
      }
    });
  });
});
