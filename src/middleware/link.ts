import passport from '../lib/passport.ts';
import type { NextFunction } from 'express';
import type { ProviderRequest, ProviderResponse } from '../types/handler.types.ts';
// import type { Provider } from '../types/profile.types.ts';

// function isProvider(provider: string): provider is Provider {
//   return provider === 'osu' || provider === 'discord';
// }

export function handleProviderLink(
  req: ProviderRequest,
  res: ProviderResponse,
  next: NextFunction
) {
  const { provider } = req.params;

  // TODO: Test if need type checking
  // if (!isProvider(provider)) {
  //   res.status(400).json({ message: 'Provider not supported' });
  // }

  passport.authorize(provider)(req, res, next);
}
