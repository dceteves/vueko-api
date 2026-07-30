import { AsyncLocalStorage } from "node:async_hooks";

import type { TransactionClient } from "../generated/prisma/internal/prismaNamespace.ts";
import type { PrismaClient } from "../generated/prisma/client.ts";
import prisma from "../lib/prisma.ts";

export default class TransactionManager {
  private static prisma: PrismaClient = prisma;
  private static store = new AsyncLocalStorage<TransactionClient>();

  static getClient() {
    return this.store.getStore() || this.prisma;
  }

  static run<T>(fn: (tx: TransactionClient) => Promise<T>) {
    const existing = this.store.getStore();

    if (existing) {
      return fn(existing);
    }

    return this.prisma.$transaction(async (tx) => {
      return this.store.run(tx, () => fn(tx));
    });
  }
}
