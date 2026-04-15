import { Router } from 'express';
import {
  createBalance,
  getBalances,
  getBalancesByEdition,
  getBalanceById,
  cancelBalance,
  getBalanceSummary,
} from '../controllers/balance.controllers.js';

import { authRequired } from '../middlewares/validateToken.js';
import { checkRole }    from '../middlewares/role.middleware.js';

const router = Router();

// Solo Administrador puede gestionar movimientos de balance
router.get('/balances',                  authRequired, checkRole(['Administrador']), getBalances);
router.get('/balances/summary',          authRequired, checkRole(['Administrador']), getBalanceSummary);
router.get('/balances/edition/:editionId', authRequired, checkRole(['Administrador']), getBalancesByEdition);
router.get('/balanceById/:id',           authRequired, checkRole(['Administrador']), getBalanceById);
router.post('/balances',                 authRequired, checkRole(['Administrador']), createBalance);
router.put('/cancelBalance/:id',         authRequired, checkRole(['Administrador']), cancelBalance);

export default router;
