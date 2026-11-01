import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { 
    getSales,
    getSale,
    createSale,
    updateSale,
    deleteSale,
    cancelSale,
    getSalesBySeller,
    processBatchSalePayment
} from "../controllers/sale.controllers.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

// Listar todas las ventas
router.get('/sales', authRequired, checkRole(['Administrador']), getSales);

// Obtener una venta por ID
router.get('/sale/:id', authRequired, checkRole(['Administrador']), getSale);

// Crear una nueva venta
router.post('/sale', authRequired, checkRole(['Administrador']), createSale);

// Editar una venta
router.put('/sale/:id', authRequired, checkRole(['Administrador']), updateSale);

// Operación atómica batch (Pago Contado / Sin Cargo / Revertir Sin Cargo)
router.put('/sale/:id/batch-payment', authRequired, checkRole(['Administrador']), processBatchSalePayment);

// Eliminar una venta
router.delete('/sale/:id', authRequired, checkRole(['Administrador']), deleteSale);

// Anular una venta
router.put('/cancelSale/:id', authRequired, checkRole(['Administrador']), cancelSale);

// Obtener ventas por vendedor
router.get("/sales/seller/:sellerId", authRequired, checkRole(['Administrador']), getSalesBySeller);

export default router;
