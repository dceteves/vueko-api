import { vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import type { TransactionClient } from "../../../src/generated/prisma/internal/prismaNamespace";

// Helper to create a properly typed transaction client mock
export function createMockTxClient() {
  return mockDeep<TransactionClient>({
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    team: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    invitation: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  });
}
