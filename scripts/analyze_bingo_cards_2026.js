import mongoose from "mongoose";
import "dotenv/config.js";

// Importar modelos
import BingoCard from "../src/models/bingoCard.model.js";
import Edition from "../src/models/edition.model.js";

// Configuración
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";
const EDITION_NAME = "2026";

async function analyzeBingoCards() {
    try {
        console.log("--------------------------------------------------");
        console.log(`🔍 Iniciando análisis para la edición: "${EDITION_NAME}"`);
        console.log("--------------------------------------------------");

        await mongoose.connect(MONGODB_URI);
        console.log("🟢 Conectado a MongoDB");

        // 1. Encontrar la edición
        const edition = await Edition.findOne({ name: EDITION_NAME });
        if (!edition) {
            console.error(`❌ No se encontró la edición con nombre "${EDITION_NAME}"`);
            return;
        }
        console.log(`✅ Edición encontrada. ID: ${edition._id}`);

        // 2. Obtener todos los cartones de esa edición
        const bingoCards = await BingoCard.find({ edition: edition._id });
        console.log(`📊 Total de cartones (BingoCards) encontrados: ${bingoCards.length}`);

        if (bingoCards.length === 0) {
            console.log("⚠️ No hay cartones para analizar.");
            return;
        }

        // Estructuras para auditoría
        const internalDuplicates = []; // Cartones con números repetidos dentro de un set
        const globalSetMap = new Map(); // Para detectar sets idénticos en toda la edición
        
        let totalSetsAnalyzed = 0;

        bingoCards.forEach(card => {
            const cardNumber = card.number || "Sin número";
            
            if (!card.cardSets || card.cardSets.length === 0) {
                return;
            }

            card.cardSets.forEach(set => {
                totalSetsAnalyzed++;
                const { setNumber, numbers } = set;

                if (!numbers || numbers.length === 0) return;

                // --- AUDITORÍA 1: Números repetidos dentro del mismo set ---
                const uniqueNumbers = new Set(numbers);
                if (uniqueNumbers.size !== numbers.length) {
                    const seen = new Set();
                    const dups = numbers.filter(n => {
                        if (seen.has(n)) return true;
                        seen.add(n);
                        return false;
                    });
                    
                    internalDuplicates.push({
                        cardNumber,
                        setNumber,
                        repeatedNumbers: [...new Set(dups)]
                    });
                }

                // --- AUDITORÍA 2: Sets idénticos en toda la edición ---
                const sortedSignature = [...numbers].sort((a, b) => a - b).join(",");
                
                if (!globalSetMap.has(sortedSignature)) {
                    globalSetMap.set(sortedSignature, []);
                }
                globalSetMap.get(sortedSignature).push({
                    cardNumber,
                    setNumber
                });
            });
        });

        console.log(`✅ Análisis completado (${totalSetsAnalyzed} sets individuales procesados).`);
        console.log("--------------------------------------------------");

        // --- RESULTADOS AUDITORÍA 1 ---
        console.log("\n🚩 RESULTADO AUDITORÍA 1: Números repetidos dentro de un mismo set");
        if (internalDuplicates.length === 0) {
            console.log("✅ Todo correcto. Ningún set tiene números internos repetidos.");
        } else {
            console.log(`❌ SE ENCONTRARON ${internalDuplicates.length} ANOMALÍAS:`);
            internalDuplicates.forEach(dup => {
                console.log(`   - Cartón #${dup.cardNumber}, Sorteo #${dup.setNumber}: Números duplicados -> [${dup.repeatedNumbers.join(", ")}]`);
            });
        }

        // --- RESULTADOS AUDITORÍA 2 ---
        console.log("\n🚩 RESULTADO AUDITORÍA 2: Sets idénticos en diferentes cartones");
        const globalDuplicates = Array.from(globalSetMap.entries()).filter(([sig, occurrences]) => occurrences.length > 1);

        if (globalDuplicates.length === 0) {
            console.log("✅ Todo correcto. No existen sets idénticos en toda la edición.");
        } else {
            console.log(`❌ SE ENCONTRARON ${globalDuplicates.length} COMBINACIONES DUPLICADAS:`);
            globalDuplicates.forEach(([sig, occurrences], index) => {
                console.log(`   ${index + 1}. Combinación: [${sig}]`);
                occurrences.forEach(occ => {
                    console.log(`      - Se encuentra en: Cartón #${occ.cardNumber}, Sorteo #${occ.setNumber}`);
                });
            });
        }

        console.log("\n--------------------------------------------------");

    } catch (error) {
        console.error("❌ Error durante el análisis:", error);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Desconectado de la DB.");
    }
}

analyzeBingoCards();
