import mongoose from "mongoose";
import dotenv from "dotenv";
import BingoCard from "../src/models/bingoCard.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function masterPatternAudit() {
  await mongoose.connect(MONGODB_URI);
  
  const editions = [
    { id: "681f5787e335bd326e9f6793", name: "2025" },
    { id: "69d93711e325309d39c0d895", name: "2026" }
  ];

  const results = {};

  for (const ed of editions) {
    results[ed.name] = {};
    const cartones = await BingoCard.find({ edition: ed.id });
    
    for (let s = 1; s <= 5; s++) {
      const sets = cartones.map(c => {
        const found = c.cardSets.find(cs => cs.setNumber === s);
        return found ? found.numbers.sort((a,b) => a-b) : null;
      }).filter(n => n !== null);

      if (sets.length === 0) continue;

      // --- ANALISIS 1: ESTADISTICA GLOBAL ---
      const totalCards = sets.length;
      const ballsPerCard = sets[0].length;
      const allNumbers = sets.flat();
      const minBall = Math.min(...allNumbers);
      const maxBall = Math.max(...allNumbers);

      // --- ANALISIS 2: BALANCEO (MEDIA Y DESV. EST.) ---
      const freq = {};
      for (let i = 1; i <= 70; i++) freq[i] = 0;
      allNumbers.forEach(n => freq[n]++);
      
      const counts = Object.values(freq);
      const meanOccur = counts.reduce((a, b) => a + b, 0) / 70;
      const variance = counts.reduce((a, b) => a + Math.pow(b - meanOccur, 2), 0) / 70;
      const stdDev = Math.sqrt(variance);

      // --- ANALISIS 3: PARES Y TRIPLES (COINCIDENCIAS ESTRATEGICAS) ---
      const pairFreq = new Map();
      // Muestrear 200 cartones para pares (por performance)
      sets.slice(0, 200).forEach(set => {
        for (let i = 0; i < set.length; i++) {
          for (let j = i + 1; j < set.length; j++) {
            const pair = `${set[i]}-${set[j]}`;
            pairFreq.set(pair, (pairFreq.get(pair) || 0) + 1);
          }
        }
      });
      const topPairs = [...pairFreq.entries()]
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);

      // --- ANALISIS 4: INTERSECCIONES ---
      const intersectHist = new Array(21).fill(0);
      for (let i = 0; i < 50; i++) {
        for (let j = i + 1; j < 50; j++) {
          const overlap = sets[i].filter(n => sets[j].includes(n)).length;
          intersectHist[overlap]++;
        }
      }

      results[ed.name][`Sorteo_${s}`] = {
        totalCards,
        ballsPerCard,
        range: `${minBall}-${maxBall}`,
        meanOccur,
        stdDev,
        topPairs,
        intersectHist
      };
    }
  }

  // --- OUTPUT FINAL FORMATEADO PARA EL USUARIO ---
  console.log("==================================================================");
  console.log("📊 REPORTE DE PATRONES MAESTRO (EDICIÓN 2025 VS 2026)");
  console.log("==================================================================");

  for (const edName in results) {
    console.log(`\n🔹 EDICIÓN ${edName}`);
    for (const sName in results[edName]) {
      const d = results[edName][sName];
      console.log(`   🔸 ${sName}:`);
      console.log(`      • Cartones: ${d.totalCards} | Bolillas: ${d.ballsPerCard} | Rango: ${d.range}`);
      console.log(`      • Balance: Media ${d.meanOccur.toFixed(2)} | Desv. Estándar ${d.stdDev.toFixed(4)}`);
      console.log(`      • Top Pares (Frecuencia en 200 cartones): ${d.topPairs.map(p => `${p[0]}(${p[1]})`).join(', ')}`);
      
      // Histograma de Intersección simplificado
      const peaks = d.intersectHist.map((v, i) => v > 0 ? i : null).filter(x => x !== null);
      console.log(`      • Picos de Intersección Detectados: [${peaks.join(', ')}] bolillas comunes`);
    }
  }

  await mongoose.disconnect();
}

masterPatternAudit();
