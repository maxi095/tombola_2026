import xlsx from "xlsx";

/**
 * VALIDATE BINGO PATTERN
 * Verifica cuántas veces un conjunto de cartones cumple con el patrón 1+4
 * realizando una simulación de 10,000 sorteos.
 */

const CONFIG = {
    MAX_BALL: 70,
    TARGET_SECOND_PLACE_WINNERS: 4,
    VALIDATION_TRIALS: 10000
};

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function validateFile(filename) {
    console.log(`🔍 Validando archivo: ${filename}...`);
    const workbook = xlsx.readFile(filename);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    
    // Convertir filas a arreglos de números
    const cards = rows.map(row => {
        const nums = [];
        for (let i = 1; i <= 20; i++) {
            if (row[`N${i}`]) nums.push(row[`N${i}`]);
        }
        return nums;
    });

    console.log(`📊 Total de cartones cargados: ${cards.length}`);

    let perfectGames = 0;
    let tieAtFirstCount = 0;
    let exactlyFourAtSecond = 0;

    const balls = Array.from({ length: CONFIG.MAX_BALL }, (_, i) => i + 1);

    for (let t = 0; t < CONFIG.VALIDATION_TRIALS; t++) {
        shuffle(balls);
        const ballPos = new Array(CONFIG.MAX_BALL + 1);
        balls.forEach((b, i) => ballPos[b] = i);

        const finishTimes = cards.map(card => 
            Math.max(...card.map(n => ballPos[n]))
        );

        const min1 = Math.min(...finishTimes);
        const winners1 = finishTimes.filter(ti => ti === min1).length;
        
        const timesWithoutFirst = finishTimes.filter(ti => ti !== min1);
        const min2 = Math.min(...timesWithoutFirst);
        const winners2 = timesWithoutFirst.filter(ti => ti === min2).length;

        if (winners1 === 1) {
            if (winners2 === CONFIG.TARGET_SECOND_PLACE_WINNERS) {
                perfectGames++;
            }
            exactlyFourAtSecond += (winners2 === CONFIG.TARGET_SECOND_PLACE_WINNERS ? 1 : 0);
        } else {
            tieAtFirstCount++;
        }
    }

    console.log("--------------------------------------------------");
    console.log(`✅ RESULTADOS DE VALIDACIÓN (Sobre ${CONFIG.VALIDATION_TRIALS} sorteos):`);
    console.log(`- Juegos Perfectos (1 único, luego 4): ${(perfectGames/CONFIG.VALIDATION_TRIALS*100).toFixed(2)}%`);
    console.log(`- Probabilidad Ganador Único (1°): ${((CONFIG.VALIDATION_TRIALS - tieAtFirstCount)/CONFIG.VALIDATION_TRIALS*100).toFixed(2)}%`);
    console.log(`- Probabilidad Exacto 4 en 2° (si el 1° es único): ${(perfectGames/(CONFIG.VALIDATION_TRIALS - tieAtFirstCount)*100).toFixed(2)}%`);
    console.log("--------------------------------------------------");
    
    if (perfectGames/CONFIG.VALIDATION_TRIALS > 0.9) {
        console.log("🌟 EL SET CUMPLE CON LOS REQUISITOS DE ALTA CALIDAD.");
    } else {
        console.log("⚠️ El set necesita más optimización.");
    }
}

// Ejecutar con el archivo generado (asegúrate de que exista)
const targetFile = process.argv[2] || "Cartones_Generados_1plus4.xlsx";
validateFile(targetFile);
