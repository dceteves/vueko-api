import { vi, describe, it, expect } from "vitest";
import { mockUser } from "../../mocks/user.ts";

vi.mock("../../../src/lib/prisma", () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
  };
  return { default: prisma };
});

import prisma from "../../../src/lib/prisma.ts";
import UserService from "../../../src/services/user.ts";
import { mockDiscordProfile, mockOsuProfile } from "../../mocks/profile.ts";

describe("UserService.fetchUser", () => {
  it("returns null for nonexistent user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const nonexistent = "nonexistent";
    const result = await UserService.fetchUser(nonexistent);

    expect(result).toBeNull();
    expect(prisma.user.findUnique).toHaveBeenCalledOnce();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: nonexistent },
    });
  });

  it("returns user for existing user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const exists = mockUser.id;
    const result = await UserService.fetchUser(exists);

    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: exists },
    });
  });
});

// TODO:
describe("UserService.findOrCreateUserFromProfile", () => {
  it("throws when profile is invalid", async () => {
    // vi.mocked(prisma.user.upsert);

    const invalidProfile = { foo: "bar" };
    const resultPromise = UserService.findOrCreateUserFromProfile(
      "access",
      "refresh",
      invalidProfile,
    );

    await expect(resultPromise).rejects.toThrow(
      "Could not generate query arguments from profile",
    );
  });

  it("returns with user on osu profile", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue(mockUser);

    const expectedUserUpsertArgsFromOsuProfile = {
      where: {
        osuId: mockOsuProfile.id,
      },
      update: {
        accessToken: "access",
        refreshToken: "refresh",
        countryCode: "US",
        osuUsername: "player",
        tokenExpiresAt: expect.any(Date),
        osuAvatar: "https://example.com/mock.png",
      },
      create: {
        osuId: "1",
        accessToken: "access",
        refreshToken: "refresh",
        countryCode: "US",
        osuUsername: "player",
        tokenExpiresAt: expect.any(Date),
        osuAvatar: "https://example.com/mock.png",
      },
    };

    const result = await UserService.findOrCreateUserFromProfile(
      "access",
      "refresh",
      mockOsuProfile,
    );

    expect(result).toBe(mockUser);
    expect(prisma.user.upsert).toHaveBeenCalledOnce();
    expect(prisma.user.upsert).toHaveBeenNthCalledWith(
      1,
      expectedUserUpsertArgsFromOsuProfile,
    );
  });

  it("returns with user on discord profile", async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue(mockUser);

    const expectedUserUpsertArgsFromDiscordProfile = {
      where: {
        discordId: mockDiscordProfile.id,
      },
      update: {
        discordUsername: "player",
      },
      create: {
        discordId: "1",
        discordUsername: "player",
      },
    };

    const result = await UserService.findOrCreateUserFromProfile(
      "access",
      "refresh",
      mockDiscordProfile,
    );

    expect(result).toBe(mockUser);
    expect(prisma.user.upsert).toHaveBeenCalledTimes(2);
    expect(prisma.user.upsert).toHaveBeenNthCalledWith(
      2,
      expectedUserUpsertArgsFromDiscordProfile,
    );
  });
});

// TODO:
describe("UserService.linkOsuProfile", () => {
  it("throws for nonexistent user", async () => {
    const result = await UserService.linkOsuProfile(
      "nonexistent",
      mockOsuProfile,
    );
    console.log(result);
  });
});

// TODO:
describe("UserService.linkDiscordProfile", () => {});

// TODO:
describe("UserService.dropDiscordCredentials", () => {});

// TODO:
describe("UserService.updateTimezone", () => {});
