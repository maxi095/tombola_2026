// manualDraw.mjs
import mongoose from "mongoose";
import dotenv from "dotenv";
import BingoCard from "../src/models/bingoCard.model.js";
import Edition from "../src/models/edition.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function simularSorteosConAnalisis({ editionId, setNumber = 1, cantidadDeSimulaciones = 1000 }) {
  await mongoose.connect(MONGODB_URI);

  // 1. Cargar metadatos de la edición
  const edition = await Edition.findById(editionId);
  if (!edition) {
    console.error("❌ Edición no encontrada");
    await mongoose.disconnect();
    return;
  }

  const TOTAL_NUMEROS = edition.totalBalls || 70;
  console.log(`🔄 Iniciando simulación para Edición: ${edition.name}`);
  console.log(`🎯 Configuración: ${TOTAL_NUMEROS} bolillas, Juego (Set) #${setNumber}`);

  // 2. Cargar cartones y extraer los números del Set específico
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

  // --- Análisis de coincidencias entre cartones ---
  const coincidenciasEntreCartones = new Map();
  // Limitamos análisis de pares si hay demasiados cartones para evitar lag
  const analysisLimit = Math.min(cartones.length, 1001);

  for (let i = 0; i < analysisLimit; i++) {
    for (let j = i + 1; j < analysisLimit; j++) {
      const setB = new Set(cartones[j].numbers);
      const interseccion = cartones[i].numbers.filter(num => setB.has(num));
      const key = `${cartones[i].number}-${cartones[j].number}`;
      coincidenciasEntreCartones.set(key, interseccion.length);
    }
  }

  // --- Análisis de frecuencia de aparición de números ---
  const frecuenciaNumeros = Array(TOTAL_NUMEROS + 1).fill(0);
  for (const carton of cartones) {
    for (const numero of carton.numbers) {
      if (numero <= TOTAL_NUMEROS) frecuenciaNumeros[numero]++;
    }
  }

  // --- Rango por zonas (Dividido en 3 tercios dinámicos) ---
  const tercio = Math.floor(TOTAL_NUMEROS / 3);
  const zonaCount = { zona1: 0, zona2: 0, zona3: 0 };
  for (const carton of cartones) {
    for (const num of carton.numbers) {
      if (num <= tercio) zonaCount.zona1++;
      else if (num <= tercio * 2) zonaCount.zona2++;
      else zonaCount.zona3++;
    }
  }

  // --- Simulación de sorteos ---
  let sinGanador = 0;
  let totalBolillas = 0;
  let minBolillas = Infinity;
  let maxBolillas = 0;

  const ganadoresPorCarton = new Map();
  const ganadoresPorCantidad = new Map();
  const idToNumber = new Map();

  cartones.forEach(carton => {
    idToNumber.set(carton._id.toString(), carton.number);
  });

  for (let i = 0; i < cantidadDeSimulaciones; i++) {
    const bolillero = Array.from({ length: TOTAL_NUMEROS }, (_, i) => i + 1);
    for (let j = bolillero.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [bolillero[j], bolillero[k]] = [bolillero[k], bolillero[j]];
    }

    const numerosSorteados = new Set();
    let cantidadBolillasExtraidas = 0;
    let ganadores = [];

    for (let numero of bolillero) {
      numerosSorteados.add(numero);
      cantidadBolillasExtraidas++;

      // Optimizamos búsqueda de ganadores
      ganadores = cartones.filter(carton =>
        carton.numbers.every(num => numerosSorteados.has(num))
      );
      if (ganadores.length > 0) break;
    }

    if (ganadores.length === 0) {
      sinGanador++;
    } else {
      totalBolillas += cantidadBolillasExtraidas;
      minBolillas = Math.min(minBolillas, cantidadBolillasExtraidas);
      maxBolillas = Math.max(maxBolillas, cantidadBolillasExtraidas);

      const numerosGanadores = ganadores.map(c => idToNumber.get(c._id.toString()));
      numerosGanadores.forEach(nro => {
        ganadoresPorCarton.set(nro, (ganadoresPorCarton.get(nro) || 0) + 1);
      });

      ganadoresPorCantidad.set(
        ganadores.length,
        (ganadoresPorCantidad.get(ganadores.length) || 0) + 1
      );
    }
  }

  const conGanador = cantidadDeSimulaciones - sinGanador;
  const promedioBolillas = conGanador > 0 ? (totalBolillas / conGanador).toFixed(2) : 0;

  const topCartones = [...ganadoresPorCarton.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  // --- Mostrar análisis ---
  console.log("\n📊 ANÁLISIS DE ESTRUCTURA (JUEGO #" + setNumber + ")");
  console.log(`📌 Frecuencia por bolilla (debería ser balanceada):`);
  frecuenciaNumeros
    .map((count, num) => ({ num, count }))
    .slice(1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 para no saturar consola
    .forEach(({ num, count }) => {
      console.log(`🎲 Nº ${num.toString().padStart(2, "0")}: aparece en ${count} cartones`);
    });

  console.log("\n🔍 Coincidencias entre pares (TOP 10):");
  [...coincidenciasEntreCartones.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([pair, count]) => {
      console.log(`🔗 Cartones ${pair} → ${count} números compartidos`);
    });

  console.log("\n📊 RESULTADOS DE LA SIMULACIÓN");
  console.log(`🎯 Promedio de bolillas para ganar: ${promedioBolillas}`);
  console.log(`📉 Mínimo: ${minBolillas} | 📈 Máximo: ${maxBolillas}`);

  console.log("\n📈 Empates en el 1er Puesto:");
  [...ganadoresPorCantidad.entries()]
    .sort((a, b) => a[0] - b[0])
    .forEach(([cantidad, veces]) => {
      console.log(`🧩 ${cantidad} ganador(es) simultáneos: ${veces} sorteos`);
    });

  await mongoose.disconnect();
}

// Configuración de la prueba: ID de Edición y número de Juego (1-5)
const CONFIG = {
  editionId: "69dd418c67e9e381323c3802", // Reemplazar por tu ID de edición real
  setNumber: 1,
  sims: 1000
};

simularSorteosConAnalisis({
  editionId: CONFIG.editionId,
  setNumber: CONFIG.setNumber,
  cantidadDeSimulaciones: CONFIG.sims
});

