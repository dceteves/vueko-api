import { Router } from "express";

import UserHandler from "../../handlers/service/user.ts";
import UserService from "../../services/user.ts";

export function createUserRoutes(service?: UserService) {
  const userHandler = new UserHandler(service || new UserService());
  const router = Router();

  router.get("/me", userHandler.me);
  router.get("/:userId", userHandler.findUser);
  router.patch("/:userId/:timezone", userHandler.patchTimeZone);

  return router;
}
