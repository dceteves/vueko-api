import { Router } from 'express';

import InvitationRequestHandler from '../../handlers/service/invitation.ts';

const router = Router();

router.post('/', InvitationRequestHandler.createInvitation);
router.get('/me', InvitationRequestHandler.getInvitations);
router.patch('/:invitationId/:action', InvitationRequestHandler.updateInvitation);

export default router;
