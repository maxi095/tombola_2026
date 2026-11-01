import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controllers.js";
import { authRequired } from "../middlewares/validateToken.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/dashboard/:editionId", authRequired, checkRole(["Administrador", "Directiva"]), getDashboard);

export default router;
