import type { UserModel } from "../generated/prisma/models/User.ts";

declare global {
  namespace Express {
    interface User extends UserModel {}
  }
}
