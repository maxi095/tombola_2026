import mongoose from "mongoose";
import xlsx from "xlsx";
import "dotenv/config.js";
import path from "path";
import { fileURLToPath } from "url";

// Importamos el modelo
import BingoCard from "../src/models/bingoCard.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN ---
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

// ID de la edición "2026" obtenido previamente
const currentEditionId = "69d93711e325309d39c0d895"; 
const EXCEL_FILENAME = "Cartones_2026.xlsx"; 

async function updateBingoCardSets(fileName) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("🟢 Conectado a MongoDB");

    // Construir ruta completa al archivo Excel
    const filePath = path.join(__dirname, fileName);
    console.log(`📂 Leyendo archivo: ${filePath}...`);
    
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`📊 Total de filas leídas: ${rows.length}. Iniciando agrupación...`);

    // 1. AGRUPAR FILAS POR CARTÓN
    const cardsMap = new Map();

    rows.forEach((row) => {
      const cartonNumber = row["CARTON"]; 
      const sorteoNumber = row["SORTEO"]; 

      if (!cartonNumber || !sorteoNumber) return;

      const numbers = [];
      for (let i = 1; i <= 20; i++) {
        const key = `N${i}`; 
        const val = parseInt(row[key], 10);
        if (!isNaN(val)) {
          numbers.push(val);
        }
      }

      if (!cardsMap.has(cartonNumber)) {
        cardsMap.set(cartonNumber, []);
      }

      cardsMap.get(cartonNumber).push({
        setNumber: sorteoNumber,
        numbers: numbers
      });
    });

    console.log(`📦 Se procesaron ${cardsMap.size} cartones únicos. Preparando actualización...`);

    // 2. PREPARAR OPERACIONES BULK
    const bulkOps = [];

    for (const [cartonNum, sets] of cardsMap.entries()) {
      sets.sort((a, b) => a.setNumber - b.setNumber);

      bulkOps.push({
        updateOne: {
          filter: { 
            number: cartonNum, 
            edition: currentEditionId 
          },
          update: { 
            $set: { 
              cardSets: sets 
            } 
          }
        }
      });
    }

    // 3. EJECUTAR UPDATE EN MONGODB
    if (bulkOps.length > 0) {
      console.log(`🚀 Ejecutando actualización masiva de ${bulkOps.length} documentos...`);
      
      const result = await BingoCard.bulkWrite(bulkOps);
      
      console.log("✅ Proceso finalizado con éxito.");
      console.log(`   - Documentos encontrados (Matched): ${result.matchedCount}`);
      console.log(`   - Documentos modificados (Modified): ${result.modifiedCount}`);
      
      if (result.matchedCount === 0) {
        console.warn("⚠️ ALERTA: No se encontraron coincidencias. Verifica que los cartones estén creados para esta edición.");
      }
    } else {
      console.log("⚠️ No se generaron operaciones. Revisa la estructura del Excel.");
    }

  } catch (error) {
    console.error("❌ Error crítico durante la ejecución:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Desconectado.");
  }
}

// Ejecutar
updateBingoCardSets(EXCEL_FILENAME);
