// completeSimulateDraw.mjs
import mongoose from "mongoose";
import dotenv from "dotenv";
import BingoCard from "../src/models/bingoCard.model.js";
import Edition from "../src/models/edition.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function simularSorteosConAnalisis({ editionId, setNumber = 1, cantidadDeSimulaciones = 1000 }) {
  await mongoose.connect(MONGODB_URI);
  
  // 1. Cargar metadatos
  const edition = await Edition.findById(editionId);
  if (!edition) {
    console.error("❌ Edición no encontrada");
    await mongoose.disconnect();
    return;
  }

  const TOTAL_NUMEROS = edition.totalBalls || 70;
  console.log(`🔄 Simulación DETALLADA para Edición: ${edition.name}`);
  console.log(`🎯 Configuración: ${TOTAL_NUMEROS} bolillas, Juego (Set) #${setNumber}`);

  // 2. Cadenar cartones y extraer números
  const rawCards = await BingoCard.find({ edition: editionId }, "_id cardSets number");
  const cartones = rawCards.map(c => {
    const selectedSet = c.cardSets.find(s => s.setNumber === setNumber);
    return {
      _id: c._id,
      number: c.number,
      numbers: selectedSet ? selectedSet.numbers : []
    };
  }).filter(c => c.numbers.length > 0);

  if (cartones.length === 0) {
    console.error("❌ No se encontraron números para el Set seleccionado.");
    await mongoose.disconnect();
    return;
  }

  console.log(`🎫 Total de cartones cargados: ${cartones.length}`);

  // --- Análisis Estructural ---
  const frecuenciaNumeros = Array(TOTAL_NUMEROS + 1).fill(0);
  for (const carton of cartones) {
    for (const numero of carton.numbers) {
      if (numero <= TOTAL_NUMEROS) frecuenciaNumeros[numero]++;
    }
  }

  // Desvío Estándar
  const apariciones = frecuenciaNumeros.slice(1);
  const media = apariciones.reduce((a, b) => a + b, 0) / apariciones.length;
  const desvio = Math.sqrt(apariciones.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / apariciones.length);
  console.log(`📏 Desvío estándar en aparición: ${desvio.toFixed(2)} (Cerca de 0 = Balance Perfecto)`);

  // Sumas y Duplicados
  const sumas = cartones.map(c => c.numbers.reduce((a, b) => a + b, 0));
  const setUnicos = new Set();
  let duplicados = 0;
  cartones.forEach((carton) => {
    const clave = carton.numbers.slice().sort((a, b) => a - b).join("-");
    if (setUnicos.has(clave)) duplicados++;
    else setUnicos.add(clave);
  });
  console.log(`🧾 Cartones duplicados: ${duplicados}`);

  // --- Heatmap de decenas (dinámico) ---
  console.log("\n📦 Heatmap por Decenas:");
  const numDecenas = Math.ceil(TOTAL_NUMEROS / 10);
  const heatmap = Array(numDecenas).fill(0);
  apariciones.forEach((count, i) => {
    const idx = Math.floor(i / 10);
    heatmap[idx] += count;
  });
  heatmap.forEach((total, i) => {
    const start = i * 10 + 1;
    const end = Math.min((i + 1) * 10, TOTAL_NUMEROS);
    console.log(`   [${start.toString().padStart(2, "0")}-${end.toString().padStart(2, "0")}]: ${total} bolillas`);
  });

  // --- Simulación de Sorteos ---
  let totalBolillas = 0;
  let minBolillas = Infinity;
  let maxBolillas = 0;
  const ganadoresPorCantidad = new Map();

  for (let i = 0; i < cantidadDeSimulaciones; i++) {
    const bolillero = Array.from({ length: TOTAL_NUMEROS }, (_, i) => i + 1)
                           .sort(() => Math.random() - 0.5);

    const numerosSorteados = new Set();
    let ballCount = 0;
    let winners = [];

    for (let numero of bolillero) {
      numerosSorteados.add(numero);
      ballCount++;
      winners = cartones.filter(c => c.numbers.every(num => numerosSorteados.has(num)));
      if (winners.length > 0) break;
    }

    totalBolillas += ballCount;
    minBolillas = Math.min(minBolillas, ballCount);
    maxBolillas = Math.max(maxBolillas, ballCount);
    ganadoresPorCantidad.set(winners.length, (ganadoresPorCantidad.get(winners.length) || 0) + 1);
  }

  console.log("\n📊 RESULTADOS DE " + cantidadDeSimulaciones + " SORTEOS:");
  console.log(`🎯 Promedio de bolillas: ${(totalBolillas / cantidadDeSimulaciones).toFixed(2)}`);
  console.log(`📉 Rango: [${minBolillas} - ${maxBolillas}]`);
  
  console.log("\n🏆 Frecuencia de Empates:");
  [...ganadoresPorCantidad.entries()]
    .sort((a, b) => a[0] - b[0])
    .forEach(([cant, veces]) => {
      console.log(`   - ${cant} ganador(es) a la vez: ${veces} sorteos`);
    });

  await mongoose.disconnect();
}

const CONFIG = {
  editionId: "681f5787e335bd326e9f6793",
  setNumber: 1,
  simulations: 1000
};

simularSorteosConAnalisis(CONFIG);

