import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

import app from "../../src/app.ts";
import prisma from "../../src/lib/prisma.ts";
import { mockUser } from "../mocks/service.ts";

describe("User API Tests", () => {
  beforeAll(async () => {
    await prisma.user.create({ data: mockUser });
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: mockUser.id } });
  });

  it("GET /me", () => {
    it("returns currently authenticated user", async () => {
      const result = await request(app).get("/api/users/me");

      expect(result).toBe(mockUser);
    });
  });
  it.todo("GET /:userId", () => {});
  it.todo("GET /:userId/:timezone", () => {});
});
