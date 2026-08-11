import { Router } from "express";

import UserHandler from "../../handlers/service/user.ts";
import UserService from "../../services/user.ts";

export function createUserRoutes(service?: UserService) {
  const userHandler = new UserHandler(service || new UserService());
  const router = Router();

  router.get("/me", (req, res) => userHandler.me(req, res));
  router.get("/:userId", (req, res) => userHandler.findUser(req, res));
  router.patch("/:userId/:timezone", (req, res) =>
    userHandler.patchTimeZone(req, res),
  );

  return router;
}
