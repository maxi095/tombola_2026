import mongoose from "mongoose";
import dotenv from "dotenv";
import BingoCard from "../src/models/bingoCard.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";
const MAX_BALL = 70; // Rango confirmado 1-70 para tombola 2026

/**
 * SIMULADOR DE SORTEOS V2 - ANÁLISIS DE EFICIENCIA 1+4
 * 
 * Este script analiza la eficacia de una edición cargada en la DB.
 * Analiza cada uno de los 5 sorteos de forma independiente.
 */

async function simularEdicion({ editionId, editionName, simulations = 1000 }) {
  console.log(`\n==================================================`);
  console.log(`🧐 AUDITANDO EDICIÓN: ${editionName} (${editionId})`);
  console.log(`==================================================`);

  const cartones = await BingoCard.find({ edition: editionId });
  if (cartones.length === 0) {
    console.error(`❌ No se encontraron cartones para la edición ${editionName}`);
    return;
  }
  console.log(`🎫 Total de cartones cargados: ${cartones.length}`);

  const balls = Array.from({ length: MAX_BALL }, (_, i) => i + 1);

  for (let s = 1; s <= 5; s++) {
    console.log(`\n--- SORTEO #${s} ---`);
    
    const setsPool = cartones.map(c => {
      const set = c.cardSets.find(cs => cs.setNumber === s);
      return set ? set.numbers : null;
    }).filter(n => n !== null);

    if (setsPool.length === 0) {
      console.log(`⚠️ No hay datos para el sorteo #${s}`);
      continue;
    }

    let results = {
        uniqueWinnersFirst: 0,
        perfectPattern: 0, // 1 unique then exactly 4
        averageBallsToWin: 0,
        totalBalls: 0
    };

    let secondPlaceWinnersDist = new Map();

    for (let t = 0; t < simulations; t++) {
      // Shuffle balls
      for (let i = balls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [balls[i], balls[j]] = [balls[j], balls[i]];
      }

      const ballPos = new Array(MAX_BALL + 1);
      balls.forEach((b, i) => ballPos[b] = i);

      // Tiempos de finalización
      const finishTimes = setsPool.map(set => Math.max(...set.map(n => ballPos[n])));
      
      const min1 = Math.min(...finishTimes);
      const winners1 = finishTimes.filter(ti => ti === min1).length;
      
      results.totalBalls += min1 + 1;

      if (winners1 === 1) {
        results.uniqueWinnersFirst++;
        
        // Analizar segundo lugar
        const timesWithoutFirst = finishTimes.filter(ti => ti !== min1);
        const min2 = Math.min(...timesWithoutFirst);
        const winners2 = timesWithoutFirst.filter(ti => ti === min2).length;
        
        secondPlaceWinnersDist.set(winners2, (secondPlaceWinnersDist.get(winners2) || 0) + 1);
        
        if (winners2 === 4) {
            results.perfectPattern++;
        }
      }
    }

    console.log(`📊 Resultados Sorteo #${s}:`);
    console.log(`   - Bolillas promedio para ganar: ${(results.totalBalls / simulations).toFixed(2)}`);
    console.log(`   - Probabilidad Ganador Único (1°): ${(results.uniqueWinnersFirst / simulations * 100).toFixed(2)}%`);
    console.log(`   - Probabilidad Patrón 1+4 (Perfecto): ${(results.perfectPattern / simulations * 100).toFixed(2)}%`);
    
    if (results.uniqueWinnersFirst > 0) {
        console.log(`   - Distribución 2° lugar (Top 3 cases):`);
        const sorted = [...secondPlaceWinnersDist.entries()].sort((a,b) => b[1] - a[1]).slice(0, 3);
        sorted.forEach(([count, freq]) => {
            console.log(`      * ${count} ganadores simultáneos: ${(freq / results.uniqueWinnersFirst * 100).toFixed(2)}%`);
        });
    }
  }
}

async function runAudit() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Edición 2025
    await simularEdicion({ 
        editionId: "681f5787e335bd326e9f6793", 
        editionName: "2025",
        simulations: 2000 
    });

    // Edición 2026
    await simularEdicion({ 
        editionId: "69d93711e325309d39c0d895", 
        editionName: "2026",
        simulations: 2000 
    });

  } catch (error) {
    console.error("❌ Error durante la auditoría:", error);
  } finally {
    await mongoose.disconnect();
  }
}

runAudit();
