import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { 
    getQuotas,
    getQuotasV2,
    getQuota,
    createQuota,
    updateQuota,
    deleteQuota,
    getQuotasBySale,
    getExpiredQuotas
} from "../controllers/quota.controllers.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

// Listar todas las cuotas
router.get('/quotas', authRequired, checkRole(['Administrador']), getQuotas);

// Listar todas las cuotas paginadas, filtros
router.get('/quotasList', authRequired, checkRole(['Administrador']), getQuotasV2);

// Obtener una cuota por ID
router.get('/quota/:id', authRequired, checkRole(['Administrador']), getQuota);

// Crear una nueva cuota
router.post('/quota', authRequired, checkRole(['Administrador']), createQuota);

// Editar una cuota
router.put('/quota/:id', authRequired, checkRole(['Administrador']), updateQuota);

// Eliminar una cuota
router.delete('/quota/:id', authRequired, checkRole(['Administrador']), deleteQuota);

// Listar todas las cuotas de un bingo
router.get('/quotasBySale/:saleId', authRequired, checkRole(['Administrador']), getQuotasBySale);

router.get('/expiredQuotas', authRequired, checkRole(['Administrador']), getExpiredQuotas);


export default router;
