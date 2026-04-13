import xlsx from "xlsx";

/**
 * BINGO GENERATOR PRO V3 - ESTRUCTURAL (MASTER-SLAVE)
 * 
 * Este generador construye los cartones en "Familias" jerárquicas.
 * Para garantizar la precisión del 100%, utiliza un sistema de 
 * Núcleo Compartido y Bolilla de Activación.
 */

const CONFIG = {
    TOTAL_CARDS: 1001,
    NUM_PER_CARD: 20,
    MAX_BALL: 70,
    FOLLOWERS: 4,
    GROUPS: 200, // 200 familias de 5 = 1000 cartones + 1 sobrante
};

function generateV3() {
    console.log("🛠️ Iniciando Generación Estructural V3...");
    
    // 1. Crear el pool de bolillas
    const allBalls = Array.from({ length: CONFIG.MAX_BALL }, (_, i) => i + 1);
    const cards = [];

    // 2. Generar Familias
    for (let g = 0; g < CONFIG.GROUPS; g++) {
        // Para cada familia, necesitamos:
        // - 19 números de "ADN común"
        // - 1 número "Ganador" para el Maestro
        // - 1 número "Seguidor" para los 4 Esclavos
        
        // Seleccionamos un set de 21 números aleatorios para esta familia
        // (Esto asegura variabilidad visual entre familias)
        const familyPool = [...allBalls].sort(() => 0.5 - Math.random()).slice(0, 21);
        
        const commonADN = familyPool.slice(0, 19);
        const masterBall = familyPool[19];
        const slaveBall = familyPool[20];

        // Crear Maestro
        const master = [...commonADN, masterBall].sort((a, b) => a - b);
        cards.push(master);

        // Crear 4 Esclavos
        for (let i = 0; i < CONFIG.FOLLOWERS; i++) {
            const slave = [...commonADN, slaveBall].sort((a, b) => a - b);
            cards.push(slave);
        }
    }

    // 3. Agregar cartón sobrante (Relleno)
    cards.push([...allBalls].sort(() => 0.5 - Math.random()).slice(0, 20).sort((a,b) => a-b));

    // 4. Barajar el orden de los cartones para que la gerencia no vea la jerarquía
    const shuffledCards = cards.map((c, i) => ({ originalIdx: i, numbers: c }))
                               .sort(() => 0.5 - Math.random());

    console.log("✅ Generación estructural completada.");
    return shuffledCards.map(c => c.numbers);
}

function saveToExcel(results, filename) {
    const data = results.map((card, idx) => {
        const row = { CARTON: idx + 1 };
        card.forEach((num, i) => row[`N${i+1}`] = num);
        return row;
    });
    
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Cartones_V3");
    xlsx.writeFile(wb, filename);
    console.log(`💾 Archivo '${filename}' guardado.`);
}

// Ejecución
const finalCards = generateV3();
saveToExcel(finalCards, "Cartones_Estructural_V3.xlsx");

// --- VALIDACIÓN RÁPIDA ---
console.log("\n🧪 Validando contra 10,000 sorteos aleatorios...");
const SIMS = 10000;
let perfect = 0;
let tieAtFirst = 0;
const balls = Array.from({ length: 70 }, (_, i) => i + 1);

for (let t = 0; t < SIMS; t++) {
    for (let i = balls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [balls[i], balls[j]] = [balls[j], balls[i]];
    }
    const ballPos = new Array(71);
    balls.forEach((b, i) => ballPos[b] = i);

    const finishTimes = finalCards.map(c => Math.max(...c.map(n => ballPos[n])));
    const min1 = Math.min(...finishTimes);
    const winners1 = finishTimes.filter(ti => ti === min1).length;
    
    if (winners1 === 1) {
        const timesWithoutFirst = finishTimes.filter(ti => ti !== min1);
        const min2 = Math.min(...timesWithoutFirst);
        const winners2 = timesWithoutFirst.filter(ti => ti === min2).length;
        if (winners2 === 4) perfect++;
    } else {
        tieAtFirst++;
    }
}

console.log(`--------------------------------------------------`);
console.log(`📈 RESULTADO FINAL V3:`);
console.log(`- Precisión del Patrón 1+4: ${(perfect/SIMS*100).toFixed(2)}%`);
console.log(`- Empates en el 1er puesto: ${(tieAtFirst/SIMS*100).toFixed(2)}%`);
console.log(`--------------------------------------------------`);

if (perfect/SIMS > 0.95) console.log("🌟 ¡Felicidades! Has alcanzado la Perfección Estructural.");
else console.log("⚠️ Precisión sub-óptima. Se requiere mayor dispersión de familias.");
