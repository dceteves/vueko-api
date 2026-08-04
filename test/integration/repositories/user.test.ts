import { describe, it, expect } from "vitest";

import UserRepository from "../../../src/repositories/user";

const repo = new UserRepository();

describe("UserRepository", () => {
  it("create", async () => {
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = await repo.create({
      data: {
        osuId: uniqueId,
        osuUsername: `test_repo_user_${uniqueId}`,
        osuRank: 5000,
        osuAvatar: "https://example-url.com",
        countryCode: "NA",
      },
    });

    expect(user).not.toBeNull();
    expect(user.osuId).toBe(uniqueId);
    expect(user.osuUsername).toBe(`test_repo_user_${uniqueId}`);
    expect(user.osuRank).toBe(5000);
    expect(user.osuAvatar).toBe("https://example-url.com");
    expect(user.countryCode).toBe("NA");
  });
});
