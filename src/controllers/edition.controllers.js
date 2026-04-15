import Edition from '../models/edition.model.js';
import BingoCard from '../models/bingoCard.model.js';
import Quota from '../models/quota.model.js';

export const getEditions = async (req, res) => {
    try {
        const editions = await Edition.find({}).populate('user'); // Populate para incluir detalles del usuario si es necesario
        res.json(editions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// --- BINGO GENERATOR PRO V10 LOGIC ---

function getCombinations(n, k) {
    const result = [];
    const comb = [];
    function backtrack(start) {
        if (comb.length === k) {
            result.push([...comb]);
            return;
        }
        for (let i = start; i < n; i++) {
            comb.push(i);
            backtrack(i + 1);
            comb.pop();
        }
    }
    backtrack(0);
    return result;
}

function generateV10Set(config) {
    const { totalBalls, clusterSize, clustersPerCard } = config;
    const numClusters = Math.floor(totalBalls / clusterSize);
    
    // 1. Partición de bolillas en Clústeres (ESTRATOS DINÁMICOS)
    const ballsPerStratum = numClusters;
    const strata = [];
    
    for (let s = 0; s < clusterSize; s++) {
        const start = s * ballsPerStratum + 1;
        const stratum = Array.from({ length: ballsPerStratum }, (_, i) => start + i)
                             .sort(() => 0.5 - Math.random());
        strata.push(stratum);
    }
    
    const clusters = [];
    for (let i = 0; i < numClusters; i++) {
        const cluster = [];
        for (let s = 0; s < clusterSize; s++) {
            cluster.push(strata[s][i]);
        }
        clusters.push(cluster);
    }

    // 2. Generar todas las combinaciones posibles
    const combinations = getCombinations(numClusters, clustersPerCard);

    // 3. Construir los cartones
    const cards = combinations.map(indices => {
        const cardNumbers = indices.flatMap(idx => clusters[idx]);
        return cardNumbers.sort((a,b) => a-b);
    });

    return cards;
}

function auditV10(cards, totalBalls, sims = 1000) {
    let singleWinnerCount = 0;
    let totalFollowers = 0;

    const balls = Array.from({ length: totalBalls }, (_, i) => i + 1);
    for (let t = 0; t < sims; t++) {
        // Shuffle balls
        for (let i = balls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [balls[i], balls[j]] = [balls[j], balls[i]];
        }
        const ballPos = new Array(totalBalls + 1);
        balls.forEach((b, i) => ballPos[b] = i);

        const finishTimes = cards.map(c => Math.max(...c.map(n => ballPos[n])));
        const min1 = Math.min(...finishTimes);
        const winners1 = finishTimes.filter(ti => ti === min1).length;
        
        if (winners1 === 1) {
            singleWinnerCount++;
            const tNext = Math.min(...finishTimes.filter(ti => ti !== min1));
            const followers = finishTimes.filter(ti => ti === tNext).length;
            totalFollowers += followers;
        }
    }

    return {
        singleWinnerProb: (singleWinnerCount / sims) * 100,
        avgFollowers: singleWinnerCount > 0 ? (totalFollowers / singleWinnerCount) : 0
    };
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

function combinationsCount(n, k) {
    if (k > n) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- END BINGO GENERATOR PRO V10 LOGIC ---







export const createEdition = async (req, res) => {
    try {
        let { 
            name, cost, maxQuotas, installments,
            totalBalls, clusterSize, clustersPerCard, cardSets
        } = req.body;

        // Asegurar que los parámetros sean números (evitar fallos en comparaciones ===)
        totalBalls = Number(totalBalls) || 70;
        clusterSize = Number(clusterSize) || 5;
        clustersPerCard = Number(clustersPerCard) || 4;
        cardSets = Number(cardSets) || 5;

        // 1. Validaciones
        const existingEdition = await Edition.findOne({ name });
        if (existingEdition) {
            return res.status(400).json({ message: 'El nombre de la edición ya existe.' });
        }

        if (totalBalls % clusterSize !== 0) {
            return res.status(400).json({ message: 'El total de bolillas debe ser divisible por el tamaño del clúster.' });
        }

        const numClusters = totalBalls / clusterSize;
        const totalCombinations = combinationsCount(numClusters, clustersPerCard);


        if (totalCombinations > 50000) {
            return res.status(400).json({ message: `La configuración genera ${totalCombinations} cartones, excediendo el límite de 50,000.` });
        }

        console.log(`🚀 Iniciando generación V10: ${totalCombinations} cartones, ${cardSets} juegos...`);

        // 2. Generación de Números (Múltiples Sets)
        const allSets = [];
        for (let s = 1; s <= cardSets; s++) {
            console.log(`🎲 Generando Set #${s}...`);
            allSets.push(generateV10Set({ totalBalls, clusterSize, clustersPerCard }));
        }

        // 3. Auditoría del primer set (como referencia)
        const stats = auditV10(allSets[0], totalBalls);

        // 4. Guardar Edición
        const newEdition = new Edition({
            name,
            quantityCartons: totalCombinations,
            cost,
            maxQuotas,
            installments,
            totalBalls,
            clusterSize,
            clustersPerCard,
            cardSets,
            auditStats: stats,
            user: req.user.id
        });

        const savedEdition = await newEdition.save();

        // 5. Crear documentos BingoCard
        const bingoCards = [];
        
        // Mapeo aleatorio de índices para dispersar la similitud matemática
        // Esto evita que cartones con IDs seguidos sean físicamente similares.
        const shuffledIndices = shuffleArray(Array.from({ length: totalCombinations }, (_, i) => i));

        for (let i = 0; i < totalCombinations; i++) {
            const originalIndex = shuffledIndices[i];
            const cardSetsData = allSets.map((set, index) => ({
                setNumber: index + 1,
                numbers: set[originalIndex]
            }));

            bingoCards.push({
                edition: savedEdition._id,
                number: i + 1,
                status: 'Disponible',
                cardSets: cardSetsData,
                user: req.user.id
            });
        }

        // Insertar masivamente
        await BingoCard.insertMany(bingoCards);

        res.json({
            edition: savedEdition,
            bingoCardsCreated: totalCombinations,
            stats
        });
    } catch (error) {
        console.error("Error en createEdition:", error);
        return res.status(500).json({ message: error.message });
    }
};



export const getEdition = async (req, res) => {
    try {
        const edition = await Edition.findById(req.params.id).populate('user');
        if (!edition) return res.status(404).json({ message: 'Edition not found' });
        res.json(edition);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteEdition = async (req, res) => {
    try {
        const edition = await Edition.findByIdAndDelete(req.params.id);
        if (!edition) return res.status(404).json({ message: 'Edition not found' });
        return res.status(204).json({ message: 'Edition deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateEdition = async (req, res) => {
    try {
        const edition = await Edition.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user');
        if (!edition) return res.status(404).json({ message: 'Edition not found' });
        res.json(Edition);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
