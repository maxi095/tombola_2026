import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/**
 * exportToExcel - Generador de Hojas de Cálculo Standard 2026
 * Carga SheetJS (xlsx) bajo demanda para no inflar el bundle inicial.
 */
export const exportToExcel = async (data, fileName, columnMap = null) => {
  if (!data || data.length === 0) return;

  const XLSX = await import("xlsx");

  const transformedData = data.map((item) => {
    if (!columnMap) return item;

    const newItem = {};
    Object.keys(columnMap).forEach((key) => {
      const keys = key.split(".");
      let val = item;
      keys.forEach((k) => {
        val = val?.[k];
      });
      newItem[columnMap[key]] = val || "N/A";
    });
    return newItem;
  });

  const worksheet = XLSX.utils.json_to_sheet(transformedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

  const maxChars = transformedData.reduce((prev, curr) => {
    Object.keys(curr).forEach((key, index) => {
      const valLen = String(curr[key]).length;
      prev[index] = Math.max(prev[index] || 0, valLen, key.length);
    });
    return prev;
  }, []);

  worksheet["!cols"] = maxChars.map((w) => ({ wch: w + 2 }));

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * exportBalanceAuditReport - Reporte Contable Avanzado Tombola 2026
 * Construye un Excel por bloques (Ingresos / Egresos) con carga dinámica de xlsx.
 */
export const exportBalanceAuditReport = async (data, fileName) => {
  if (!data || data.length === 0) return;

  const XLSX = await import("xlsx");

  const ingresos = data
    .filter((b) => b.type === "Ingreso" && b.status === "Activo")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const egresos = data
    .filter((b) => b.type === "Egreso" && b.status === "Activo")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalIngreso = ingresos.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const totalEgreso = egresos.reduce((s, b) => s + (b.totalAmount || 0), 0);

  const rows = [
    ["FECHA", "DETALLES", "EGRESOS", "INGRESOS", "SALDO"],
  ];

  ingresos.forEach((b) => {
    rows.push([
      dayjs.utc(b.date).format("DD-MM-YY"),
      `${b.counterpart || "N/A"} - ${b.concept || "N/A"}`,
      0,
      b.totalAmount || 0,
      null,
    ]);
  });

  rows.push(["", "TOTAL INGRESOS", null, totalIngreso, null]);
  rows.push([]);

  egresos.forEach((b) => {
    rows.push([
      dayjs.utc(b.date).format("DD-MM-YY"),
      `${b.counterpart || "N/A"} - ${b.concept || "N/A"}`,
      b.totalAmount || 0,
      0,
      null,
    ]);
  });

  rows.push(["", "TOTAL EGRESOS", totalEgreso, null, null]);
  rows.push([]);

  rows.push([
    "",
    "BALANCE GENERAL (Ingresos, Egresos, Saldo)",
    totalEgreso,
    totalIngreso,
    totalIngreso - totalEgreso,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = 2; C <= 4; ++C) {
      const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
      if (!worksheet[cell_ref]) continue;

      if (typeof worksheet[cell_ref].v === "number") {
        worksheet[cell_ref].t = "n";
        worksheet[cell_ref].z = '"$" #,##0.00';
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoría Balance");

  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 45 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
