import { describe, it, expect } from "vitest";

import prisma from "../../../src/lib/prisma.ts";

describe("User Database Integration Tests", () => {
  describe("User CRUD Operations", () => {
    it("creates a new user", async () => {
      const user = await prisma.user.create({
        data: { osuUsername: "test_user_1" },
      });

      expect(user).toHaveProperty("id");
      expect(user.osuUsername).toBe("test_user_1");
    });

    it("finds user by ID", async () => {
      const user = await prisma.user.create({
        data: { osuUsername: `find_user_test_${Date.now()}` },
      });

      const found = await prisma.user.findUnique({ where: { id: user.id } });

      expect(found).not.toBeNull();
      expect(found?.id).toBe(user.id);
    });

    it("null if not found", async () => {
      const found = await prisma.user.findUnique({
        where: { id: "nonexistent" },
      });

      expect(found).toBeNull();
    });
  });
});
