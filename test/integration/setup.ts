import { beforeAll, afterAll, afterEach } from "vitest";
import prisma from "../../src/lib/prisma.ts";

// Global setup for integration tests
beforeAll(async () => {
  // Ensure database connection with retry logic
  let retries = 5;
  while (retries > 0) {
    try {
      await prisma.$connect();
      console.log("Database connected successfully");
      return;
    } catch (error) {
      retries--;
      console.log(`Connection failed, ${retries} retries left...`);
      console.log("Error: ", error);
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
  throw new Error("Failed to connect to database after retries");
});

// Global cleanup for integration tests
afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();
});

// Clean up test data after each test
afterEach(async () => {
  // Clean up test data created during tests
  // Delete in reverse dependency order
  await prisma.invitation.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
});

// Helper function to get prisma client
export function getTestClient() {
  return prisma;
}

// Helper function to clean up specific test data
export async function cleanupTestData() {
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.invitation.deleteMany();
}

// Helper function to create test user
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createTestUser(data: any = {}) {
  return prisma.user.create({
    data: {
      osuUsername: `testuser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      discordId: `testdiscord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      discordUsername: `test_discord_${Date.now()}`,
      ...data,
    },
  });
}

// Helper function to create test team
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createTestTeam(data: any = {}) {
  return prisma.team.create({
    data: {
      name: `Test Team ${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
    },
  });
}

// Helper function to create test invitation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createTestInvitation(data: any = {}) {
  return prisma.invitation.create({
    data: {
      status: "PENDING",
      ...data,
    },
  });
}
