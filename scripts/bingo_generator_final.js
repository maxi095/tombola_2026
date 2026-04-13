import mongoose from "mongoose";
import xlsx from "xlsx";
import "dotenv/config.js";

/**
 * BINGO GENERATOR FINAL - LÓGICA 1+4
 * 
 * Este script utiliza Recocido Simulado (Simulated Annealing) para generar
 * sets de cartones que cumplen estadísticamente con el patrón:
 * 1 ganandor único (1er puesto) y 4 ganadores simultáneos (2do puesto).
 */

const CONFIG = {
    TOTAL_CARDS: 100, // Ajustado para demo, cambiar a 1001 para producción
    NUM_PER_CARD: 20,
    MAX_BALL: 70,
    TARGET_SECOND_PLACE_WINNERS: 4,
    TRIALS_PER_EVAL: 500, // Simulaciones de sorteo para medir probabilidad
    MAX_ITERATIONS: 2000,
    INITIAL_TEMP: 1.0,
    COOLING_RATE: 0.99
};

// --- UTILIDADES ---

function getRandomBall() {
    return Math.floor(Math.random() * CONFIG.MAX_BALL) + 1;
}

function generateRandomSet() {
    const s = new Set();
    while (s.size < CONFIG.NUM_PER_CARD) s.add(getRandomBall());
    return Array.from(s).sort((a, b) => a - b);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- EVALUACIÓN (SIMULACIÓN DE SORTEO) ---

/**
 * Simula sorteos y devuelve el costo (penalización).
 * Costo 0 = Perfección (1 ganador único siempre, y siempre 4 en 2do lugar).
 */
function evaluateCost(cards) {
    let tieAtFirstCount = 0;
    let notTargetSecondPlaceCount = 0;
    
    const balls = Array.from({ length: CONFIG.MAX_BALL }, (_, i) => i + 1);
    
    for (let t = 0; t < CONFIG.TRIALS_PER_EVAL; t++) {
        shuffle(balls);
        const ballPos = new Array(CONFIG.MAX_BALL + 1);
        balls.forEach((b, i) => ballPos[b] = i);
        
        // Tiempos de finalización (índice de la última bola necesaria)
        const finishTimes = cards.map(card => 
            Math.max(...card.map(n => ballPos[n]))
        );
        
        // 1er lugar
        const min1 = Math.min(...finishTimes);
        const winners1 = finishTimes.filter(ti => ti === min1).length;
        if (winners1 > 1) tieAtFirstCount++;
        
        // 2do lugar
        const timesWithoutFirst = finishTimes.filter(ti => ti !== min1);
        if (timesWithoutFirst.length > 0) {
            const min2 = Math.min(...timesWithoutFirst);
            const winners2 = timesWithoutFirst.filter(ti => ti === min2).length;
            if (winners2 !== CONFIG.TARGET_SECOND_PLACE_WINNERS) {
                notTargetSecondPlaceCount++;
            }
        } else {
            notTargetSecondPlaceCount++;
        }
    }
    
    // El costo es la suma de las tasas de error
    return (tieAtFirstCount / CONFIG.TRIALS_PER_EVAL) + (notTargetSecondPlaceCount / CONFIG.TRIALS_PER_EVAL);
}

// --- ALGORITMO PRINCIPAL ---

async function runOptimization() {
    console.log(`🚀 Iniciando optimización para ${CONFIG.TOTAL_CARDS} cartones...`);
    
    let currentCards = Array.from({ length: CONFIG.TOTAL_CARDS }, () => generateRandomSet());
    let currentCost = evaluateCost(currentCards);
    let bestCards = currentCards.map(c => [...c]);
    let bestCost = currentCost;
    
    let temp = CONFIG.INITIAL_TEMP;
    
    for (let i = 0; i < CONFIG.MAX_ITERATIONS; i++) {
        // Generar vecino (cambiar un número de un cartón al azar)
        const nextCards = currentCards.map(c => [...c]);
        const cardToChangeIdx = Math.floor(Math.random() * CONFIG.TOTAL_CARDS);
        const card = new Set(nextCards[cardToChangeIdx]);
        
        // Quitar uno, poner otro
        const arr = Array.from(card);
        card.delete(arr[Math.floor(Math.random() * arr.length)]);
        while (card.size < CONFIG.NUM_PER_CARD) card.add(getRandomBall());
        nextCards[cardToChangeIdx] = Array.from(card).sort((a, b) => a - b);
        
        const nextCost = evaluateCost(nextCards);
        const delta = nextCost - currentCost;
        
        if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
            currentCards = nextCards;
            currentCost = nextCost;
            
            if (currentCost < bestCost) {
                bestCost = currentCost;
                bestCards = currentCards.map(c => [...c]);
                console.log(`Iteration ${i}: New Best Cost = ${bestCost.toFixed(4)}`);
            }
        }
        
        temp *= CONFIG.COOLING_RATE;
        if (bestCost === 0) {
            console.log("🎯 ¡Perfección alcanzada!");
            break;
        }
        
        if (i % 100 === 0) {
            console.log(`Progress: Iteration ${i}, Temp: ${temp.toFixed(4)}, Current Cost: ${currentCost.toFixed(4)}`);
        }
    }
    
    console.log(`✅ Optimización finalizada. Mejor costo: ${bestCost.toFixed(4)}`);
    return bestCards;
}

// --- GUARDAR RESULTADOS ---

function saveToExcel(results, filename) {
    const data = [];
    results.forEach((card, idx) => {
        const row = { CARTON: idx + 1 };
        card.forEach((num, i) => row[`N${i+1}`] = num);
        data.push(row);
    });
    
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Cartones");
    xlsx.writeFile(wb, filename);
    console.log(`💾 Resultados guardados en ${filename}`);
}

// Ejecución
runOptimization().then(cards => {
    saveToExcel(cards, "Cartones_Generados_1plus4.xlsx");
});
