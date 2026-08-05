/* eslint-disable @typescript-eslint/no-explicit-any */

import type { NextFunction, Request, Response } from "express";
import AdminService from "../services/admin.ts";

const adminService = new AdminService();

function ensureAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ message: "Unauthenticated" });
  }
}

async function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const userId = (req.user as any)?.id;
  if (!userId) {
    return res.status(401).json({ message: "Invalid user session" });
  }

  const isAdminResult = await adminService.isAdmin(userId);

  if (isAdminResult.ok && isAdminResult.value) {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
}

function handleLogout(req: Request, res: Response, next: NextFunction) {
  req.session.destroy((err) => {
    if (err) {
      next(err as Error);
    } else {
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    }
  });
}

export default { ensureAuth, ensureAdmin, handleLogout };
