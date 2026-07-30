import { Repository } from "./repository.abstract.ts";
import TransactionManager from "../managers/prisma-tx.ts";
import { InvitationNotFoundError } from "../utils/error.ts";

import type { InvitationDelegate } from "../generated/prisma/models.ts";

export default class InvitationRepository extends Repository<InvitationDelegate> {
  protected getDelegate = () => TransactionManager.getClient().invitation;
  protected getNotFoundError = () => new InvitationNotFoundError();
}
