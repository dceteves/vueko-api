import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockReset } from "vitest-mock-extended";
import { createMockTxClient } from "./utils";
import { prismaMock } from "./prisma-mock";

import TransactionManager from "../../../src/managers/prisma-tx";
import { mockUser } from "../../mocks/service";

// Mock the prisma module
vi.mock("../../../src/lib/prisma", () => ({
  default: prismaMock,
}));

describe("TransactionManager", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback(prismaMock);
    });
  });

  describe("getClient", () => {
    it.todo("returns prisma client when outside transaction", () => {
      const client = TransactionManager.getClient();
      expect(client).toBe(prismaMock);
    });

    it.todo("returns transaction client when inside transaction", async () => {
      const mockTxClient = createMockTxClient();
      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(mockTxClient);
      });

      const capturedClient = await TransactionManager.run(async () =>
        TransactionManager.getClient(),
      );

      expect(capturedClient).toBe(mockTxClient);
      expect(capturedClient).not.toBe(prismaMock);
    });
  });

  describe("run", () => {
    it.todo("executes function and returns result", async () => {
      const mockResult = { id: "1", name: "test" };
      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(prismaMock);
      });

      const result = await TransactionManager.run(async () => mockResult);

      expect(result).toEqual(mockResult);
      expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    });

    it.todo(
      "creates transaction when not already in transaction context",
      async () => {
        prismaMock.$transaction.mockImplementationOnce(async (callback) => {
          return callback(prismaMock);
        });

        await TransactionManager.run(async () => {
          /* Do nothing */
        });

        expect(prismaMock.$transaction).toHaveBeenCalledOnce();
      },
    );

    it.todo(
      "does not create nested transaction when already in transaction context",
      async () => {
        const mockTxClient = createMockTxClient();
        prismaMock.$transaction.mockImplementationOnce(async (callback) => {
          return callback(mockTxClient);
        });

        await TransactionManager.run(async () => {
          // First transaction
          await TransactionManager.run(async () => {
            // Nested call - should not create new transaction
          });
        });

        // Should only be called once (for the outer transaction)
        expect(prismaMock.$transaction).toHaveBeenCalledOnce();
      },
    );

    it("propagates errors from transaction", async () => {
      const mockError = new Error("Transaction failed");
      prismaMock.$transaction.mockImplementationOnce(async () => {
        throw mockError;
      });

      await expect(
        TransactionManager.run(async () => {
          throw new Error("Inner error");
        }),
      ).rejects.toThrow();
    });

    it.todo(
      "uses transaction client for database operations within transaction",
      async () => {
        const mockTxClient = createMockTxClient();

        prismaMock.$transaction.mockImplementationOnce(async (callback) => {
          return callback(mockTxClient);
        });

        mockTxClient.user.findUnique.mockResolvedValueOnce(mockUser);

        await TransactionManager.run(async () => {
          const client = TransactionManager.getClient();
          const user = await client.user.findUnique({ where: { id: "1" } });
          expect(user).toEqual(mockUser);
        });

        expect(mockTxClient.user.findUnique).toHaveBeenCalledOnce();
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      },
    );

    it.todo("handles multiple sequential transactions", async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      await TransactionManager.run(async () => {
        // First transaction
      });

      await TransactionManager.run(async () => {
        // Second transaction
      });

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(2);
    });

    it.todo(
      "maintains separate contexts for parallel transactions",
      async () => {
        const mockTxClient1 = createMockTxClient();
        const mockTxClient2 = createMockTxClient();

        let callCount = 0;
        prismaMock.$transaction.mockImplementation(async (callback) => {
          callCount++;
          return callback(callCount === 1 ? mockTxClient1 : mockTxClient2);
        });

        const results = await Promise.all([
          TransactionManager.run(async () => {
            const client = TransactionManager.getClient();
            return client === mockTxClient1;
          }),
          TransactionManager.run(async () => {
            const client = TransactionManager.getClient();
            return client === mockTxClient2;
          }),
        ]);

        expect(results).toEqual([true, true]);
        expect(prismaMock.$transaction).toHaveBeenCalledTimes(2);
      },
    );
  });

  describe("integration with repositories", () => {
    it.todo(
      "works with repository pattern using transaction client",
      async () => {
        const mockTxClient = createMockTxClient();

        prismaMock.$transaction.mockImplementationOnce(async (callback) => {
          return callback(mockTxClient);
        });

        mockTxClient.user.create.mockResolvedValueOnce(mockUser);

        await TransactionManager.run(async () => {
          const client = TransactionManager.getClient();
          await client.user.create({ data: { osuUsername: "test" } });
        });

        expect(mockTxClient.user.create).toHaveBeenCalledOnce();
        expect(prismaMock.user.create).not.toHaveBeenCalled();
      },
    );
  });
});
