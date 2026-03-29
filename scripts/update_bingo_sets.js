import mongoose from "mongoose";
import xlsx from "xlsx";
import "dotenv/config.js";

// Importamos el modelo con el esquema que me pasaste
import BingoCard from "../src/models/bingoCard.model.js";

// --- CONFIGURACIÓN ---
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

// ⚠️ IMPORTANTE: Verifica que este ID coincida con la edición de los cartones que ya cargaste previamente
const currentEditionId = "681f5787e335bd326e9f6793"; 
const EXCEL_FILENAME = "Cartones_2025.xlsx"; // Nombre del archivo confirmado

async function updateBingoCardSets(filePath) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("🟢 Conectado a MongoDB");

    // Leer archivo Excel
    console.log(`📂 Leyendo archivo: ${filePath}...`);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`📊 Total de filas leídas: ${rows.length}. Iniciando agrupación...`);

    // 1. AGRUPAR FILAS POR CARTÓN
    // El objetivo es convertir las 5 filas del excel en 1 sola entrada para la DB
    // Map Key: Número de Cartón -> Map Value: Array de objetos { setNumber, numbers }
    const cardsMap = new Map();

    rows.forEach((row) => {
      const cartonNumber = row["CARTON"]; // Columna A
      const sorteoNumber = row["SORTEO"]; // Columna B

      // Validar datos mínimos
      if (!cartonNumber || !sorteoNumber) return;

      // Extraer números de N1 a N20
      const numbers = [];
      for (let i = 1; i <= 20; i++) {
        const key = `N${i}`; // Las columnas se llaman N1, N2... N20
        const val = parseInt(row[key], 10);
        if (!isNaN(val)) {
          numbers.push(val);
        }
      }

      // Si es la primera vez que procesamos este cartón, iniciamos su array
      if (!cardsMap.has(cartonNumber)) {
        cardsMap.set(cartonNumber, []);
      }

      // Agregamos el set actual al array del cartón
      cardsMap.get(cartonNumber).push({
        setNumber: sorteoNumber,
        numbers: numbers
      });
    });

    console.log(`📦 Se procesaron ${cardsMap.size} cartones únicos. Preparando actualización...`);

    // 2. PREPARAR OPERACIONES BULK (Masivas)
    const bulkOps = [];

    for (const [cartonNum, sets] of cardsMap.entries()) {
      // Ordenamos los sets del 1 al 5 para que queden prolijos en la base de datos
      sets.sort((a, b) => a.setNumber - b.setNumber);

      // Creamos la operación de actualización
      bulkOps.push({
        updateOne: {
          // Filtro: Buscamos el cartón por su número Y la edición correcta
          filter: { 
            number: cartonNum, 
            edition: currentEditionId 
          },
          // Actualización: Reemplazamos el array cardSets con los datos del Excel
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
        console.warn("⚠️ ALERTA: No se encontraron coincidencias. Verifica que el 'currentEditionId' sea correcto.");
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
updateBingoCardSets(`./${EXCEL_FILENAME}`);