/**
 * Elimina todos los caracteres no numÃ©ricos de un string.
 * @param {string|number} value - El valor a limpiar.
 * @returns {string} - Solo los dÃgitos: "20.123.456" -> "20123456"
 */
export const stripNonDigits = (value) => {
  const str = String(value || '');
  return str.replace(/\D/g, '');
};

/**
 * Limpia la entrada de moneda permitiendo decimales (estÃ¡ndar es-AR).
 * Trata el punto como miles y la coma como decimal. Para UX, permite el punto como decimal
 * sÃ³lo si es el Ãºltimo separador ingresado.
 * @param {string|number} value - La entrada del usuario.
 * @returns {string} - Valor normalizado ej: "1234.55"
 */
export const cleanCurrencyInput = (value) => {
  if (!value) return '';
  let str = String(value).replace(/[$\s]/g, '');
  
  // NormalizaciÃ³n de separadores: Tratamos coma y punto como candidatos a decimal
  // Si hay coma, la coma es la reina decimal (es-AR)
  if (str.includes(',')) {
    str = str.replace(/\./g, ''); // Todos los puntos son miles, mueren.
    str = str.replace(',', '.'); // Coma a punto decimal.
  } else if (str.includes('.')) {
    // SÃ³lo hay puntos. ¿Son miles o es decimal del teclado numÃ©rico?
    const lastPointIndex = str.lastIndexOf('.');
    const pointCount = (str.match(/\./g) || []).length;
    
    // Si sÃ³lo hay un punto y estÃ¡ "cerca" del final (0, 1 o 2 dÃgitos) es decimal
    // O si hay varios puntos, pero el Ãºltimo estÃ¡ al final (ej: 1.234.)
    const distFromEnd = str.length - 1 - lastPointIndex;
    
    if (distFromEnd <= 2) {
      // El Ãºltimo punto se comporta como decimal
      const integerPartRaw = str.slice(0, lastPointIndex).replace(/\./g, '');
      const decimalPartRaw = str.slice(lastPointIndex + 1).replace(/\D/g, '');
      str = `${integerPartRaw}.${decimalPartRaw}`;
    } else {
      // Todos los puntos son miles
      str = str.replace(/\./g, '');
    }
  }
  
  const parts = str.split('.');
  const integerPart = parts[0].replace(/\D/g, '');
  const decimalPart = parts.length > 1 ? parts[1].replace(/\D/g, '').slice(0, 2) : null;
  
  return decimalPart !== null ? `${integerPart}.${decimalPart}` : integerPart;
};

/**
 * Formatea un string normalizado para visualizaciÃ³n durante la ediciÃ³n (Live Format).
 * @param {string|number} value - El valor normalizado "1234.55"
 * @returns {string} - El valor formateado ej: "1.234,55"
 */
export const formatCurrencyInput = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const strValue = String(value);
  const [integerPart, decimalPart] = strValue.split('.');
  
  if (!integerPart && decimalPart !== undefined) return `0,${decimalPart}`;
  
  // Usamos NumberFormat sÃ³lo para la parte entera (los miles)
  const formattedInteger = integerPart 
    ? new Intl.NumberFormat('es-AR').format(parseInt(integerPart, 10)) 
    : '0';
  
  // El decimalPart se muestra tal como el usuario lo escribe para no interrumpir el flujo
  return decimalPart !== null && decimalPart !== undefined ? `${formattedInteger},${decimalPart}` : formattedInteger;
};

/**
 * Formatea un nÃºmero como moneda (Pesos Argentinos por defecto) para visualizaciÃ³n final.
 * @param {number|string} amount - El monto a formatear.
 * @returns {string} - El monto formateado: "$ 1.234,56"
 */
export const formatCurrency = (amount) => {
  const value = parseFloat(amount) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formatea un nÃºmero con separadores de miles (ideal para DNI o cantidades).
 * Soporta formateo dinÃ¡mico en vivo (no agrega "â€”" si estÃ¡ vacÃo).
 * @param {number|string} number - El nÃºmero a formatear.
 * @returns {string} - El nÃºmero formateado: "20.123.456"
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null || number === '') return '';
  const cleanValue = stripNonDigits(number);
  if (!cleanValue) return '';
  const value = parseFloat(cleanValue);
  return new Intl.NumberFormat('es-AR').format(value);
};

/**
 * AbrevaciÃ³n de formatNumber para documentos (DNI).
 * @param {number|string} dni - El documento a formatear.
 * @returns {string} - El DNI formateado.
 */
export const formatDocument = (dni) => formatNumber(dni);
