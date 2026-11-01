import { Router } from 'express';
import {
    getVendedorSummary,
    getVendedorCards,
    getVendedorQuotas,
    createVendedorSale,
    payVendedorQuota
} from '../controllers/vendedor.controllers.js';

import { authRequired } from '../middlewares/validateToken.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { sellerScope } from '../middlewares/sellerScope.js';

const router = Router();

// Todas las rutas de vendedor requieren autenticación, rol adecuado y ámbito de vendedor
router.use(authRequired, checkRole(['Vendedor', 'Administrador']), sellerScope);

router.get('/vendedor/summary', getVendedorSummary);
router.get('/vendedor/cards', getVendedorCards);
router.get('/vendedor/quotas', getVendedorQuotas);
router.post('/vendedor/sale', createVendedorSale);
router.post('/vendedor/quota-payment', payVendedorQuota);

export default router;
