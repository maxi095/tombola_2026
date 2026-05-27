/**
 * Convierte un número en su representación en letras en español.
 * Diseñado especialmente para rendiciones contables (ej. Lotería de Córdoba).
 */

const UNIDADES = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
const DECENAS = [
  "",
  "DIEZ",
  "VEINTE",
  "TREINTA",
  "CUARENTA",
  "CINCUENTA",
  "SESENTA",
  "SETENTA",
  "OCHENTA",
  "NOVENTA",
];
const CENTENAS = [
  "",
  "CIEN",
  "DOSCIENTOS",
  "TRESCIENTOS",
  "CUATROCIENTOS",
  "QUINIENTOS",
  "SEISCIENTOS",
  "SETECIENTOS",
  "OCHOCIENTOS",
  "NOVECIENTOS",
];

function convertirGrupo(n) {
  let output = "";
  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;

  // Centenas
  if (c > 0) {
    if (c === 1 && (d > 0 || u > 0)) {
      output += "CIENTO ";
    } else {
      output += CENTENAS[c] + " ";
    }
  }

  // Decenas e unidades
  if (d > 0) {
    if (d === 1) {
      const especial = [
        "DIEZ",
        "ONCE",
        "DOCE",
        "TRECE",
        "CATORCE",
        "QUINCE",
        "DIECISEIS",
        "DIECISIETE",
        "DIECIOCHO",
        "DIECINUEVE",
      ];
      output += especial[u] + " ";
      return output.trim();
    } else if (d === 2) {
      if (u === 0) {
        output += "VEINTE ";
      } else {
        output += "VEINTI" + UNIDADES[u] + " ";
      }
      return output.trim();
    } else {
      output += DECENAS[d];
      if (u > 0) {
        output += " Y " + UNIDADES[u] + " ";
      } else {
        output += " ";
      }
    }
  } else if (u > 0) {
    output += UNIDADES[u] + " ";
  }

  return output.trim();
}

/**
 * Convierte un número decimal en letras.
 * @param {number} num - El número a convertir.
 * @param {boolean} includeCents - Si es true, añade centavos en formato "con XX/100".
 * @returns {string} - Ej: "DOS MILLONES NOVECIENTOS SETENTA MIL"
 */
export function numberToWords(num, includeCents = true) {
  const absolute = Math.abs(num);
  const integerPart = Math.floor(absolute);
  const decimalPart = Math.round((absolute - integerPart) * 100);

  if (integerPart === 0) {
    let result = "CERO";
    if (includeCents && decimalPart > 0) {
      result += ` CON ${decimalPart}/100`;
    }
    return result;
  }

  let temp = integerPart;
  const grupos = [];

  while (temp > 0) {
    grupos.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  let words = "";

  for (let i = 0; i < grupos.length; i++) {
    const g = grupos[i];
    if (g === 0) continue;

    let gTxt = convertirGrupo(g);

    if (i === 1) {
      // Miles
      if (g === 1) {
        words = "MIL " + words;
      } else {
        words = gTxt + " MIL " + words;
      }
    } else if (i === 2) {
      // Millones
      if (g === 1) {
        words = "UN MILLON " + words;
      } else {
        words = gTxt + " MILLONES " + words;
      }
    } else {
      words = gTxt + " " + words;
    }
  }

  words = words.trim();

  // Si termina exactamente en MILLON o MILLONES y hay valor, se suele agregar "DE" antes de la moneda,
  // pero como aquí devolvemos solo el número en letras, lo dejamos limpio o añadimos "DE" si es necesario.
  // Ejemplo: "DOS MILLONES" -> "DOS MILLONES DE" si le sigue una moneda.
  // Lo manejamos en la capa superior o aquí. Dejamos el número limpio.

  if (includeCents) {
    if (decimalPart > 0) {
      const centTxt = String(decimalPart).padStart(2, "0");
      words += ` CON ${centTxt}/100`;
    } else {
      words += " CON 00/100";
    }
  }

  return words.trim();
}

/**
 * Formatea un número en letras adaptado al estilo oficial de Lotería:
 * "(Pesos [Letras].-)"
 * @param {number} num - El importe.
 * @param {boolean} includeCents - Si es true, añade "con XX/100".
 * @returns {string} - Ej: "(Pesos Ciento noventa y cuatro mil doscientos noventa y siete con 40/100.-)"
 */
export function formatLoteríaLetras(num, includeCents = true) {
  const rawWords = numberToWords(num, includeCents);
  
  // Convertir a minúsculas y capitalizar solo la primera letra
  let formatted = rawWords.toLowerCase();
  
  // Capitalizar primera letra de cada frase o solo la primera general
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  
  // Si tiene "con", mantener minúscula
  // Corregir "Un millón" / "Un mil"
  formatted = formatted.replace("un millon", "un millón");
  
  // Quitar el "CON" si includeCents es true, pero darle el formato "con XX/100" en minúsculas
  formatted = formatted.replace(" con ", " con ");
  
  return `(Pesos ${formatted}.-)`;
}
