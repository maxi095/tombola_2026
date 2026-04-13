import xlsx from "xlsx";

/**
 * BINGO GENERATOR PRO V2 - INTENSIVE OPTIMIZATION
 * 
 * Este motor utiliza Recocido Simulado intensivo para maximizar la 
 * probabilidad del patrón 1+4 en cualquier sorteo aleatorio.
 */

const CONFIG = {
    TOTAL_CARDS: 1001,      // Empezamos con un set pequeño para demostrar la convergencia ráṕida
    NUM_PER_CARD: 20,
    MAX_BALL: 70,
    TARGET_SECOND: 4,     // Queremos 4 ganadores en el segundo puesto
    SIMS_PER_EVAL: 2000,  // Calidad de la estimación estadística
    MAX_ITERATIONS: 1000000, // Ajustado para esta sesión intensiva
    INITIAL_TEMP: 2.0,
    COOLING: 0.99999
};

function generateRandomSet() {
    const s = new Set();
    while (s.size < CONFIG.NUM_PER_CARD) s.add(Math.floor(Math.random() * CONFIG.MAX_BALL) + 1);
    return Array.from(s).sort((a, b) => a - b);
}

function evaluate(cards) {
    let tie1 = 0;
    let target2 = 0;
    const balls = Array.from({ length: CONFIG.MAX_BALL }, (_, i) => i + 1);

    for (let t = 0; t < CONFIG.SIMS_PER_EVAL; t++) {
        // Simple shuffle
        for (let i = balls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [balls[i], balls[j]] = [balls[j], balls[i]];
        }
        const ballPos = new Array(CONFIG.MAX_BALL + 1);
        balls.forEach((b, i) => ballPos[b] = i);

        const finishTimes = cards.map(c => Math.max(...c.map(n => ballPos[n])));
        const min1 = Math.min(...finishTimes);
        const w1 = finishTimes.filter(ti => ti === min1).length;

        if (w1 > 1) {
            tie1++;
        } else {
            const times2 = finishTimes.filter(ti => ti !== min1);
            const min2 = Math.min(...times2);
            const w2 = times2.filter(ti => ti === min2).length;
            if (w2 === CONFIG.TARGET_SECOND) target2++;
        }
    }

    // Penalizamos fuertemente los empates en el 1ero
    // Y premiamos que el 2do sea exactamente 4
    const pTie1 = tie1 / CONFIG.SIMS_PER_EVAL;
    const pTarget2 = target2 / CONFIG.SIMS_PER_EVAL;

    return (pTie1 * 5) + (1 - pTarget2);
}

async function optimize() {
    console.log(`🔥 Iniciando Sesión de Optimización Intensiva (${CONFIG.TOTAL_CARDS} cartones)...`);
    let current = Array.from({ length: CONFIG.TOTAL_CARDS }, () => generateRandomSet());
    let currentCost = evaluate(current);
    let best = current.map(c => [...c]);
    let bestCost = currentCost;
    let temp = CONFIG.INITIAL_TEMP;

    for (let i = 0; i < CONFIG.MAX_ITERATIONS; i++) {
        const next = current.map(c => [...c]);
        const cardIdx = Math.floor(Math.random() * CONFIG.TOTAL_CARDS);
        const card = new Set(next[cardIdx]);

        // Mutación: Cambiar un número
        const arr = Array.from(card);
        card.delete(arr[Math.floor(Math.random() * arr.length)]);
        while (card.size < CONFIG.NUM_PER_CARD) card.add(Math.floor(Math.random() * CONFIG.MAX_BALL) + 1);
        next[cardIdx] = Array.from(card).sort((a, b) => a - b);

        const nextCost = evaluate(next);
        const delta = nextCost - currentCost;

        if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
            current = next;
            currentCost = nextCost;
            if (currentCost < bestCost) {
                bestCost = currentCost;
                best = current.map(c => [...c]);
                console.log(`Iter ${i} | Cost: ${bestCost.toFixed(4)} | P(1+4): ${((1 - (bestCost % 1)) * 100).toFixed(2)}%`);
            }
        }

        temp *= CONFIG.COOLING;
        if (i % 500 === 0) console.log(`Progreso: ${((i / CONFIG.MAX_ITERATIONS) * 100).toFixed(1)}% | Temp: ${temp.toFixed(4)}`);
        if (bestCost === 0) break;
    }

    console.log(`\n✅ Optimización terminada. Mejor Costo: ${bestCost.toFixed(4)}`);
    return best;
}

optimize().then(bestCards => {
    const data = bestCards.map((c, i) => ({ CARTON: i + 1, ...Object.fromEntries(c.map((n, j) => [`N${j + 1}`, n])) }));
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Cartones_Optimizados");
    xlsx.writeFile(wb, "Cartones_PRO_Intensivo.xlsx");
    console.log("💾 Archivo 'Cartones_PRO_Intensivo.xlsx' generado con éxito.");
});
