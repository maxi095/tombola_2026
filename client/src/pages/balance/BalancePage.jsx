import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";
import ReactDOMServer from "react-dom/server";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  PlusCircle,
  Download,
  FileDown,
  X,
  Eye,
  Ban,
  AlertCircle,
  RefreshCw,
  Search,
  Calendar,
  Settings2,
  ChevronDown,
  FileSpreadsheet,
  Database,
  Briefcase
} from "lucide-react";

import { useBalance } from "../../context/BalanceContext";
import { useEditionFilter } from "../../context/EditionFilterContext";
import { useEditions } from "../../context/EditionContext";
import BalanceReceipt from "../../components/BalanceReceipt";

// Infraestructura Elite 2026 🛡️
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import InputField from "../../components/ui/InputField";
import FilterBar from "../../components/ui/FilterBar";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  OperationCell,
  AmountCell
} from "../../components/ui/Table";
import ColumnPicker from "../../components/ui/ColumnPicker";
import { exportToExcel } from "../../libs/excelExport";
import { useFeedback } from "../../context/FeedbackContext";
import EliteSelect from "../../components/ui/Select";
import { useTableColumns } from "../../hooks/useTableColumns";
import { formatCurrency } from "../../libs/formatters";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

const INCOME_CATEGORIES = [
  "Rendición de Vendedor",
  "Publicidad / Sponsoring",
  "Venta Directa",
  "Donación",
  "Otro Ingreso",
];
const EXPENSE_CATEGORIES = [
  "Sueldo / Honorario",
  "Impuesto Lotería",
  "Premio de Sorteo",
  "Proveedor de Servicio",
  "Impresión de Cartones",
  "Publicidad",
  "Otro Egreso",
];

