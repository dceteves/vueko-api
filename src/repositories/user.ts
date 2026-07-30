import type { UserDelegate } from "../generated/prisma/models.ts";
import TransactionManager from "../managers/prisma-tx.ts";
import { UserNotFoundError } from "../utils/error.ts";
import { Repository } from "./repository.abstract.ts";

export default class UserRepository extends Repository<UserDelegate> {
  protected getDelegate = () => TransactionManager.getClient().user;
  protected getNotFoundError = () => new UserNotFoundError();
}
