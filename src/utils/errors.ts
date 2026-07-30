import type { ModelName } from "../generated/prisma/internal/prismaNamespace.ts";

abstract class ResourceNotFoundError extends Error {
  constructor(model: ModelName) {
    super(`${model} not found`);
    this.name = `${model}NotFoundError`;
  }
}

export class UserNotFoundError extends ResourceNotFoundError {
  constructor() {
    super("User");
  }
}

export class TeamNotFoundError extends ResourceNotFoundError {
  constructor() {
    super("Team");
  }
}

export class InvitationNotFoundError extends ResourceNotFoundError {
  constructor() {
    super("Invitation");
  }
}
