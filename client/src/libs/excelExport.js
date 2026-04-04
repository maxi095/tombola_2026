import * as XLSX from "xlsx";

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
