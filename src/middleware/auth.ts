import type { NextFunction, Request, Response } from "express";

function ensureAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.isAuthenticated()) {
    next();
  } else {
    next(new Error("Unauthenticated"));
  }
}

function handleLogout(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.session.destroy(err => {
    if (err) {
      next(err as Error);
    } else {
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    }
  });
}

export default { ensureAuth, handleLogout };
