import { Router } from "express";
import {
  createSellerPayment,
  getSellerPayments,
  getSellerPaymentsBySeller,
  deleteSellerPayment,
  cancelSellerPayment,
  getSellerPaymentById,
  updateSellerPayment
} from "../controllers/sellerPayment.controllers.js";

import { authRequired } from "../middlewares/validateToken.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/sellerPayments", authRequired, checkRole(["Administrador"]), getSellerPayments);
router.get("/sellerPayments/seller/:sellerId", authRequired, checkRole(["Administrador", "Vendedor"]), getSellerPaymentsBySeller);
router.post("/sellerPayments", authRequired, checkRole(["Administrador"]), createSellerPayment);
router.delete("/sellerPayments/:id", authRequired, checkRole(["Administrador"]), deleteSellerPayment);

// Anular un pago de vendedor
router.put('/cancelSellerPayment/:id', authRequired, checkRole(['Administrador']), cancelSellerPayment);

router.get("/sellerPaymentById/:id", authRequired, checkRole(["Administrador"]), getSellerPaymentById);

router.put('/sellerPayments/:id', authRequired, checkRole(['Administrador']), updateSellerPayment);

export default router;
