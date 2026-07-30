import TransactionManager from "../managers/prisma-tx.ts";
import { TeamNotFoundError } from "../utils/error.ts";
import { Repository } from "./repository.abstract.ts";

import type { TeamDelegate } from "../generated/prisma/models.ts";

export default class TeamRepository extends Repository<TeamDelegate> {
  protected getDelegate = () => TransactionManager.getClient().team;
  protected getNotFoundError = () => new TeamNotFoundError();
}
