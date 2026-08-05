import { Repository } from "./repository.abstract.ts";
import { AdminNotFoundError } from "../utils/errors.ts";

import TransactionManager from "../managers/prisma-tx.ts";

import type { AdminDelegate } from "../generated/prisma/models.ts";

export default class AdminRepository extends Repository<AdminDelegate> {
  protected getDelegate = () => TransactionManager.getClient().admin;
  protected getNotFoundError = () => new AdminNotFoundError();
}
