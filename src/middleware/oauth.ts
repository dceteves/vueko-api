import passport from '../lib/passport.ts';

import type { NextFunction } from 'express';
import type { ProviderRequest, ProviderResponse } from '../types/handler.types.ts';

export const state = crypto.randomUUID();

function handleProvider(
  req: ProviderRequest,
  res: ProviderResponse,
  next: NextFunction
) {
  const { provider } = req.params;
  passport.authenticate(provider, { state })(req, res, next);
}

function handleProviderCallback(
  req: ProviderRequest,
  res: ProviderResponse,
  next: NextFunction
) {
  if (req.query.state !== state) {
    res.status(400).json({ message: 'State does not match with callback state' });
  } else {
    next();
  }
}

export default { handleProvider, handleProviderCallback };
