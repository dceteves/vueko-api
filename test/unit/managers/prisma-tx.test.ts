/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMockClient } from "../../mocks/prisma";

describe("TransactionManager", () => {
  let TransactionManager: any;
  let prismaMock: any;

  beforeEach(async () => {
    // Create fresh mocks for each test
    prismaMock = createMockClient();

    // Clear module cache and mock dynamically
    vi.clearAllMocks();
    vi.resetModules();

    // Mock the prisma module
    vi.doMock("../../../src/lib/prisma.ts", () => ({
      default: prismaMock,
    }));

    // Import TransactionManager after the mock is set up
    TransactionManager = (await import("../../../src/managers/prisma-tx"))
      .default;

    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback(prismaMock);
    });
  });

  describe("getClient", () => {
    it("returns prisma client when outside transaction", () => {
      const client = TransactionManager.getClient();
      expect(client).toBe(prismaMock);
    });

    it("returns transaction client when inside transaction", async () => {
      const mockTxClient = createMockClient();
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
    it("executes function and returns result", async () => {
      const mockResult = { id: "1", name: "test" };
      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(prismaMock);
      });

      const result = await TransactionManager.run(async () => mockResult);

      expect(result).toEqual(mockResult);
      expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    });

    it("creates transaction when not already in transaction context", async () => {
      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(prismaMock);
      });

      // run empty transaction
      await TransactionManager.run(async () => {});

      expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    });

    it("does not create nested transaction when already in transaction context", async () => {
      const mockTxClient = createMockClient();
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
    });

    it("propagates errors from transaction", async () => {
      const mockError = new Error("Transaction failed");
      prismaMock.$transaction.mockImplementationOnce(async () => {
        throw mockError;
      });

      const tx = TransactionManager.run(async () => {
        throw new Error("Inner error");
      });

      await expect(tx).rejects.toThrow();
    });

    it("uses transaction client for database operations within transaction", async () => {
      const mockTxClient = createMockClient();

      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(mockTxClient);
      });

      mockTxClient.user.findUnique.mockResolvedValueOnce({
        id: "1",
        name: "test",
      });

      await TransactionManager.run(async () => {
        const client = TransactionManager.getClient();
        const user = await client.user.findUnique({ where: { id: "1" } });
        expect(user).toEqual({ id: "1", name: "test" });
      });

      expect(mockTxClient.user.findUnique).toHaveBeenCalledOnce();
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it("handles multiple sequential transactions", async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      // Just run two empty transactions
      await TransactionManager.run(async () => {});
      await TransactionManager.run(async () => {});

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(2);
    });

    it("maintains separate contexts for parallel transactions", async () => {
      const mockTxClient1 = createMockClient();
      const mockTxClient2 = createMockClient();

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
    });
  });

  describe("integration with repositories", () => {
    it("works with repository pattern using transaction client", async () => {
      const mockTxClient = createMockClient();

      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(mockTxClient);
      });

      mockTxClient.user.create.mockResolvedValueOnce({
        id: "1",
        osuUsername: "test",
      });

      await TransactionManager.run(async () => {
        const client = TransactionManager.getClient();
        await client.user.create({ data: { osuUsername: "test" } });
      });

      expect(mockTxClient.user.create).toHaveBeenCalledOnce();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });
});
