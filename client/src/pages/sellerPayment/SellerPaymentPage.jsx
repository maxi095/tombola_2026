import { useEffect, useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import ReactDOMServer from "react-dom/server";
import {
  TrendingUp,
  Wallet,
  CreditCard,
  PlusCircle,
  Download,
  Eye,
  Ban,
  RefreshCw,
  Search,
  Settings2,
  ChevronDown,
  Database,
  FileSpreadsheet,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { useSellerPayments } from "../../context/SellerPaymentContext";
import { useEditionFilter } from "../../context/EditionFilterContext";
import { useFeedback } from "../../context/FeedbackContext";
import SellerPaymentReceipt from "../../components/SellerPaymentReceipt";

// Infraestructura Elite 2026 🛡️
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Tooltip from "../../components/ui/Tooltip";
import ConfirmModal from "../../components/ui/ConfirmModal";
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
  AmountCell,
  UserCell
} from "../../components/ui/Table";
import ColumnPicker from "../../components/ui/ColumnPicker";
import EliteSelect from "../../components/ui/Select";
import { useTableColumns } from "../../hooks/useTableColumns";
import { formatCurrency } from "../../libs/formatters";
import { exportToExcel } from "../../libs/excelExport";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

export default function SellerPaymentPage() {
  const {
    sellerPayments,
    getSellerPayments,
    cancelSellerPayment,
  } = useSellerPayments();

  const { selectedEdition } = useEditionFilter();
  const { showToast } = useFeedback();

  const [loading, setLoading] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [filters, setFilters] = useState({
    payNumber: "",
    sellerName: "",
    status: "",
    dateFrom: "",
    dateTo: ""
  });

  // ESTADOS PARA MODAL DE ANULACIÓN
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [itemToCancel, setItemToCancel] = useState(null);
  const [isVoiding, setIsVoiding] = useState(false);

  // ESTADOS PARA PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // CONFIGURACIÓN DE COLUMNAS v19.5 🛡️
  const initialColumns = [
    { id: 'payNumber', label: 'N° PAGO', isMandatory: true },
    { id: 'edition', label: 'EDICIÓN' },
    { id: 'seller', label: 'VENDEDOR', isMandatory: true },
    { id: 'subtotal', label: 'SUBTOTAL' },
    { id: 'commission', label: 'COMISIÓN' },
    { id: 'total', label: 'TOTAL', isMandatory: true },
    { id: 'date', label: 'FECHA PAGO' },
    { id: 'status', label: 'ESTADO' },
    { id: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }
  ];

  const columnManager = useTableColumns("SellerPaymentPage_v1", initialColumns);
  const { visibleColumns } = columnManager;
  const visibleIds = useMemo(() => visibleColumns.map(c => c.id), [visibleColumns]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await getSellerPayments();
    } finally {
      setLoading(false);
    }
  }, [getSellerPayments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Filtrado y KPIs ──────────────────────────────────────────────────────────
  useEffect(() => {
    let result = sellerPayments;

    if (selectedEdition) {
      result = result.filter(pay => pay.edition?._id === selectedEdition);
    }

    if (filters.payNumber) {
      result = result.filter(pay => String(pay.sellerPaymentNumber).includes(filters.payNumber));
    }

    if (filters.sellerName) {
      const search = filters.sellerName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      result = result.filter(pay => {
        const full = `${pay.seller?.person?.firstName} ${pay.seller?.person?.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return full.includes(search);
      });
    }

    if (filters.status) {
      result = result.filter(pay => pay.status === filters.status);
    }

    if (filters.dateFrom || filters.dateTo) {
      result = result.filter(pay => {
        const payDate = dayjs.utc(pay.date);
        if (filters.dateFrom && payDate.isBefore(dayjs(filters.dateFrom), 'day')) return false;
        if (filters.dateTo && payDate.isAfter(dayjs(filters.dateTo), 'day')) return false;
        return true;
      });
    }

    setFiltered(result);
  }, [sellerPayments, filters, selectedEdition]);

  const getAmount = (payment) =>
    (payment.cashAmount || 0) +
    (payment.transferAmount || 0) +
    (payment.tarjetaUnicaAmount || 0) +
    (payment.checkAmount || 0);

  // LÓGICA DE PAGINACIÓN EN MEMORIA
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, selectedEdition]);

  const metrics = useMemo(() => {
    const activeOnes = filtered.filter(p => p.status === "Activo");
    const totalLiquidado = activeOnes.reduce((acc, p) => acc + (getAmount(p) - (p.commissionAmount || 0)), 0);
    const totalComis = activeOnes.reduce((acc, p) => acc + (p.commissionAmount || 0), 0);

    return [
      { label: "Total Pagos", value: formatCurrency(totalLiquidado), icon: Wallet, variant: "success" },
      { label: "Pagos Activos", value: activeOnes.length, icon: TrendingUp, variant: "primary" },
      { label: "Comisiones", value: formatCurrency(totalComis), icon: CreditCard, variant: "warning" },
    ];
  }, [filtered]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleCancelClick = (item) => {
    setItemToCancel(item);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!itemToCancel) return;
    setIsVoiding(true);
    try {
      await cancelSellerPayment(itemToCancel._id);
      showToast("Pago anulado con éxito", "success");
      setIsCancelModalOpen(false);
    } catch (error) {
      showToast("Error al anular el pago", "error");
    } finally {
      setIsVoiding(false);
      setItemToCancel(null);
    }
  };

  const handleDownloadReceipt = async (payment) => {
    const html2pdf = (await import("html2pdf.js")).default;
    const htmlString = ReactDOMServer.renderToString(<SellerPaymentReceipt payment={payment} />);

    const opt = {
      margin: 0.2,
      filename: `Recibo_Pago_${payment.sellerPaymentNumber || "sin-numero"}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(htmlString).set(opt).save();
  };

  const handleExport = () => {
    // 1. Transformar datos para que coincidan con la vista de pantalla
    const dataToExport = filtered.map(p => {
      const subtotal = getAmount(p);
      const commission = p.commissionAmount || 0;
      const totalNeto = subtotal - commission;

      return {
        payNumber: p.sellerPaymentNumber,
        edition: p.edition?.name || "Global",
        seller: `${p.seller?.person?.lastName}, ${p.seller?.person?.firstName}`,
        subtotal: subtotal,
        commission: commission,
        totalNeto: totalNeto,
        date: dayjs(p.date).format("DD/MM/YYYY"),
        status: p.status
      };
    });

    // 2. Definir el mapeo de columnas humanas
    const columnMap = {
      'payNumber': 'N° Pago',
      'edition': 'Edición',
      'seller': 'Vendedor',
      'subtotal': 'Subtotal',
      'commission': 'Comisión',
      'totalNeto': 'Total Neto',
      'date': 'Fecha',
      'status': 'Estado'
    };

    exportToExcel(dataToExport, "Pagos_Vendedores", columnMap);
    showToast("Excel generado", "success");
  };

  const clearFilters = () => {
    setFilters({ payNumber: "", sellerName: "", status: "", dateFrom: "", dateTo: "" });
    showToast("Filtros restablecidos", "info");
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Pagos a Vendedores"
        compact={true}
        stats={metrics}
        actions={[
          { label: "Exportar", icon: FileSpreadsheet, variant: "ghost", onClick: handleExport },
          { label: "Crear Pago", icon: PlusCircle, onClick: () => window.location.href = "/sellerPayment/new" }
        ]}
      />

      <div className="flex-1 pb-12">
        <Card padding="p-0" className="overflow-hidden border-slate-200/60 shadow-premium">
          {/* Elite Audit Bar 🔱 */}
          <div className="flex items-center justify-between border-b border-slate-100/60 elite-audit-bar px-6">
            <div className="flex-1">
              <FilterBar
                variant="slim"
                activeFilters={Object.entries(filters).filter(([_, v]) => v).map(([k, v]) => ({ key: k, label: k, value: v }))}
                onRemoveFilter={(key) => setFilters(prev => ({ ...prev, [key]: "" }))}
                onClearFilters={clearFilters}
              >
                <div className="w-[180px]">
                  <InputField
                    placeholder="N° Pago..."
                    name="payNumber"
                    value={filters.payNumber}
                    onChange={(e) => setFilters(prev => ({ ...prev, payNumber: e.target.value }))}
                    bsize="compact"
                    icon={Search}
                  />
                </div>
                <div className="w-[220px]">
                  <InputField
                    placeholder="Buscar Vendedor..."
                    name="sellerName"
                    value={filters.sellerName}
                    onChange={(e) => setFilters(prev => ({ ...prev, sellerName: e.target.value }))}
                    bsize="compact"
                    icon={Search}
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
                    onChange={(s) => setFilters(prev => ({ ...prev, status: s.value }))}
                  />
                </div>
                <div className="w-[150px]">
                  <InputField
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    bsize="compact"
                    title="Desde"
                  />
                </div>
                <div className="w-[150px]">
                  <InputField
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    bsize="compact"
                    title="Hasta"
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
                <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Sincronizando pagos...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-300 italic">
                <Database className="w-12 h-12 text-slate-100 mb-4" />
                <h3 className="text-sm font-bold text-slate-400 font-manrope tracking-tight">No hay pagos registrados</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-4">Restablecer Filtros</Button>
              </div>
            ) : (
              <Table className="overflow-hidden">
                <THead>
                  {visibleIds.includes('payNumber') && <TH>N° PAGO</TH>}
                  {visibleIds.includes('edition') && <TH>EDICIÓN</TH>}
                  {visibleIds.includes('seller') && <TH>VENDEDOR</TH>}
                  {visibleIds.includes('subtotal') && <TH className="text-right">SUBTOTAL</TH>}
                  {visibleIds.includes('commission') && <TH className="text-right">COMISIÓN</TH>}
                  {visibleIds.includes('total') && <TH className="text-right">TOTAL NETO</TH>}
                  {visibleIds.includes('date') && <TH>FECHA</TH>}
                  {visibleIds.includes('status') && <TH>ESTADO</TH>}
                  {visibleIds.includes('actions') && <TH className="text-right">ACCIONES</TH>}
                </THead>
                <TBody>
                  {paginatedPayments.map((p) => {
                    const subtotal = getAmount(p);
                    const netTotal = subtotal - (p.commissionAmount || 0);

                    return (
                      <TR key={p._id} className={p.status === 'Anulado' ? 'opacity-50 grayscale-[0.5]' : ''}>
                        {visibleIds.includes('payNumber') && (
                          <OperationCell number={p.sellerPaymentNumber} />
                        )}
                        {visibleIds.includes('edition') && (
                          <TD>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                              {p.edition?.name || "Global"}
                            </span>
                          </TD>
                        )}
                        {visibleIds.includes('seller') && (
                          <UserCell
                            name={`${p.seller?.person?.lastName}, ${p.seller?.person?.firstName}`}
                            variant="secondary"
                          />
                        )}
                        {visibleIds.includes('subtotal') && (
                          <AmountCell value={subtotal} />
                        )}
                        {visibleIds.includes('commission') && (
                          <TD className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {p.commissionAmount > 0 && (
                                <Tooltip text={p.commissionType === "Efectivo" ? "Comisión en Efectivo" : "Comisión por Transferencia"}>
                                  <Badge
                                    variant={p.commissionType === "Efectivo" ? "success" : "info"}
                                    className="text-[9px] px-1.5 py-0 min-w-[18px] justify-center cursor-help"
                                  >
                                    {p.commissionType === "Efectivo" ? "E" : "T"}
                                  </Badge>
                                </Tooltip>
                              )}
                              <span className="text-[13px] font-black text-amber-600">
                                {formatCurrency(p.commissionAmount || 0)}
                              </span>
                            </div>
                          </TD>
                        )}
                        {visibleIds.includes('total') && (
                          <TD className="text-right">
                            <span className="text-[14px] font-black text-primary font-manrope">
                              {formatCurrency(netTotal)}
                            </span>
                          </TD>
                        )}
                        {visibleIds.includes('date') && (
                          <TD>
                            <div className="flex items-center gap-2 text-slate-500">
                              <span className="text-[11px] font-bold">{dayjs(p.date).format("DD/MM/YYYY")}</span>
                            </div>
                          </TD>
                        )}
                        {visibleIds.includes('status') && (
                          <TD>
                            <Badge variant={p.status === 'Activo' ? 'success' : 'danger'}>
                              {p.status}
                            </Badge>
                          </TD>
                        )}
                        {visibleIds.includes('actions') && (
                          <TD className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip text="Ver Detalle">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={Eye}
                                  onClick={() => window.location.href = `/sellerPayment/view/${p._id}`}
                                />
                              </Tooltip>
                              <Tooltip text="Descargar Recibo">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={Download}
                                  className="text-primary/70"
                                  onClick={() => handleDownloadReceipt(p)}
                                />
                              </Tooltip>
                              {p.status === "Activo" && (
                                <Tooltip text="Anular Pago" position="left">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Ban}
                                    className="text-red-400"
                                    onClick={() => handleCancelClick(p)}
                                  />
                                </Tooltip>
                              )}
                            </div>
                          </TD>
                        )}
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            )}
          </div>

          {/* PAGINACIÓN PREMIUM 📐 */}
          {filtered.length > 0 && (
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 rounded-b-[32px]">
              <div className="flex items-center gap-6 pl-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Visualización</span>
                  <span className="text-[11px] font-black text-primary uppercase tracking-tighter">
                    Página {currentPage} de {totalPages || 1}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-100" />
                <div className="flex items-center gap-3">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-600 px-3 py-1.5 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all cursor-pointer shadow-sm"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Registros</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pr-6">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  icon={ChevronLeft}
                  className="px-6 h-10 rounded-2xl"
                >
                  Anterior
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  icon={ChevronRight}
                  iconPosition="right"
                  className="px-6 h-10 rounded-2xl shadow-lg shadow-primary/10"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

        </Card>
      </div>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancel}
        title="Anular Pago a Vendedor"
        message={
          <>
            ¿Está seguro de anular el <strong>Pago #{itemToCancel?.sellerPaymentNumber}</strong>?
            <br /><br />
            Esta acción revertirá la liquidación y marcará el registro como "Anulado". Esta acción no se puede deshacer.
          </>
        }
        confirmText="Confirmar Anulación"
        cancelText="Desistir"
        variant="danger"
        loading={isVoiding}
      />
    </div>
  );
}
