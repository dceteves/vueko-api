import passport from "../lib/passport.ts";

import type { NextFunction } from "express";
import type {
  ProviderRequest,
  ProviderResponse,
} from "../types/handler.types.ts";

export const state = crypto.randomUUID();

function handleProvider(
  req: ProviderRequest,
  res: ProviderResponse,
  next: NextFunction,
) {
  const { provider } = req.params;
  passport.authenticate(provider, { state })(req, res, next);
}

function handleProviderCallback(
  req: ProviderRequest,
  res: ProviderResponse,
  next: NextFunction,
) {
  const { provider } = req.params;

  if (req.query.state !== state) {
    res
      .status(400)
      .json({ message: "State does not match with callback state" });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.authenticate(provider, (err: any, user: any) => {
      if (err) {
        console.log("handleProviderCallback error: ", err);
        res.redirect(`${process.env.CLIENT_HOST}/login?error=auth_failed`);
      } else if (!user) {
        res.redirect(`${process.env.CLIENT_HOST}/login?error=no_user`);
      } else {
        // Establish the session
        req.logIn(user, (err) => {
          if (err) {
            console.log("Session establishment error: ", err);
            res.redirect(`${process.env.CLIENT_HOST}/login?error=session_failed`);
          } else {
            next();
          }
        });
      }
    })(req, res, next);
  }
}

export default { handleProvider, handleProviderCallback };
