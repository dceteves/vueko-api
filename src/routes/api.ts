import { Router } from "express";

import userServiceRouter from "./api/user.ts";
import teamServiceRouter from "./api/team.ts";
import invitationServiceRouter from "./api/invitation.ts";

const apiRouter = Router();

apiRouter.use("/users", userServiceRouter);
apiRouter.use("/teams", teamServiceRouter);
apiRouter.use("/invitations", invitationServiceRouter);

// Debug route
apiRouter.get("/debug", (req, res) => {
  console.log(req.session);
  res.redirect("/");
});

// All-route catcher
apiRouter.get("*splat", (_, res) => {
  res.status(404).json({ message: "Not found" });
});

export default apiRouter;
