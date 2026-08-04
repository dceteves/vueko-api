import { Repository } from "./repository.abstract.ts";
import TransactionManager from "../managers/prisma-tx.ts";

import { InvitationNotFoundError } from "../utils/errors.ts";

import type { InvitationDelegate } from "../generated/prisma/models.ts";

export class InvitationRepository extends Repository<InvitationDelegate> {
  private delegate: InvitationDelegate;

  constructor(customDelegate?: InvitationDelegate) {
    super();
    this.delegate = customDelegate || TransactionManager.getClient().invitation;
  }

  protected getDelegate = () => this.delegate;
  protected getNotFoundError = () => new InvitationNotFoundError();
}
