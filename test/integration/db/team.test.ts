import { describe, it, expect } from "vitest";

import prisma from "../../../src/lib/prisma.ts";
import { createTestUser, createTestTeam } from "../setup";

describe("Team Database Integration Tests", () => {
  describe("Team CRUD Operations", () => {
    it("creates a new team", async () => {
      const user = await createTestUser();
      const team = await createTestTeam({ captainId: user.id });

      expect(team).toHaveProperty("id");
      expect(team.captainId).toBe(user.id);
    });

    it("finds team by ID immediately after creation", async () => {
      const user = await createTestUser();
      const team = await createTestTeam({ captainId: user.id });

      const found = await prisma.team.findUnique({ where: { id: team.id } });

      expect(found).not.toBeNull();
      expect(found?.id).toBe(team.id);
    });
  });
});
