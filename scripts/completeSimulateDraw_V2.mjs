import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import BingoCard from "../src/models/bingoCard.model.js";
import Edition from "../src/models/edition.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";
const MAX_BALL = 70; // Rango confirmado 1-70 para tombola 2026

/**
 * SIMULADOR DE SORTEOS V2 - ANÁLISIS DE EFICIENCIA 1+4 INTERACTIVO
 * 
 * Este script analiza la eficacia de una edición cargada en la DB.
 * Permite al usuario seleccionar la edición, qué sorteos (cardSets)
 * simular, y la cantidad de simulaciones.
 * Muestra el resultado de cada simulación fila por fila en la terminal,
 * indicando el/los cartones ganadores del 1° y 2° puesto.
 */

async function simularEdicion({ editionId, editionName, chosenSets, simulations = 10 }) {
  console.log(`\n==================================================`);
  console.log(`🧐 AUDITANDO EDICIÓN: ${editionName} (${editionId})`);
  console.log(`==================================================`);

  const cartones = await BingoCard.find({ edition: editionId });
  if (cartones.length === 0) {
    console.error(`❌ No se encontraron cartones para la edición ${editionName}`);
    return;
  }
  console.log(`🎫 Total de cartones cargados: ${cartones.length}`);

  const edition = await Edition.findById(editionId);
  const maxBall = edition?.totalBalls || MAX_BALL;
  const balls = Array.from({ length: maxBall }, (_, i) => i + 1);

  for (const s of chosenSets) {
    console.log(`\n--- SORTEO #${s} ---`);
    
    // Mapear cada cartón para el set s, reteniendo su número
    const setsPool = cartones.map(c => {
      const set = c.cardSets.find(cs => cs.setNumber === s);
      return set ? { number: c.number, numbers: set.numbers } : null;
    }).filter(n => n !== null);

    if (setsPool.length === 0) {
      console.log(`⚠️ No hay datos para el sorteo #${s}`);
      continue;
    }

    let results = {
        uniqueWinnersFirst: 0,
        perfectPattern: 0, // 1 único y luego exactamente 4
        averageBallsToWin: 0,
        totalBalls: 0
    };

    let secondPlaceWinnersDist = new Map();

    for (let t = 0; t < simulations; t++) {
      // Mezclar bolillas
      for (let i = balls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [balls[i], balls[j]] = [balls[j], balls[i]];
      }

      const ballPos = new Array(maxBall + 1);
      balls.forEach((b, i) => ballPos[b] = i);

      // Tiempos de finalización con el número de cartón
      const finishTimes = setsPool.map(card => ({
        number: card.number,
        finishTime: Math.max(...card.numbers.map(n => ballPos[n]))
      }));
      
      const times = finishTimes.map(c => c.finishTime);
      const min1 = Math.min(...times);
      
      // Ganadores del 1° puesto
      const winners1 = finishTimes.filter(c => c.finishTime === min1);
      const winner1Numbers = winners1.map(c => c.number);
      const ballsToWin1 = min1 + 1;
      
      results.totalBalls += ballsToWin1;

      // Ganadores del 2° puesto
      const timesWithoutFirst = times.filter(ti => ti !== min1);
      let min2 = null;
      let winners2 = [];
      let winner2Numbers = [];
      let ballsToWin2 = null;

      if (timesWithoutFirst.length > 0) {
        min2 = Math.min(...timesWithoutFirst);
        winners2 = finishTimes.filter(c => c.finishTime === min2);
        winner2Numbers = winners2.map(c => c.number);
        ballsToWin2 = min2 + 1;
      }

      // Mostrar fila por fila de cada simulación
      const formatWinners1 = winner1Numbers.map(num => `#${num}`).join(", ");
      const formatWinners2 = winner2Numbers.length > 0 ? winner2Numbers.map(num => `#${num}`).join(", ") : "Ninguno";
      
      console.log(`[Simulación #${t + 1}] Ganador 1° Puesto: Cartón(es) ${formatWinners1} (${ballsToWin1} bolillas) | Ganador 2° Puesto: Cartón(es) ${formatWinners2} (${ballsToWin2 ? `${ballsToWin2} bolillas` : "N/A"})`);

      if (winners1.length === 1) {
        results.uniqueWinnersFirst++;
        
        if (winners2.length > 0) {
          const winners2Count = winners2.length;
          secondPlaceWinnersDist.set(winners2Count, (secondPlaceWinnersDist.get(winners2Count) || 0) + 1);
          
          if (winners2Count === 4) {
              results.perfectPattern++;
          }
        }
      }
    }

    console.log(`\n📊 Resultados Consolidados Sorteo #${s}:`);
    console.log(`   - Bolillas promedio para ganar: ${(results.totalBalls / simulations).toFixed(2)}`);
    console.log(`   - Probabilidad Ganador Único (1°): ${(results.uniqueWinnersFirst / simulations * 100).toFixed(2)}%`);
    console.log(`   - Probabilidad Patrón 1+4 (Perfecto): ${(results.perfectPattern / simulations * 100).toFixed(2)}%`);
    
    if (results.uniqueWinnersFirst > 0) {
        console.log(`   - Distribución 2° lugar (Top 3 cases):`);
        const sorted = [...secondPlaceWinnersDist.entries()].sort((a,b) => b[1] - a[1]).slice(0, 3);
        sorted.forEach(([count, freq]) => {
            console.log(`      * ${count} ganadores simultáneos en 2° puesto: ${(freq / results.uniqueWinnersFirst * 100).toFixed(2)}%`);
        });
    }
  }
}

