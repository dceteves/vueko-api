import { Router } from 'express';
import OAuth2Middleware from '../middleware/oauth.ts';

const router = Router();

router.get('/:provider', OAuth2Middleware.handleProvider);

router.get('/:provider/callback', OAuth2Middleware.handleProviderCallback, (_req, res) => {
  res.json({ message: 'Auth success' });
});

export default router;
