import { Repository } from "./repository.abstract.ts";
import { UserNotFoundError } from "../utils/errors.ts";

import TransactionManager from "../managers/prisma-tx.ts";

import type { UserDelegate } from "../generated/prisma/models.ts";

export class UserRepository extends Repository<UserDelegate> {
  private delegate: UserDelegate;

  constructor(customDelegate?: UserDelegate) {
    super();
    this.delegate = customDelegate || TransactionManager.getClient().user;
  }

  protected getDelegate = () => this.delegate;

  protected getNotFoundError = () => new UserNotFoundError();
}
