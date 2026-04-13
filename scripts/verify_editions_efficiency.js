import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";
import Edition from "../src/models/edition.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";
const MAX_BALL = 70;
const SIMULATIONS = 2000; // Suficiente para una estimación rápida de eficiencia

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function verifyEfficiency(editionName) {
    console.log(`\n==================================================`);
    console.log(`🚀 ANALIZANDO EFICIENCIA: EDICIÓN ${editionName}`);
    console.log(`==================================================`);

    const edition = await Edition.findOne({ name: editionName });
    if (!edition) {
        console.error(`❌ No se encontró la edición ${editionName}`);
        return;
    }

    const bingoCards = await BingoCard.find({ edition: edition._id });
    console.log(`🎫 Cartones cargados: ${bingoCards.length}`);

    const balls = Array.from({ length: MAX_BALL }, (_, i) => i + 1);

    for (let s = 1; s <= 5; s++) {
        console.log(`\n--- Sorteo #${s} ---`);
        
        // Extraer los sets para este sorteo
        const setsPool = bingoCards.map(c => {
            const set = c.cardSets.find(cs => cs.setNumber === s);
            return set ? set.numbers : null;
        }).filter(n => n !== null);

        if (setsPool.length === 0) {
            console.log("⚠️ No hay sets cargados para este sorteo.");
            continue;
        }

        let tiesAtFirst = 0;
        let winnersAtSecondDist = new Map();

        for (let t = 0; t < SIMULATIONS; t++) {
            shuffle(balls);
            const ballPos = new Array(MAX_BALL + 1);
            balls.forEach((b, i) => ballPos[b] = i);

            const finishTimes = setsPool.map(set => 
                Math.max(...set.map(n => ballPos[n]))
            );

            const min1 = Math.min(...finishTimes);
            const firstWinnersCount = finishTimes.filter(ti => ti === min1).length;
            
            if (firstWinnersCount > 1) {
                tiesAtFirst++;
            } else {
                // Si el primero es único, analizamos el segundo lugar
                const timesWithoutFirst = finishTimes.filter(ti => ti !== min1);
                const min2 = Math.min(...timesWithoutFirst);
                const secondWinnersCount = timesWithoutFirst.filter(ti => ti === min2).length;
                
                winnersAtSecondDist.set(secondWinnersCount, (winnersAtSecondDist.get(secondWinnersCount) || 0) + 1);
            }
        }

        const validGames = SIMULATIONS - tiesAtFirst;
        console.log(`- Prob. Ganador Único (1°): ${(validGames/SIMULATIONS*100).toFixed(2)}%`);
        
        if (validGames > 0) {
            console.log(`- Distribución en 2° lugar (cuando el 1° es único):`);
            const sortedDist = Array.from(winnersAtSecondDist.entries()).sort((a,b) => b[1] - a[1]).slice(0, 5);
            sortedDist.forEach(([count, freq]) => {
                console.log(`   * ${count} ganadores simultáneos: ${(freq/validGames*100).toFixed(2)}%`);
            });
        }
    }
}

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        await verifyEfficiency("2025");
        await verifyEfficiency("2026");
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
