import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { 
    getDraws,
    getDraw,
    getDrawsByEdition,
    createDraw,
    updateDraw,
    registerWinner,
    registerDrawnNumbers,
    deleteDraw,
    getTopBingoCards,
    addDrawnNumber,
    removeLastDrawnNumber
} from "../controllers/draw.controllers.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

// Listar todos los sorteos
router.get('/draws', authRequired, checkRole(['Administrador']), getDraws);

// Obtener un sorteo por ID
router.get('/draw/:id', authRequired, checkRole(['Administrador']), getDraw);

// Obtener sorteos por edición
router.get('/draws/edition/:editionId', authRequired, checkRole(['Administrador']), getDrawsByEdition);

// Crear un nuevo sorteo
router.post('/draw', authRequired, checkRole(['Administrador']), createDraw);

// Actualizar un sorteo
router.put('/draw/:id', authRequired, checkRole(['Administrador']), updateDraw);

// Registrar ganador de un premio específico
router.post('/draw/winner', authRequired, checkRole(['Administrador']), registerWinner);

// Registrar números sorteados (sorteo final tipo bingo)
router.post('/draw/drawn-numbers', authRequired, checkRole(['Administrador']), registerDrawnNumbers);

// Eliminar un sorteo
router.delete('/draw/:id', authRequired, checkRole(['Administrador']), deleteDraw);

router.get('/draw/:drawId/top-cards', authRequired, checkRole(['Administrador']), getTopBingoCards);

router.post('/draw/add-number', authRequired, checkRole(['Administrador']), addDrawnNumber);

router.post('/draw/remove-last-number', authRequired, checkRole(['Administrador']), removeLastDrawnNumber);

export default router;