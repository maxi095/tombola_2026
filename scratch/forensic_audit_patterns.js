import mongoose from "mongoose";
import dotenv from "dotenv";
import BingoCard from "../src/models/bingoCard.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function deepAuditExistingEditions() {
  await mongoose.connect(MONGODB_URI);
  
  const editions = [
    { id: "681f5787e335bd326e9f6793", name: "2025" },
    { id: "69d93711e325309d39c0d895", name: "2026" }
  ];

  console.log("🔍 INICIANDO AUDITORÍA FORENSE DE PATRONES (2025 vs 2026)\n");

  for (const ed of editions) {
    console.log(`--- Edición ${ed.name} ---`);
    const cartones = await BingoCard.find({ edition: ed.id });
    
    for (let s = 1; s <= 5; s++) {
      const sets = cartones.map(c => {
        const found = c.cardSets.find(cs => cs.setNumber === s);
        return found ? found.numbers.sort((a,b) => a-b) : null;
      }).filter(n => n !== null);

      if (sets.length === 0) continue;

      // 1. Análisis de Intersección Promedio
      let totalIntersect = 0;
      let count = 0;
      // Muestrear 50 cartones al azar para eficiencia
      for (let i = 0; i < 50; i++) {
        for (let j = i + 1; j < 50; j++) {
          const intersect = sets[i].filter(n => sets[j].includes(n)).length;
          totalIntersect += intersect;
          count++;
        }
      }
      const avgIntersect = totalIntersect / count;

      // 2. Análisis de Números "Gris/Blanco" (Frecuencia)
      const freq = {};
      sets.forEach(set => set.forEach(n => freq[n] = (freq[n] || 0) + 1));
      const freqValues = Object.values(freq);
      const stdDev = Math.sqrt(freqValues.map(x => Math.pow(x - (sets.length * 20 / 70), 2)).reduce((a, b) => a + b) / 70);

      console.log(`[Sorteo ${s}] Intersección Promedio: ${avgIntersect.toFixed(2)} | Desv. Estándar Frecuencia: ${stdDev.toFixed(2)}`);
      
      // 3. Buscar "Familias" (Grupos de 2 que comparten > 15)
      let families = 0;
      for (let i = 0; i < sets.length; i++) {
        let maxI = 0;
        for (let j = 0; j < 50; j++) {
           if (i === j) continue;
           const intersect = sets[i].filter(n => sets[j].includes(n)).length;
           if (intersect >= 15) {
             maxI = intersect;
             break;
           }
        }
        if (maxI >= 15) families++;
      }
      console.log(`   * Cartones con "Hermanos" (>15 compartido): ${families} / ${sets.length}`);
    }
    console.log("");
  }

  await mongoose.disconnect();
}

deepAuditExistingEditions();
