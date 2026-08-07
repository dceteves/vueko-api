import "dotenv/config";

import { Router } from "express";
import OAuth2Middleware from "../middleware/oauth.ts";

const authRouter = Router();

authRouter.get("/:provider", OAuth2Middleware.handleProvider);

authRouter.get(
  "/:provider/callback",
  OAuth2Middleware.handleProviderCallback,
  (_req, res) => {
    // Redirect to root after successful auth (same origin)
    res.redirect("/");
  },
);

export default authRouter;
