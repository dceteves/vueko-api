import { Router } from "express";
import OAuth2Middleware from "../middleware/oauth.ts";

const authRouter = Router();

authRouter.get("/:provider", OAuth2Middleware.handleProvider);

authRouter.get(
  "/:provider/callback",
  OAuth2Middleware.handleProviderCallback,
  (_req, res) => {
    res.json({ message: "Auth success" });
  },
);

export default authRouter;
