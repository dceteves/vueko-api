import { Router } from "express";
import AdminService from "../../services/admin.ts";
import AdminHandler from "../../handlers/service/admin.ts";
import AuthMiddleware from "../../middleware/auth.ts";

export function createAdminRoutes(service?: AdminService) {
  const handler = new AdminHandler(service || new AdminService());
  const router = Router();

  // Check endpoint - only requires authentication
  router.get("/check", AuthMiddleware.ensureAuth, (req, res) => handler.checkAdmin(req, res));

  // Management endpoints - require admin access
  router.post("/:userId", AuthMiddleware.ensureAdmin, (req, res) => handler.addAdmin(req, res));
  router.delete("/:userId", AuthMiddleware.ensureAdmin, (req, res) => handler.removeAdmin(req, res));
  router.get("/", AuthMiddleware.ensureAdmin, (req, res) => handler.getAllAdmins(req, res));
  router.get("/:userId", AuthMiddleware.ensureAdmin, (req, res) => handler.getAdminByUserId(req, res));

  return router;
}
