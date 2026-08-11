import { Router } from "express";

import UserHandler from "../../handlers/service/user.ts";
import UserService from "../../services/user.ts";

export function createUserRoutes(service?: UserService) {
  const userHandler = new UserHandler(service || new UserService());
  const router = Router();

  router.get("/me", userHandler.me.bind(userHandler));
  router.get("/:userId", userHandler.findUser.bind(userHandler));
  router.patch(
    "/:userId/:timezone",
    userHandler.patchTimeZone.bind(userHandler),
  );

  return router;
}
