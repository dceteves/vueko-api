import { AsyncLocalStorage } from "async_hooks";
import prisma from "../lib/prisma.ts";

import type { TransactionClient } from "../generated/prisma/internal/prismaNamespace.ts";
import type { PrismaClient } from "../generated/prisma/client.ts";

export default class TransactionManager {
  private static store = new AsyncLocalStorage<TransactionClient>();

  static async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.store.getStore()) {
      return fn();
    }

    return prisma.$transaction(async (tx) => {
      return this.store.run(tx, fn);
    });
  }

  static getClient(): TransactionClient | PrismaClient {
    return this.store.getStore() || prisma;
  }
}
