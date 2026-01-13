import { Router } from 'express';

import TeamRequestHandler from '../../handlers/service/team.ts';

const router = Router();

router.post('/', TeamRequestHandler.createTeam);
router.get('/', TeamRequestHandler.getTeams);
router.get('/:teamId', TeamRequestHandler.getTeam);
router.patch('/:teamId', TeamRequestHandler.changeTeamName);
router.delete('/:teamId', TeamRequestHandler.deleteTeam);

export default router;
