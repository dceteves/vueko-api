import { Router } from "express";

import UserRequestHandler from "../../handlers/service/user.ts";

const userServiceRouter = Router();

userServiceRouter.get("/me", UserRequestHandler.me);
userServiceRouter.get("/:userId", UserRequestHandler.findUser);
userServiceRouter.patch("/:userId/:timezone", UserRequestHandler.patchTimeZone);

export default userServiceRouter;
