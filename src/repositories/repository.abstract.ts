/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Prisma } from "../generated/prisma/client.ts";
import type {
  Operation,
  PrismaClientKnownRequestError as KnownRequestError,
} from "@prisma/client/runtime/client";

type OpInputs<T, TOp extends Operation> = Prisma.Args<T, TOp>;

type CreateResult<T, A> = Prisma.Result<T, A, "create">;
type UpsertResult<T, A> = Prisma.Result<T, A, "upsert">;
type FindResult<T, A> = Prisma.Result<T, A, "findUnique">;
type FindFirstResult<T, A> = Prisma.Result<T, A, "findFirst">;
type FindManyResult<T, A> = Prisma.Result<T, A, "findMany">;
type UpdateResult<T, A> = Prisma.Result<T, A, "update">;
type UpdateManyResult<T, A> = Prisma.Result<T, A, "updateMany">;
type DeleteResult<T, A> = Prisma.Result<T, A, "delete">;

export abstract class Repository<T> {
  protected abstract getDelegate(): T;
  protected abstract getNotFoundError(): Error;

  async create<A extends OpInputs<T, "create">>(args: A) {
    const result = (this.getDelegate() as any).create(args);
    return result as CreateResult<T, A>;
  }

  async upsert<A extends OpInputs<T, "upsert">>(args: A) {
    const result = (this.getDelegate() as any).upsert(args);
    return result as UpsertResult<T, A>;
  }

  async findUnique<A extends OpInputs<T, "findUnique">>(args: A) {
    const result = (this.getDelegate() as any).findUnique(args);

    if (!result) {
      throw this.getNotFoundError();
    }

    return result as NonNullable<FindResult<T, A>>;
  }

  async findFirst<A extends OpInputs<T, "findFirst">>(args: A) {
    const result = (this.getDelegate as any).findFirst(args);

    if (!result) {
      throw this.getNotFoundError();
    }

    return result as NonNullable<FindFirstResult<T, A>>;
  }

  async findMany<A extends OpInputs<T, "findMany">>(args: A) {
    const result = (this.getDelegate() as any).findMany(args);
    return result as FindManyResult<T, A>;
  }

  async update<A extends OpInputs<T, "update">>(args: A) {
    try {
      const result = (this.getDelegate() as any).update(args);
      return result as UpdateResult<T, A>;
    } catch (err) {
      throw (err as KnownRequestError).code === "P2025"
        ? this.getNotFoundError()
        : err;
    }
  }

  async updateMany<A extends OpInputs<T, "updateMany">>(args: A) {
    const result = (this.getDelegate() as any).updateMany(args);
    return result as UpdateManyResult<T, A>;
  }

  async delete<A extends OpInputs<T, "delete">>(args: A) {
    try {
      const result = (this.getDelegate() as any).delete(args);
      return result as DeleteResult<T, A>;
    } catch (err) {
      throw (err as KnownRequestError).code === "P2025"
        ? this.getNotFoundError()
        : err;
    }
  }
}
