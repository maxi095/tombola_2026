import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { 
    getEdition,
    getEditions,
    createEdition,
    updateEdition,
    deleteEdition
} from "../controllers/edition.controllers.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { createEditionSchema } from "../schemas/edition.schema.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

router.get('/editions', authRequired, checkRole(['Administrador', 'Directiva', 'Vendedor']), getEditions);
router.get('/edition/:id', authRequired, checkRole(['Administrador', 'Directiva', 'Vendedor']), getEdition);
router.post('/edition', authRequired, checkRole(['Administrador']), validateSchema(createEditionSchema), createEdition);
router.delete('/edition/:id', authRequired, checkRole(['Administrador']), deleteEdition);
router.put('/edition/:id', authRequired, checkRole(['Administrador']), updateEdition);

export default router;
