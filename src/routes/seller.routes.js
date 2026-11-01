import { Router } from "express";
import {
  getSellers,
  getSeller,
  createSeller,
  updateSeller,
  deleteSeller
} from "../controllers/seller.controllers.js";

import { authRequired } from "../middlewares/validateToken.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/sellers", authRequired, checkRole(["Administrador"]), getSellers);
router.get("/sellers/:id", authRequired, checkRole(["Administrador", "Vendedor"]), getSeller);
router.post("/sellers", authRequired, checkRole(["Administrador"]), createSeller);
router.put("/sellers/:id", authRequired, checkRole(["Administrador"]), updateSeller);
router.delete("/sellers/:id", authRequired, checkRole(["Administrador"]), deleteSeller);

export default router;
