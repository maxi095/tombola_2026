// auditWinnerPattern.mjs
import mongoose from "mongoose";
import dotenv from "dotenv";
import BingoCard from "../src/models/bingoCard.model.js";
import Edition from "../src/models/edition.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function auditWinnerPattern({ editionId, setNumber = 1, Simulations = 10 }) {
    await mongoose.connect(MONGODB_URI);

    const edition = await Edition.findById(editionId);
    if (!edition) {
        console.error("❌ Edición no encontrada");
        await mongoose.disconnect();
        return;
    }

    const TOTAL_NUMEROS = edition.totalBalls || 70;

    // Cargar cartones
    const rawCards = await BingoCard.find({ edition: editionId }, "cardSets number");
    const cartones = rawCards.map(c => ({
        number: c.number,
        numbers: c.cardSets.find(s => s.setNumber === setNumber).numbers
    }));

    // Variables de Estadísticas Globales
    const stats = {
        totalSims: Simulations,
        singleWinnerSims: 0,
        multipleWinnersSims: 0,
        consecutiveWinnerCount: 0,
        totalSecondaryWinners: new Map(),
        cardPerformance: new Map(),

        // --- Nuevas Métricas de Diversidad ---
        zoneHits: [0, 0, 0, 0], // Votos por cuartil (Q1, Q2, Q3, Q4)
        clusterEvents: 0,       // Sorteos donde > 75% de ganadores caen en la misma zona
        totalIdSpread: 0        // Suma de desvíos estándar para promedio final
    };

    const totalCartones = cartones.length;
    const quartileSize = Math.ceil(totalCartones / 4);

    console.log(`\n🕵️ AUDITORÍA AVANZADA V10 - Edición: ${edition.name} | Juego #${setNumber}`);
    console.log(`----------------------------------------------------------------------`);

    for (let i = 1; i <= Simulations; i++) {
        const bolillero = Array.from({ length: TOTAL_NUMEROS }, (_, i) => i + 1)
            .sort(() => Math.random() - 0.5);

        const ballPos = new Array(TOTAL_NUMEROS + 1);
        bolillero.forEach((b, pos) => ballPos[b] = pos);

        const finishTimes = cartones.map(c => ({
            number: c.number,
            time: Math.max(...c.numbers.map(n => ballPos[n]))
        }));

        finishTimes.sort((a, b) => a.time - b.time);

        const minTime1 = finishTimes[0].time;
        const winners1 = finishTimes.filter(f => f.time === minTime1);

        const nextTimes = finishTimes.filter(f => f.time > minTime1);
        const minTime2 = nextTimes.length > 0 ? nextTimes[0].time : null;
        const winners2 = minTime2 !== null ? nextTimes.filter(f => f.time === minTime2) : [];

        const allPodium = [...winners1, ...winners2];
        const podiumIds = allPodium.map(w => w.number);

        // --- Registro de Estadísticas ---
        if (winners1.length === 1) stats.singleWinnerSims++;
        else stats.multipleWinnersSims++;

        winners1.forEach(w => {
            stats.cardPerformance.set(w.number, (stats.cardPerformance.get(w.number) || 0) + 1);
        });

        if (winners2.length > 0) {
            stats.totalSecondaryWinners.set(winners2.length, (stats.totalSecondaryWinners.get(winners2.length) || 0) + 1);
        }

        // 1. Métrica de Proximidad (Consecutivos)
        const sortedIds = [...podiumIds].sort((a, b) => a - b);
        for (let p = 0; p < sortedIds.length - 1; p++) {
            if (sortedIds[p + 1] === sortedIds[p] + 1) stats.consecutiveWinnerCount++;
        }

        // 2. Métrica de Zonas (Cuartiles)
        const localZoneHits = [0, 0, 0, 0];
        podiumIds.forEach(id => {
            const zIdx = Math.min(Math.floor((id - 1) / quartileSize), 3);
            localZoneHits[zIdx]++;
            stats.zoneHits[zIdx]++;
        });

        // 3. Detección de Clustering (Si una zona tiene mayoría absoluta del podio)
        if (localZoneHits.some(h => h >= podiumIds.length * 0.75 && podiumIds.length > 1)) {
            stats.clusterEvents++;
        }

        // 4. Spread (Desvío Estándar de IDs en este sorteo)
        if (podiumIds.length > 1) {
            const mean = podiumIds.reduce((a, b) => a + b, 0) / podiumIds.length;
            const variance = podiumIds.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / podiumIds.length;
            stats.totalIdSpread += Math.sqrt(variance);
        }

        // Mostrar línea individual (solo 20 para no saturar si Simulations es muy alto)
        if (i <= 20 || i % 100 === 0) {
            const winNums = winners1.map(w => `#${w.number}`).join(', ');
            const followNums = winners2.map(w => `#${w.number}`).join(', ');
            const gap = minTime2 !== null ? (minTime2 - minTime1) : 0;
            console.log(`Sorteo #${i.toString().padStart(4, '0')} | Ganador ${winNums.padEnd(10)} (bol. ${minTime1 + 1}) | ${winners2.length} follow (+${gap} b): ${followNums}`);
        }
    }

    // --- REPORTE FINAL ---
    console.log(`\n📊 RESUMEN FINAL DE AUDITORÍA (${Simulations} Simulaciones)`);
    console.log(`----------------------------------------------------------------------`);
    console.log(`✅ Ganador Único (1º Puesto): ${((stats.singleWinnerSims / Simulations) * 100).toFixed(1)}%`);
    console.log(`👥 Empates en 1º Puesto: ${((stats.multipleWinnersSims / Simulations) * 100).toFixed(1)}%`);

    console.log(`\n🥈 Distribución del 2do Puesto:`);
    [...stats.totalSecondaryWinners.entries()].sort((a, b) => a[0] - b[0]).forEach(([cant, veces]) => {
        console.log(`   - ${cant} ganadores simultáneos: ${veces} veces`);
    });

    console.log(`\n🧩 DIAGNÓSTICO DE DIVERSIDAD Y DISPERSIÓN:`);
    const proximityRatio = (stats.consecutiveWinnerCount / Simulations).toFixed(3);
    const clusterRatio = (stats.clusterEvents / Simulations).toFixed(3);
    const avgSpread = (stats.totalIdSpread / Simulations).toFixed(0);

    console.log(`   - Ratio de Proximidad (Consecutivos): ${proximityRatio}`);
    console.log(`   - Eventos de Clustering por Zona: ${stats.clusterEvents} (${(clusterRatio * 100).toFixed(1)}%)`);
    console.log(`   - Dispersión Promedio (ID Spread): ${avgSpread} unidades`);

    console.log(`\n🌍 Distribución por Cuartiles del Talonario:`);
    const totalHits = stats.zoneHits.reduce((a, b) => a + b, 0);
    stats.zoneHits.forEach((h, i) => {
        const pct = ((h / totalHits) * 100).toFixed(1);
        console.log(`   - Q${i + 1} [${i * 25 + 1}-${(i + 1) * 25}%]: ${pct}% de los premios`);
    });

    if (clusterRatio > 0.1 || proximityRatio > 0.1) {
        console.log(`\n⚠️ ADVERTENCIA: Se detecta tendencia al agrupamiento.`);
    } else {
        console.log(`\n✨ EXCELENTE: Los premios están dispersos uniformemente por todo el talonario.`);
    }

    console.log(`\n🏆 TOP 20 CARTONES MÁS GANADORES:`);
    [...stats.cardPerformance.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .forEach(([num, wins], idx) => {
            console.log(`   ${(idx + 1).toString().padStart(2, ' ')}. Cartón #${num.toString().padEnd(5)} | 🏅 ${wins} victorias`);
        });

    console.log(`----------------------------------------------------------------------`);
    await mongoose.disconnect();
}

const CONFIG = {
    editionId: "69ddaf66c8f3d5a6510b0336", // Edición 
    setNumber: 5,
    Simulations: 5000 // Cantidad de ejemplos visuales
};

auditWinnerPattern(CONFIG);
