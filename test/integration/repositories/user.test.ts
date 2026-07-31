import { describe, it, expect } from "vitest";

import UserRepository from "../../../src/repositories/user";

const repo = new UserRepository();

describe("UserRepository", () => {
  it("create", async () => {
    const user = await repo.create({
      data: {
        osuId: "1",
        osuUsername: "1",
        osuRank: 5000,
        osuAvatar: "https://example-url.com",
        countryCode: "NA",
      },
    });

    expect(user).not.toBeNull();
    expect(user.osuId).toBe("1");
    expect(user.osuUsername).toBe("1");
    expect(user.osuRank).toBe(5000);
    expect(user.osuAvatar).toBe("https://example-url.com");
    expect(user.countryCode).toBe("NA");
  });
});
