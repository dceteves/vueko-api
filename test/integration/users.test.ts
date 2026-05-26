import { describe, beforeAll } from "vitest";
import { mockUser } from "../mocks/user.ts";
import prisma from "../../src/lib/prisma.ts";
import app from "../../src/app.ts";

describe("User API Tests", () => {
  beforeAll(async () => {
    await prisma.user.create({ data: mockUser });
  });

  describe("GET /me", () => {});
  describe("GET /:userId", () => {});
  describe("GET /:userId/:timezone", () => {});
});
