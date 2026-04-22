import * as XLSX from "xlsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/**
 * exportToExcel - Generador de Hojas de Cálculo Premium 2026
 * Transforma datos JSON filtrados en un archivo Excel institucional.
 * 
 * @param {Array} data - El array de objetos a exportar.
 * @param {string} fileName - Nombre del archivo final (sin extensión).
 * @param {Object} columnMap - Mapeo de columnas { técnica: humana } (Ej: { username: "Nombre de Usuario" })
 */
export const exportToExcel = (data, fileName, columnMap = null) => {
  if (!data || data.length === 0) return;

  // 1. Transformar datos según el mapeo de columnas (Humanizar nombres)
  const transformedData = data.map(item => {
    if (!columnMap) return item;
    
    const newItem = {};
    Object.keys(columnMap).forEach(key => {
      // Soporte para niveles anidados simples (ej: 'person.firstName')
      const keys = key.split('.');
      let val = item;
      keys.forEach(k => { val = val?.[k]; });
      newItem[columnMap[key]] = val || "N/A";
    });
    return newItem;
  });

  // 2. Crear Libro y Hoja (SheetJS)
  const worksheet = XLSX.utils.json_to_sheet(transformedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

  // 3. Estética de Columnas (Auto-ancho aproximado)
  const maxChars = transformedData.reduce((prev, curr) => {
    Object.keys(curr).forEach((key, index) => {
      const valLen = String(curr[key]).length;
      prev[index] = Math.max(prev[index] || 0, valLen, key.length);
    });
    return prev;
  }, []);

  worksheet["!cols"] = maxChars.map(w => ({ wch: w + 2 }));

  // 4. Generar Archivo
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * exportBalanceAuditReport - Reporte Contable Avanzado Tombola 2026 🔱
 * Construye un Excel por bloques (Ingresos / Egresos) con totales y formato moneda.
 */
export const exportBalanceAuditReport = (data, fileName) => {
  if (!data || data.length === 0) return;

  // 1. Clasificación y Ordenamiento Táctico 📊
  const ingresos = data
    .filter(b => b.type === "Ingreso" && b.status === "Activo")
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const egresos = data
    .filter(b => b.type === "Egreso" && b.status === "Activo")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalIngreso = ingresos.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const totalEgreso = egresos.reduce((s, b) => s + (b.totalAmount || 0), 0);

  // 2. Construcción de la matriz de filas (Array of Arrays) 🏗️
  const rows = [
    ["FECHA", "DETALLES", "EGRESOS", "INGRESOS", "SALDO"] // Encabezado Contable
  ];

  // Bloque: INGRESOS
  ingresos.forEach(b => {
    rows.push([
      dayjs.utc(b.date).format("DD-MM-YY"),
      `${b.counterpart || 'N/A'} - ${b.concept || 'N/A'}`,
      0,
      b.totalAmount || 0,
      null
    ]);
  });

  // Fila Total Ingresos
  rows.push(["", "TOTAL INGRESOS", null, totalIngreso, null]);
  rows.push([]); // Salto de línea estético

  // Bloque: EGRESOS
  egresos.forEach(b => {
    rows.push([
      dayjs.utc(b.date).format("DD-MM-YY"),
      `${b.counterpart || 'N/A'} - ${b.concept || 'N/A'}`,
      b.totalAmount || 0,
      0,
      null
    ]);
  });

  // Fila Total Egresos
  rows.push(["", "TOTAL EGRESOS", totalEgreso, null, null]);
  rows.push([]); // Salto de línea estético

  // Fila Balance Final General
  rows.push(["", "BALANCE GENERAL (Ingresos, Egresos, Saldo)", totalEgreso, totalIngreso, totalIngreso - totalEgreso]);

  // 3. Creación de hoja y aplicación de formatos financieros 💸
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  
  // Establecer formato de moneda para las columnas financieras (C, D y E)
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = 2; C <= 4; ++C) { // Columnas C (2), D (3), E (4)
      const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
      if (!worksheet[cell_ref]) continue;
      
      // Si el valor es número, forzamos formato moneda nativo de Excel
      if (typeof worksheet[cell_ref].v === 'number') {
        worksheet[cell_ref].t = 'n';
        worksheet[cell_ref].z = '"$" #,##0.00';
      }
    }
  }

  // 4. Salida institucional
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoría Balance");
  
  // Ajuste de ancho de columnas
  worksheet["!cols"] = [
    { wch: 12 }, // Fecha
    { wch: 45 }, // Detalles
    { wch: 15 }, // Egresos
    { wch: 15 }, // Ingresos
    { wch: 15 }  // Saldo
  ];

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