async function runInteractiveAudit() {
  const rl = readline.createInterface({ input, output });
  try {
    console.log("🔌 Conectando a la base de datos...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado a MongoDB.");

    // Obtener ediciones
    const editions = await Edition.find().sort({ name: 1 });
    if (editions.length === 0) {
      console.log("❌ No se encontraron ediciones en la base de datos.");
      return;
    }

    console.log("\n📋 EDICIONES DISPONIBLES:");
    editions.forEach((ed, idx) => {
      console.log(`[${idx + 1}] Edición: ${ed.name} (ID: ${ed._id})`);
    });

    const edSelection = await rl.question("\nSeleccione el número de la edición a simular: ");
    const selectedEdIdx = parseInt(edSelection) - 1;
    if (isNaN(selectedEdIdx) || selectedEdIdx < 0 || selectedEdIdx >= editions.length) {
      console.log("❌ Selección de edición inválida.");
      return;
    }
    const selectedEdition = editions[selectedEdIdx];

    const maxSets = selectedEdition.cardSets || 5;
    console.log(`\nEsta edición tiene ${maxSets} cardSets (sorteos) por cartón.`);
    const setSelection = await rl.question(`Ingrese los cardSets a simular (ej: 1, 3, 5 o presione ENTER/escriba 'todos' para todos): `);
    
    let chosenSets = [];
    if (setSelection.trim().toLowerCase() === "todos" || setSelection.trim() === "") {
      chosenSets = Array.from({ length: maxSets }, (_, i) => i + 1);
    } else {
      chosenSets = setSelection.split(",")
        .map(s => parseInt(s.trim()))
        .filter(s => !isNaN(s) && s >= 1 && s <= maxSets);
    }

    if (chosenSets.length === 0) {
      console.log("❌ No seleccionó ningún cardSet válido.");
      return;
    }

    const simsInput = await rl.question("\nIngrese la cantidad de simulaciones a realizar (ej: 10, recomendado para visualización fila por fila <= 50): ");
    const simulations = parseInt(simsInput) || 10;

    await simularEdicion({ 
        editionId: selectedEdition._id, 
        editionName: selectedEdition.name,
        chosenSets,
        simulations 
    });

  } catch (error) {
    console.error("❌ Error durante la auditoría:", error);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log("\n🔌 Conexión a base de datos cerrada.");
  }
}

runInteractiveAudit();
