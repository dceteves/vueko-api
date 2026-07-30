import type { ModelName } from "../generated/prisma/internal/prismaNamespace.ts";

export abstract class ResourceNotFoundError extends Error {
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

export class NotProvidedError extends Error {
  constructor(resource: Capitalize<string>) {
    super(`${resource} not provided`);
    this.name = `${resource}NotProvided`;
  }
}

export class UnexpectedError extends Error {
  constructor() {
    super("Unexpected error has occurred");
    this.name = "UnexpectedError";
  }
}
