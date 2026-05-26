import { describe, it, expect } from "vitest";
import { isOsuProfile, isProfile } from "../../../src/types/passport.types.ts";
import { mockProfile, mockOsuProfile } from "../../mocks/profile.ts";

describe("isProfile", () => {
  it("returns true for a valid profile", () => {
    expect(isProfile(mockProfile)).toBe(true);
  });

  it("returns false for an invalid profile", () => {
    expect(isProfile({ foo: "bar" })).toBe(false);
  });
});

describe("isOsuProfile", () => {
  it("returns true for a valid osu profile", () => {
    expect(isOsuProfile(mockOsuProfile)).toBe(true);
  });

  it("returns false for an invalid osu profile", () => {
    expect(isOsuProfile({ foo: "bar" })).toBe(false);
  });
});
