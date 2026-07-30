import { Repository } from "./repository.abstract.ts";
import { TeamNotFoundError } from "../utils/errors.ts";
import TransactionManager from "../managers/prisma-tx.ts";
import type { TeamDelegate } from "../generated/prisma/models.ts";

export class TeamRepository extends Repository<TeamDelegate> {
  private delegate: TeamDelegate;

  constructor(customDelegate?: TeamDelegate) {
    super();
    this.delegate = customDelegate || TransactionManager.getClient().team;
  }

  protected getDelegate = () => this.delegate;
  protected getNotFoundError = () => new TeamNotFoundError();
}
