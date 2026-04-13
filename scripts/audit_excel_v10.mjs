import xlsx from "xlsx";
import path from "path";

/**
 * AUDITOR DE EXCEL V10
 * 
 * Este script lee el archivo Excel generado por el motor V10
 * y ejecuta la simulación de sorteos completa para validar el patrón 1+4.
 */

const EXCEL_PATH = "Bingo_PRO_V10_1001.xlsx";
const MAX_BALL = 70;
const SIMULATIONS = 10000;

function runExcelAudit() {
    console.log(`\n==================================================`);
    console.log(`🧐 AUDITANDO ARCHIVO: ${EXCEL_PATH}`);
    console.log(`==================================================`);

    // 1. Leer Excel
    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`🎫 Total de cartones detectados en Excel: ${data.length}`);

    // 2. Extraer sets de números
    // Los números están en columnas N1, N2... N20
    const cardPool = data.map(row => {
        const numbers = [];
        for (let i = 1; i <= 20; i++) {
            numbers.push(row[`N${i}`]);
        }
        return numbers;
    });

    const balls = Array.from({ length: MAX_BALL }, (_, i) => i + 1);
    
    let results = {
        uniqueWinnersFirst: 0,
        perfectPattern: 0,
        totalBalls: 0
    };

    let secondPlaceWinnersDist = new Map();

    console.log(`🧪 Ejecutando ${SIMULATIONS} simulaciones de sorteo...`);

    for (let t = 0; t < SIMULATIONS; t++) {
        // Shuffle balls
        for (let i = balls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [balls[i], balls[j]] = [balls[j], balls[i]];
        }

        const ballPos = new Array(MAX_BALL + 1);
        balls.forEach((b, i) => ballPos[b] = i);

        // Tiempos de finalización para cada cartón
        const finishTimes = cardPool.map(set => Math.max(...set.map(n => ballPos[n])));
        
        const min1 = Math.min(...finishTimes);
        const winners1 = finishTimes.filter(ti => ti === min1).length;
        
        results.totalBalls += min1 + 1;

        if (winners1 === 1) {
            results.uniqueWinnersFirst++;
            
            // Analizar segundo lugar
            const timesWithoutFirst = finishTimes.filter(ti => ti !== min1);
            const min2 = Math.min(...timesWithoutFirst);
            const winners2 = timesWithoutFirst.filter(ti => ti === min2).length;
            
            secondPlaceWinnersDist.set(winners2, (secondPlaceWinnersDist.get(winners2) || 0) + 1);
            
            if (winners2 === 4) {
                results.perfectPattern++;
            }
        }
    }

    console.log(`\n📊 RESULTADOS DE LA AUDITORÍA:`);
    console.log(`   - Bolillas promedio para ganar: ${(results.totalBalls / SIMULATIONS).toFixed(2)}`);
    console.log(`   - Probabilidad Ganador Único (1°): ${(results.uniqueWinnersFirst / SIMULATIONS * 100).toFixed(2)}%`);
    console.log(`   - Probabilidad Patrón 1+4 (Perfecto): ${(results.perfectPattern / SIMULATIONS * 100).toFixed(2)}%`);
    
    if (results.uniqueWinnersFirst > 0) {
        console.log(`   - Distribución del 2° lugar (Top cases):`);
        const sorted = [...secondPlaceWinnersDist.entries()].sort((a,b) => b[1] - a[1]).slice(0, 3);
        sorted.forEach(([count, freq]) => {
            console.log(`      * ${count} ganadores simultáneos: ${(freq / results.uniqueWinnersFirst * 100).toFixed(2)}%`);
        });
    }

    console.log(`\n✅ Auditoría finalizada.`);
}

try {
    runExcelAudit();
} catch (error) {
    if (error.code === 'EBUSY') {
        console.error("❌ ERROR: El archivo Excel está abierto en otro programa. Ciérralo y vuelve a intentarlo.");
    } else {
        console.error("❌ Error durante la auditoría:", error);
    }
}
