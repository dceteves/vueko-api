/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi } from "vitest";

// Helper function to create a fresh mock client
export const createMockClient = () => ({
  $transaction: vi.fn(),
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
    receivedInvites: [], // Add relation field
  },
  team: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  invitation: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
});

// Create a simple mock for the prisma client without mockDeep to avoid circular recursion
const prismaMock = createMockClient() as any;

export { prismaMock };
