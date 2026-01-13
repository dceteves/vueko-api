import { Router } from "express";
import userRoutes from "./api/user.ts";
import teamRoutes from "./api/team.ts";
import invitationRoutes from "./api/invitation.ts";

const router = Router();

router.use("/users", userRoutes);
router.use("/teams", teamRoutes);
router.use("/invitations", invitationRoutes);

// Debug route
router.get("/debug", (req, res) => {
  console.log(req.session);
  res.redirect("/");
});

// All-route catcher
router.get("*splat", (_, res) => {
  res.status(404).json({ message: "Not found" });
});

export default router;