// ─── Componente principal ─────────────────────────────────────────────────────
export default function BalancePage() {
  const { balances, getBalances, getBalanceSummary, cancelBalance } = useBalance();
  const { selectedEdition } = useEditionFilter();
  const { editions } = useEditions();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [filters, setFilters] = useState({
    txNumber: "",
    type: "",
    category: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  // CONFIGURACIÓN DE COLUMNAS v19.5 🛡️
  const initialColumns = [
    { id: 'txNumber', label: 'N°', isMandatory: true },
    { id: 'type', label: 'TIPO', isMandatory: true },
    { id: 'date', label: 'FECHA' },
    { id: 'counterpart', label: 'CONTRAPARTE' },
    { id: 'concept', label: 'CONCEPTO' },
    { id: 'category', label: 'CATEGORÍA' },
    { id: 'cash', label: 'EFECTIVO' },
    { id: 'transfer', label: 'TRANSF.' },
    { id: 'check', label: 'CHEQUE' },
    { id: 'total', label: 'TOTAL', isMandatory: true },
    { id: 'status', label: 'ESTADO' },
    { id: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }
  ];

  const columnManager = useTableColumns("BalancePage_v1", initialColumns);
  const { visibleColumns } = columnManager;

  // ─── Carga de datos ──────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await getBalances();
      await getBalanceSummary(selectedEdition || undefined);
    } finally {
      setLoading(false);
    }
  }, [selectedEdition]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Filtrado ────────────────────────────────────────────────────────────
  useEffect(() => {
    let result = balances;

    if (selectedEdition) {
      result = result.filter((b) => b.edition?._id === selectedEdition);
    }
    if (filters.txNumber) {
      const search = filters.txNumber.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      result = result.filter((b) =>
        String(b.transactionNumber).includes(search) ||
        (b.counterpart || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search) ||
        (b.concept || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search)
      );
    }
    if (filters.type) {
      result = result.filter((b) => b.type === filters.type);
    }
    if (filters.category) {
      result = result.filter((b) => b.category === filters.category);
    }
    if (filters.status) {
      result = result.filter((b) => b.status === filters.status);
    }
    if (filters.dateFrom) {
      result = result.filter((b) =>
        dayjs.utc(b.date).isSameOrAfter(dayjs(filters.dateFrom), "day")
      );
    }
    if (filters.dateTo) {
      result = result.filter((b) =>
        dayjs.utc(b.date).isSameOrBefore(dayjs(filters.dateTo), "day")
      );
    }

    setFiltered(result);
  }, [balances, filters, selectedEdition]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () =>
    setFilters({ txNumber: "", type: "", category: "", status: "", dateFrom: "", dateTo: "" });

  // ─── KPIs filtrados ──────────────────────────────────────────────────────
  const filteredIngresos = filtered
    .filter((b) => b.type === "Ingreso" && b.status === "Activo")
    .reduce((s, b) => s + (b.totalAmount || 0), 0);
  const filteredEgresos = filtered
    .filter((b) => b.type === "Egreso" && b.status === "Activo")
    .reduce((s, b) => s + (b.totalAmount || 0), 0);
  const filteredNet = filteredIngresos - filteredEgresos;

  const currentEditionName = useMemo(() => {
    if (!selectedEdition) return "Todo";
    const ed = editions?.find(e => e._id === selectedEdition);
    return ed ? ed.name : "Cargando...";
  }, [selectedEdition, editions]);

  // ─── Anular ──────────────────────────────────────────────────────────────
  const handleCancel = async (id) => {
    if (!window.confirm("¿Confirmar anulación de este movimiento?")) return;
    try {
      await cancelBalance(id);
      await getBalanceSummary(selectedEdition || undefined);
    } catch (err) {
      console.error("Error al anular:", err);
    }
  };

  // ─── Descargar PDF ───────────────────────────────────────────────────────
  const handleDownloadPdf = async (balance) => {
    const html2pdf = (await import("html2pdf.js")).default;
    const isIngreso = balance.type === "Ingreso";
    const txLabel = `${isIngreso ? "I" : "E"}-${String(balance.transactionNumber).padStart(3, "0")}`;
    const docName = isIngreso ? "Recibo" : "OrdenDePago";

    const htmlString = ReactDOMServer.renderToString(
      <BalanceReceipt balance={balance} />
    );

    const opt = {
      margin: 0.5,
      filename: `${docName}_${txLabel}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().from(htmlString).set(opt).save();
  };

  // ─── Exportar Excel ──────────────────────────────────────────────────────
  const handleExport = () => {
    const columnMap = {
      "transactionNumber": "N°",
      "type": "Tipo",
      "date": "Fecha",
      "counterpart": "Contraparte",
      "concept": "Concepto",
      "category": "Categoría",
      "cashAmount": "Efectivo",
      "transferAmount": "Transferencia",
      "checkAmount": "Cheque",
      "totalAmount": "Total",
      "status": "Estado",
      "edition.name": "Edición"
    };
    exportToExcel(filtered, "Auditoria_Balance_Bingo", columnMap);
    showToast("Reporte generado con éxito", "success");
  };

  // ─── Categorías disponibles según filtro de tipo ─────────────────────────
  const categoryOptions =
    filters.type === "Ingreso"
      ? INCOME_CATEGORIES
      : filters.type === "Egreso"
        ? EXPENSE_CATEGORIES
        : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  const activeFilters = useMemo(() => {
    const list = [];
    if (filters.txNumber) list.push({ key: 'txNumber', label: 'N°', value: filters.txNumber });
    if (filters.type) list.push({ key: 'type', label: 'Tipo', value: filters.type });
    if (filters.category) list.push({ key: 'category', label: 'Categoría', value: filters.category });
    if (filters.status) list.push({ key: 'status', label: 'Estado', value: filters.status });
    if (filters.dateFrom) list.push({ key: 'dateFrom', label: 'Desde', value: dayjs(filters.dateFrom).format('DD/MM/YYYY') });
    if (filters.dateTo) list.push({ key: 'dateTo', label: 'Hasta', value: dayjs(filters.dateTo).format('DD/MM/YYYY') });
    return list;
  }, [filters]);

  const handleRemoveFilter = useCallback((key) => {
    setFilters(prev => ({ ...prev, [key]: "" }));
  }, []);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    showToast("Filtros restablecidos", "info");
  }, [showToast]);

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title={`Balance ${currentEditionName}`}
        compact={true}
        actions={[
          {
            label: "Exportar",
            icon: FileSpreadsheet,
            variant: "ghost",
            disabled: !filtered.length,
            onClick: handleExport
          },
          {
            label: "Crear movimiento",
            icon: PlusCircle,
            onClick: () => navigate("/balance/new")
          }
        ]}
        stats={[
          {
            label: "Ingresos",
            value: formatCurrency(filteredIngresos),
            icon: TrendingUp,
            variant: "success"
          },
          {
            label: "Egresos",
            value: formatCurrency(filteredEgresos),
            icon: TrendingDown,
            variant: "danger"
          },
          {
            label: "Balance Neto",
            value: formatCurrency(filteredNet),
            icon: Scale,
            variant: filteredNet >= 0 ? (filteredNet === 0 ? "primary" : "success") : "danger"
          }
        ]}
      />

      <div className="pb-10 flex-1 flex flex-col min-h-0">
        <Card padding="p-0" className="flex-1 flex flex-col min-h-0 shadow-sm border-slate-200/60 overflow-visible bg-white">

          <div className="flex items-center justify-between elite-audit-bar px-6">
            <div className="flex-1 min-h-[32px]">
              <FilterBar
                variant="slim"
                activeFilters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearFilters={handleClearFilters}
              >
                <div className="flex-1 min-w-[200px]">
                  <InputField
                    placeholder="Búsqueda por N°, Contraparte o Concepto..."
                    icon={Search}
                    name="txNumber"
                    value={filters.txNumber}
                    onChange={handleFilterChange}
                    bsize="compact"
                  />
                </div>

                <div className="w-[160px]">
                  <EliteSelect
                    options={[
                      { value: "", label: "Todos" },
                      { value: "Ingreso", label: "Ingreso" },
                      { value: "Egreso", label: "Egreso" }
                    ]}
                    value={{ value: filters.type, label: filters.type || "Tipo: Todos" }}
                    onChange={(selected) => setFilters(prev => ({ ...prev, type: selected.value }))}
                    isSearchable={false}
                  />
                </div>

                <div className="w-[200px]">
                  <EliteSelect
                    options={[{ value: "", label: "Todas las Categorías" }, ...categoryOptions.map(c => ({ value: c, label: c }))]}
                    value={{ value: filters.category, label: filters.category || "Categorías: Todas" }}
                    onChange={(selected) => setFilters(prev => ({ ...prev, category: selected.value }))}
                  />
                </div>

                <div className="w-[160px]">
                  <EliteSelect
                    options={[
                      { value: "", label: "Todos los Estados" },
                      { value: "Activo", label: "Activo" },
                      { value: "Anulado", label: "Anulado" }
                    ]}
                    value={{ value: filters.status, label: filters.status || "Estado: Todos" }}
                    onChange={(selected) => setFilters(prev => ({ ...prev, status: selected.value }))}
                    isSearchable={false}
                  />
                </div>

                <div className="w-[150px]">
                  <InputField
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    bsize="compact"
                    title="Fecha Desde"
                  />
                </div>

                <div className="w-[150px]">
                  <InputField
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    bsize="compact"
                    min={filters.dateFrom}
                    title="Fecha Hasta"
                  />
                </div>
              </FilterBar>
            </div>

            <div className="relative shrink-0 flex items-center pr-4">
              <button
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all active:scale-95 group ${isPickerOpen ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/40'}`}
              >
                <Settings2 size={13} className={isPickerOpen ? 'animate-spin-slow' : 'opacity-60'} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Columnas</span>
                <ChevronDown size={11} className={`opacity-40 transition-transform ${isPickerOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
              </button>

              <div className="absolute right-0 top-11 z-[100]">
                <ColumnPicker
                  {...columnManager}
                  isOpen={isPickerOpen}
                  onClose={() => setIsPickerOpen(false)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-auto custom-scrollbar min-h-0 flex-1 bg-white">
            {loading ? (
              <div className="py-40 flex flex-col items-center gap-6">
                <RefreshCw className="animate-spin text-primary opacity-20" size={64} />
                <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Sincronizando movimientos...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-300 italic">
                <Database className="w-12 h-12 text-slate-100 mb-4" />
                <h3 className="text-sm font-bold text-slate-400 font-manrope tracking-tight">No hay movimientos registrados</h3>
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="mt-4">Restablecer Filtros</Button>
              </div>
            ) : (
              <Table className="overflow-hidden">
                <THead>
                  {visibleColumns.map(col => (
                    <TH key={col.id} className={col.id === 'actions' ? 'text-right px-6' : (['cash', 'transfer', 'check', 'total'].includes(col.id) ? 'text-right' : '')}>
                      {col.label}
                    </TH>
                  ))}
                </THead>
                <TBody>
                  {filtered.map((b) => {
                    const prefix = b.type === "Ingreso" ? "I" : "E";
                    const txLabel = `${prefix}-${String(b.transactionNumber).padStart(3, "0")}`;

                    return (
                      <TR key={b._id} className={`${b.status === "Anulado" ? "opacity-50 grayscale-[0.5]" : ""}`}>
                        {visibleColumns.map(col => {
                          if (col.id === 'txNumber') return (
                            <OperationCell key={col.id} main={txLabel} sub={b.type} icon={b.type === "Ingreso" ? TrendingUp : TrendingDown} />
                          );
                          if (col.id === 'type') return (
                            <TD key={col.id}>
                              <Badge variant={b.type === "Ingreso" ? "success" : "danger"} className="gap-1.5 h-6">
                                {b.type === "Ingreso" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                <span className="text-[10px] font-black uppercase tracking-wider">{b.type}</span>
                              </Badge>
                            </TD>
                          );
                          if (col.id === 'date') return (
                            <TD key={col.id} className="text-xs font-black text-slate-500 whitespace-nowrap">{dayjs.utc(b.date).format('DD/MM/YYYY')}</TD>
                          );
                          if (col.id === 'counterpart') return (
                            <TD key={col.id} className="text-xs font-bold text-slate-600 truncate max-w-[140px]" title={b.counterpart}>
                              {b.counterpart}
                            </TD>
                          );
                          if (col.id === 'concept') return (
                            <TD key={col.id} className="text-[11px] font-medium text-slate-500 max-w-[180px] break-words" title={b.concept}>
                              {b.concept}
                            </TD>
                          );
                          if (col.id === 'category') return (
                            <TD key={col.id}>
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                {b.category}
                              </span>
                            </TD>
                          );
                          if (col.id === 'cash') return (
                            <AmountCell key={col.id} amount={b.cashAmount} />
                          );
                          if (col.id === 'transfer') return (
                            <AmountCell key={col.id} amount={b.transferAmount} status="secondary" />
                          );
                          if (col.id === 'check') return (
                            <AmountCell key={col.id} amount={b.checkAmount} status="secondary" />
                          );
                          if (col.id === 'total') return (
                            <AmountCell key={col.id} amount={b.totalAmount} status={b.type === "Ingreso" ? "success" : "danger"} bold />
                          );
                          if (col.id === 'status') return (
                            <TD key={col.id}>
                              <Badge variant={b.status === "Anulado" ? "danger" : "success"}>
                                {b.status}
                              </Badge>
                            </TD>
                          );
                          if (col.id === 'actions') return (
                            <TD key={col.id} className="text-right px-6">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={FileDown}
                                  onClick={() => handleDownloadPdf(b)}
                                  title={b.type === "Ingreso" ? "Recibo" : "O. Pago"}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={Eye}
                                  onClick={() => navigate(`/balance/view/${b._id}`)}
                                />
                                {b.status === "Activo" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Ban}
                                    className="text-red-400"
                                    onClick={() => handleCancel(b._id)}
                                  />
                                )}
                              </div>
                            </TD>
                          );
                          return <TD key={col.id}>—</TD>;
                        })}
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 rounded-b-[32px]">
            <div className="flex items-center gap-4 px-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Balance Audit v2026.4
              </span>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {filtered.length} Registros encontrados
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
