import Draw from '../models/draw.model.js';
import BingoCard from '../models/bingoCard.model.js';
import Sale from '../models/sale.model.js';
import mongoose from 'mongoose';

// Obtener todos los sorteos
export const getDraws = async (req, res) => {
    try {
        const draws = await Draw.find()
            .sort({ drawDate: -1 }) // Más recientes primero
            .populate([
                { path: 'edition' },
                { 
                    path: 'prizes.bingoCard',
                    populate: { path: 'seller', populate: { path: 'person' } }
                },
                { 
                    path: 'prizes.sale',
                    populate: [
                        { path: 'client', populate: { path: 'person' } },
                        { path: 'seller', populate: { path: 'person' } }
                    ]
                },
                { path: 'user' }
            ]);

        res.json(draws);
    } catch (error) {
        console.error("❌ Error en getDraws:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

// Obtener un sorteo por ID
export const getDraw = async (req, res) => {
    try {
        const draw = await Draw.findById(req.params.id)
            .populate([
                { path: 'edition' },
                { 
                    path: 'prizes.bingoCard',
                    populate: { path: 'seller', populate: { path: 'person' } }
                },
                { 
                    path: 'prizes.sale',
                    populate: [
                        { path: 'client', populate: { path: 'person' } },
                        { path: 'seller', populate: { path: 'person' } }
                    ]
                },
                { path: 'user' }
            ]);

        if (!draw) return res.status(404).json({ message: 'Draw not found' });
        res.json(draw);
    } catch (error) {
        console.error("❌ Error en getDraw:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

// Obtener sorteos por edición
export const getDrawsByEdition = async (req, res) => {
    try {
        const { editionId } = req.params;

        const draws = await Draw.find({ edition: editionId })
            .sort({ drawDate: -1 })
            .populate([
                { path: 'edition' },
                { 
                    path: 'prizes.bingoCard',
                    populate: { path: 'seller', populate: { path: 'person' } }
                },
                { 
                    path: 'prizes.sale',
                    populate: [
                        { path: 'client', populate: { path: 'person' } },
                        { path: 'seller', populate: { path: 'person' } }
                    ]
                },
                { path: 'user' }
            ]);

        res.json(draws);
    } catch (error) {
        console.error("❌ Error en getDrawsByEdition:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo sorteo
export const createDraw = async (req, res) => {
    try {
        console.log("📥 Datos recibidos en createDraw:", req.body);

        const { edition, type, drawDate, description, prizes, cardSetNumber } = req.body;

        // Validación básica
        if (!edition || !type || !drawDate) {
            return res.status(400).json({ message: "Edition, type y drawDate son obligatorios" });
        }

        if (!prizes || !Array.isArray(prizes) || prizes.length === 0) {
            return res.status(400).json({ message: "Debe incluir al menos un premio" });
        }

        // Crear sorteo
        const newDraw = new Draw({
            edition,
            type,
            drawDate,
            description,
            cardSetNumber,
            prizes: prizes.map(p => ({
                position: p.position,
                description: p.description,
                notes: p.notes || ''
            })),
            status: 'Programado',
            drawnNumbers: [],
            user: req.user ? req.user.id : null,
        });

        const savedDraw = await newDraw.save();
        console.log("✅ Sorteo creado exitosamente:", savedDraw);

        res.json(savedDraw);

    } catch (error) {
        console.error("❌ Error en createDraw:", error);
        res.status(500).json({ message: "Error al crear el sorteo", error: error.message });
    }
};

// Actualizar un sorteo
export const updateDraw = async (req, res) => {
    try {
        const draw = await Draw.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).populate([
            { path: 'edition' },
            { 
                path: 'prizes.bingoCard',
                populate: { path: 'seller', populate: { path: 'person' } }
            },
            { 
                path: 'prizes.sale',
                populate: [
                    { path: 'client', populate: { path: 'person' } },
                    { path: 'seller', populate: { path: 'person' } }
                ]
            },
            { path: 'user' }
        ]);

        if (!draw) return res.status(404).json({ message: 'Draw not found' });
        res.json(draw);
    } catch (error) {
        console.error("❌ Error en updateDraw:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

// Registrar ganador de un premio
export const registerWinner = async (req, res) => {
    try {
        console.log("🏆 Registrando ganador:", req.body);

        const { drawId, prizePosition, bingoCardNumber } = req.body;

        if (!drawId || prizePosition === undefined || !bingoCardNumber) {
            return res.status(400).json({ 
                message: "drawId, prizePosition y bingoCardNumber son obligatorios" 
            });
        }

        // Buscar el sorteo
        const draw = await Draw.findById(drawId);
        if (!draw) {
            return res.status(404).json({ message: 'Sorteo no encontrado' });
        }

        // Buscar el cartón
        const bingoCard = await BingoCard.findOne({ 
            number: bingoCardNumber,
            edition: draw.edition 
        });

        if (!bingoCard) {
            return res.status(404).json({ 
                message: `Cartón número ${bingoCardNumber} no encontrado en esta edición` 
            });
        }

        // Buscar la venta asociada al cartón
        const sale = await Sale.findOne({ bingoCard: bingoCard._id });
        if (!sale) {
            return res.status(404).json({ 
                message: `No se encontró venta para el cartón ${bingoCardNumber}` 
            });
        }

        // Encontrar el premio por posición
        const prizeIndex = draw.prizes.findIndex(p => p.position === prizePosition);
        if (prizeIndex === -1) {
            return res.status(404).json({ 
                message: `Premio en posición ${prizePosition} no encontrado` 
            });
        }

        // Actualizar el premio con el ganador
        draw.prizes[prizeIndex].bingoCard = bingoCard._id;
        draw.prizes[prizeIndex].sale = sale._id;
        draw.prizes[prizeIndex].winnerRegisteredAt = new Date();

        const updatedDraw = await draw.save();
        console.log("✅ Ganador registrado exitosamente");

        // Poblar y devolver
        const populatedDraw = await Draw.findById(updatedDraw._id)
            .populate([
                { path: 'edition' },
                { 
                    path: 'prizes.bingoCard',
                    populate: { path: 'seller', populate: { path: 'person' } }
                },
                { 
                    path: 'prizes.sale',
                    populate: [
                        { path: 'client', populate: { path: 'person' } },
                        { path: 'seller', populate: { path: 'person' } }
                    ]
                },
                { path: 'user' }
            ]);

        res.json(populatedDraw);

    } catch (error) {
        console.error("❌ Error en registerWinner:", error);
        res.status(500).json({ 
            message: "Error al registrar ganador", 
            error: error.message 
        });
    }
};

// Registrar números sorteados (para sorteo final tipo bingo)
export const registerDrawnNumbers = async (req, res) => {
    try {
        console.log("🎲 Registrando números sorteados:", req.body);

        const { drawId, drawnNumbers } = req.body;

        if (!drawId || !Array.isArray(drawnNumbers) || drawnNumbers.length === 0) {
            return res.status(400).json({ 
                message: "drawId y drawnNumbers (array) son obligatorios" 
            });
        }

        const draw = await Draw.findById(drawId);
        if (!draw) {
            return res.status(404).json({ message: 'Sorteo no encontrado' });
        }

        draw.drawnNumbers = drawnNumbers;
        draw.status = 'En curso';

        const updatedDraw = await draw.save();
        console.log("✅ Números sorteados registrados exitosamente");

        const populatedDraw = await Draw.findById(updatedDraw._id)
            .populate([
                { path: 'edition' },
                { path: 'user' }
            ]);

        res.json(populatedDraw);

    } catch (error) {
        console.error("❌ Error en registerDrawnNumbers:", error);
        res.status(500).json({ 
            message: "Error al registrar números sorteados", 
            error: error.message 
        });
    }
};

// Eliminar un sorteo
export const deleteDraw = async (req, res) => {
    try {
        const draw = await Draw.findByIdAndDelete(req.params.id);
        if (!draw) return res.status(404).json({ message: 'Draw not found' });

        res.status(204).json({ message: 'Draw deleted successfully' });
    } catch (error) {
        console.error("❌ Error en deleteDraw:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

// Agregar este nuevo controlador
export const getTopBingoCards = async (req, res) => {
    try {
        const { drawId } = req.params;

        console.log("🎯 Calculando top cartones para sorteo:", drawId);

        const draw = await Draw.findById(drawId).populate('edition');
        if (!draw) {
            return res.status(404).json({ message: 'Sorteo no encontrado' });
        }

        if (draw.type !== 'Final') {
            return res.status(400).json({ message: 'Este endpoint solo funciona para sorteos finales' });
        }

        const drawnNumbers = draw.drawnNumbers || [];
        
        if (drawnNumbers.length === 0) {
            return res.json([]);
        }

        const cardSetNumber = draw.cardSetNumber || 1;

        // Buscar todos los cartones vendidos de esta edición
        const bingoCards = await BingoCard.find({
            edition: draw.edition._id,
            status: 'Vendido'
        });

        // Buscar las ventas asociadas a estos cartones
        const sales = await Sale.find({
            bingoCard: { $in: bingoCards.map(bc => bc._id) },
            status: { $ne: 'Anulada' }
        }).populate([
            {
                path: 'client',
                populate: { path: 'person' }
            },
            {
                path: 'seller',
                populate: { path: 'person' }
            },
            { path: 'bingoCard' }
        ]);

        // Calcular aciertos para cada cartón
        const cardsWithMatches = sales.map(sale => {
            const cardSet = sale.bingoCard.cardSets?.find(set => set.setNumber === cardSetNumber);
            const cardNumbers = cardSet?.numbers || sale.bingoCard.numbers || []; // Fallback a numbers si no existe cardSets
            const matches = cardNumbers.filter(num => drawnNumbers.includes(num));
            
            return {
                bingoCardId: sale.bingoCard._id,
                bingoCardNumber: sale.bingoCard.number,
                totalNumbers: cardNumbers.length,
                matches: matches.length,
                matchedNumbers: matches,
                cardSetNumber: cardSetNumber,
                client: {
                    firstName: sale.client?.person?.firstName,
                    lastName: sale.client?.person?.lastName
                },
                seller: {
                    firstName: sale.seller?.person?.firstName,
                    lastName: sale.seller?.person?.lastName
                },
                saleId: sale._id
            };
        });

        // Ordenar por cantidad de aciertos (descendente)
        const topCards = cardsWithMatches
            .sort((a, b) => b.matches - a.matches)
            .slice(0, 10); // Top 10

        console.log(`✅ Top ${topCards.length} cartones calculados`);

        res.json(topCards);

    } catch (error) {
        console.error("❌ Error en getTopBingoCards:", error);
        res.status(500).json({ 
            message: "Error al calcular top cartones", 
            error: error.message 
        });
    }
};

// Modificar el endpoint de registerDrawnNumbers para que sea incremental
export const addDrawnNumber = async (req, res) => {
    try {
        console.log("🎲 Agregando número sorteado:", req.body);

        const { drawId, number } = req.body;

        if (!drawId || number === undefined || number === null) {
            return res.status(400).json({ 
                message: "drawId y number son obligatorios" 
            });
        }

        if (number < 1 || number > 90) {
            return res.status(400).json({ 
                message: "El número debe estar entre 1 y 90" 
            });
        }

        const draw = await Draw.findById(drawId);
        if (!draw) {
            return res.status(404).json({ message: 'Sorteo no encontrado' });
        }

        // Verificar que el número no esté ya sorteado
        if (draw.drawnNumbers.includes(number)) {
            return res.status(400).json({ 
                message: `El número ${number} ya fue sorteado` 
            });
        }

        // Agregar el número al array
        draw.drawnNumbers.push(number);
        
        // Cambiar estado a "En curso" si está "Programado"
        if (draw.status === 'Programado') {
            draw.status = 'En curso';
        }

        const updatedDraw = await draw.save();
        console.log("✅ Número agregado exitosamente");

        const populatedDraw = await Draw.findById(updatedDraw._id)
            .populate([
                { path: 'edition' },
                { path: 'user' }
            ]);

        res.json(populatedDraw);

    } catch (error) {
        console.error("❌ Error en addDrawnNumber:", error);
        res.status(500).json({ 
            message: "Error al agregar número sorteado", 
            error: error.message 
        });
    }
};

// Nuevo endpoint para eliminar el último número (por si se equivocan)
export const removeLastDrawnNumber = async (req, res) => {
    try {
        const { drawId } = req.body;

        const draw = await Draw.findById(drawId);
        if (!draw) {
            return res.status(404).json({ message: 'Sorteo no encontrado' });
        }

        if (draw.drawnNumbers.length === 0) {
            return res.status(400).json({ message: 'No hay números para eliminar' });
        }

        // Eliminar el último número
        draw.drawnNumbers.pop();

        const updatedDraw = await draw.save();

        const populatedDraw = await Draw.findById(updatedDraw._id)
            .populate([
                { path: 'edition' },
                { path: 'user' }
            ]);

        res.json(populatedDraw);

    } catch (error) {
        console.error("❌ Error en removeLastDrawnNumber:", error);
        res.status(500).json({ 
            message: "Error al eliminar número", 
            error: error.message 
        });
    }
};

