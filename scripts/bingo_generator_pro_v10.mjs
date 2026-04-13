import xlsx from "xlsx";

/**
 * BINGO GENERATOR PRO V10 - MATRIZ DE CLÚSTERES DETERMINISTA
 * 
 * Implementa la arquitectura combinatoria C(14,4) = 1001.
 * - 70 bolillas divididas en 14 clústeres de 5.
 * - Cada cartón es una combinación única de 4 clústeres.
 * - Balance de bolillas perfecto (0.00 StdDev).
 * - Estructura jerárquica natural.
 */

const CONFIG = {
    TOTAL_BALLS: 70,
    CLUSTER_SIZE: 5,
    NUM_CLUSTERS: 14, // 70 / 5
    CLUSTERS_PER_CARD: 4, // 4 * 5 = 20 bolillas
};

// Generador de Combinaciones C(n, k)
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

function generateV10() {
    console.log(`💎 Generando Matriz Maestro V10 (Combinatoria C(14,4))...`);
    
    // 1. Partición de bolillas en Clústeres (ESTRATOS DINÁMICOS)
    // El número de bolillas por estrato es igual al número de clústeres totales
    const ballsPerStratum = CONFIG.NUM_CLUSTERS;
    const strata = [];
    
    for (let s = 0; s < CONFIG.CLUSTER_SIZE; s++) {
        const start = s * ballsPerStratum + 1;
        const stratum = Array.from({ length: ballsPerStratum }, (_, i) => start + i)
                             .sort(() => 0.5 - Math.random());
        strata.push(stratum);
    }
    
    const clusters = [];
    for (let i = 0; i < CONFIG.NUM_CLUSTERS; i++) {
        // Cada clúster toma exactamente una bolilla de cada estrato (Balance Visual Global)
        const cluster = [];
        for (let s = 0; s < CONFIG.CLUSTER_SIZE; s++) {
            cluster.push(strata[s][i]);
        }
        clusters.push(cluster);
    }

    // 2. Generar todas las combinaciones posibles
    const combinations = getCombinations(CONFIG.NUM_CLUSTERS, CONFIG.CLUSTERS_PER_CARD);
    console.log(`✅ ${combinations.length} combinaciones únicas generadas.`);

    // 3. Construir los cartones
    const cards = combinations.map(indices => {
        const cardNumbers = indices.flatMap(idx => clusters[idx]);
        return cardNumbers.sort((a,b) => a-b);
    });

    return { cards, clusters };
}

function audit(cards) {
    console.log("\n📊 AUDITORÍA FORENSE V10:");
    
    // 1. Balance Perfecto
    const freq = {};
    cards.forEach(c => c.forEach(n => freq[n] = (freq[n] || 0) + 1));
    const vals = Object.values(freq);
    const avg = vals.reduce((a, b) => a + b, 0) / 70;
    const stdDev = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / 70);
    
    console.log(`- Frecuencia por bolilla: ${avg.toFixed(2)} (Debería ser 286.00)`);
    console.log(`- Desviación Estándar de Frecuencia: ${stdDev.toFixed(4)} (Debería ser 0.0000)`);

    // 2. Simulación de Comportamiento 1+N
    const SIMS = 5000;
    let singleWinnerCount = 0;
    let totalFollowers = 0;

    const balls = Array.from({ length: 70 }, (_, i) => i + 1);
    for (let t = 0; t < SIMS; t++) {
        // Shuffle balls
        for (let i = balls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [balls[i], balls[j]] = [balls[j], balls[i]];
        }
        const ballPos = new Array(71);
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

    console.log(`- Probabilidad Ganador Único (1°): ${(singleWinnerCount / SIMS * 100).toFixed(2)}%`);
    if (singleWinnerCount > 0) {
        console.log(`- Promedio de Seguidores (2°): ${(totalFollowers / singleWinnerCount).toFixed(2)}`);
    }
}

const { cards } = generateV10();
audit(cards);

// Guardar
const filename = "Bingo_PRO_V10_1001.xlsx";
const data = cards.map((c, i) => ({ 
    CARTON: i + 1, 
    ...Object.fromEntries(c.map((n, j) => [`N${j+1}`, n])) 
}));
const ws = xlsx.utils.json_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "Edition_V10");
xlsx.writeFile(wb, filename);

console.log(`\n💾 Archivo '${filename}' generado con éxito.`);
console.log(`📌 NOTA: Este set es matemáticamente idéntico en estructura al del consultor.`);
