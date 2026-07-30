/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Args, Operation, Result } from "@prisma/client/runtime/client";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace.ts";

type OpInputs<T, Op extends Operation> = Args<T, Op>;

type CreateResult<T, A> = Result<T, A, "create">;
type UpsertResult<T, A> = Result<T, A, "upsert">;
type FindUniqueResult<T, A> = Result<T, A, "findUnique">;
type FindManyResult<T, A> = Result<T, A, "findMany">;
type FindFirstResult<T, A> = Result<T, A, "findFirst">;
type UpdateResult<T, A> = Result<T, A, "update">;
type UpdateManyResult<T, A> = Result<T, A, "updateMany">;
type DeleteResult<T, A> = Result<T, A, "delete">;

export abstract class Repository<T> {
  protected abstract getDelegate(): T;
  protected abstract getNotFoundError(): Error;

  private async invoke<Op extends Operation, A extends OpInputs<T, Op>, M>(
    op: (args: A) => Promise<M>,
    args: A,
  ): Promise<M> {
    try {
      return await op(args);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw this.getNotFoundError();
        }
        throw new Error(
          `Unexpected prisma error ${error.code}: ${error.message} `,
        );
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unexpected error: ${error}`);
    }
  }

  async create<A extends OpInputs<T, "create">>(args: A) {
    const client = this.getDelegate() as any;
    const result = await client.create(args);
    return result as CreateResult<T, A>;
  }

  async upsert<A extends OpInputs<T, "upsert">>(args: A) {
    const client = this.getDelegate() as any;
    const result = await client.upsert(args);
    return result as UpsertResult<T, A>;
  }

  async findUnique<A extends OpInputs<T, "findUnique">>(args: A) {
    const client = this.getDelegate() as any;
    const result = await client.findUnique(args);

    if (!result) {
      throw this.getNotFoundError();
    }

    return result as NonNullable<FindUniqueResult<T, A>>;
  }

  async findMany<A extends OpInputs<T, "findMany">>(args: A) {
    const client = this.getDelegate() as any;
    const result = await client.findMany(args);
    return result as FindManyResult<T, A>;
  }

  async findFirst<A extends OpInputs<T, "findFirst">>(args: A) {
    const client = this.getDelegate() as any;
    const result = await client.findFirst(args);

    if (!result) {
      throw this.getNotFoundError();
    }

    return result as NonNullable<FindFirstResult<T, A>>;
  }

  async update<A extends OpInputs<T, "update">>(args: A) {
    const client = this.getDelegate() as any;
    const result = await this.invoke(client.update, args);
    return result as UpdateResult<T, A>;
  }

  async updateMany<A extends OpInputs<T, "updateMany">>(
    args: A,
  ): Promise<UpdateManyResult<T, A>> {
    const client = this.getDelegate() as any;
    return await client.updateMany(args);
  }

  async delete<A extends OpInputs<T, "delete">>(args: A) {
    const client = this.getDelegate() as any;

    const result = (await this.invoke(
      client.delete,
      args,
    )) satisfies DeleteResult<T, A>;

    return result;
  }
}
