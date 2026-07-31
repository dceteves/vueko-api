import { createMockClient } from "../../../mocks/prisma";
import type { TransactionClient } from "../../../src/generated/prisma/internal/prismaNamespace";

// Helper to create a properly typed transaction client mock
export function createMockTxClient() {
  return createMockClient() as TransactionClient;
}
