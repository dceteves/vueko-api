import type { Prisma } from "../generated/prisma/client.ts";
import type { Operation } from "@prisma/client/runtime/client";

export type WhereInput<TDelegate, TOp extends Operation> = Prisma.Args<
  TDelegate,
  TOp
>["where"];

export type SelectInput<TDelegate, TOp extends Operation> = Prisma.Args<
  TDelegate,
  TOp
>["select"];

export type DataInput<TDelegate, TOp extends Operation> = Prisma.Args<
  TDelegate,
  TOp
>["data"];

export type UpsertWhereInput<TDelegate> = Prisma.Args<
  TDelegate,
  "upsert"
>["where"];

export type UpsertCreateInput<TDelegate> = Prisma.Args<
  TDelegate,
  "upsert"
>["create"];

export type UpsertUpdateInput<TDelegate> = Prisma.Args<
  TDelegate,
  "upsert"
>["update"];

export type CreateDataInput<TDelegate> = DataInput<TDelegate, "create">;
export type CreateSelectInput<TDelegate> = SelectInput<TDelegate, "create">;

export type FindWhereInput<TDelegate> = WhereInput<TDelegate, "findUnique">;
export type FindSelectInput<TDelegate> = SelectInput<TDelegate, "findUnique">;

export type FindManyWhereInput<TDelegate> = WhereInput<TDelegate, "findMany">;
export type FindManySelectInput<TDelegate> = SelectInput<TDelegate, "findMany">;

export type UpdateDataInput<TDelegate> = DataInput<TDelegate, "update">;
export type UpdateSelectInput<TDelegate> = SelectInput<TDelegate, "update">;

export type DeleteWhereInput<TDelegate> = WhereInput<TDelegate, "delete">;
export type DeleteSelectInput<TDelegate> = SelectInput<TDelegate, "delete">;
