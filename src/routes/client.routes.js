import { Router } from "express";
import {
  getClients,
  getClient,
  searchClients,
  createClient,
  updateClient,
  deleteClient
} from "../controllers/client.controllers.js";

import { authRequired } from "../middlewares/validateToken.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

// Búsqueda puntual protegida (Vendedor y Admin) 🔍
router.get("/clients/search", authRequired, checkRole(["Administrador", "Vendedor"]), searchClients);

// Padrón masivo protegido (Solo Administrador - RN-ROL-02) 🛡️
router.get("/clients", authRequired, checkRole(["Administrador"]), getClients);

// Consulta individual y alta rápida al vender (Vendedor y Admin)
router.get("/clients/:id", authRequired, checkRole(["Administrador", "Vendedor"]), getClient);
router.post("/clients", authRequired, checkRole(["Administrador", "Vendedor"]), createClient);

// Modificación y baja (Solo Administrador)
router.put("/clients/:id", authRequired, checkRole(["Administrador"]), updateClient);
router.delete("/clients/:id", authRequired, checkRole(["Administrador"]), deleteClient);

export default router;
