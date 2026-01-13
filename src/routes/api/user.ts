import { Router } from "express";

import UserRequestHandler from "../../handlers/service/user.ts";

const router = Router();

router.get("/me", UserRequestHandler.me);
router.get("/:userId", UserRequestHandler.findUser);
router.patch("/:userId/:timezone", UserRequestHandler.patchTimeZone);

export default router;
