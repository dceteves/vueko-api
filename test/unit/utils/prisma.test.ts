import { describe, it, expect } from "vitest";
import { generateUserUpsertArgs } from "../../../src/utils/prisma.ts";
import { mockOsuProfile, mockDiscordProfile } from "../../mocks/profile.ts";
import type {
  DiscordProfile,
  OsuProfile,
} from "../../../src/types/passport.types.ts";

describe("generateUserUpsertArgs", () => {
  it("returns upsert args for an osu profile", () => {
    const result = generateUserUpsertArgs<OsuProfile>(
      "token",
      "refresh",
      mockOsuProfile,
    );
    expect(result).not.toBeNull();
    expect(result!.where).toEqual({ osuId: "1" });
    expect(result!.create).toHaveProperty("osuUsername", "player");
  });

  it("returns upsert args for an discord profile", () => {
    const result = generateUserUpsertArgs<DiscordProfile>(
      "token",
      "refresh",
      mockDiscordProfile,
    );
    expect(result).not.toBeNull();
    expect(result!.where).toEqual({ discordId: "1" });
    expect(result!.create).toHaveProperty("discordUsername", "player");
  });

  it("returns null for an unsupported profile", () => {
    const result = generateUserUpsertArgs("token", "refresh", { foo: "bar" });
    expect(result).toBeNull();
  });
});
