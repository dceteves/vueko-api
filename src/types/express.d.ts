import type { UserModel } from "../generated/prisma/models/User.ts";

declare global {
  namespace Express {
    // eslint-disable-next-line
    interface User extends UserModel {}
  }
}
