import { AsyncLocalStorage } from "async_hooks";
import prisma from "../lib/prisma.ts";

import type { TransactionClient } from "../generated/prisma/internal/prismaNamespace.ts";

export default class TransactionManager {
  private static store = new AsyncLocalStorage<TransactionClient>();

  static async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.store.getStore()) {
      return fn();
    }

    return prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.store.run(tx as any, fn);
    });
  }

  static getClient() {
    const currentStore = this.store.getStore();
    return currentStore || prisma;
  }
}
