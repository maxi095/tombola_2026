import { useEffect, useState, useMemo, useCallback } from "react";
import { useSales } from "../../context/SaleContext";
import { useEditions } from "../../context/EditionContext";
import { useEditionFilter } from "../../context/EditionFilterContext"; // INYECCIÓN DE CONTEXTO GLOBAL 🚀
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {
  Plus,
  Search,
  FileSpreadsheet,
  ExternalLink,
  Ban,
  Loader2,
  Settings2,
  ChevronDown,
  Calendar
} from "lucide-react";

// Infraestructura Premium 2026 ⚓ 🛡️
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import InputField from "../../components/ui/InputField";
import FilterBar from "../../components/ui/FilterBar";
import EliteSelect from "../../components/ui/Select";
import ColumnPicker from "../../components/ui/ColumnPicker";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  OperationCell,
  StockCell,
  UserCell
} from "../../components/ui/Table";
import { exportToExcel } from "../../libs/excelExport";
import { useFeedback } from "../../context/FeedbackContext";

// HOOK DE LAYOUT DINÁMICO v17.1 ✨💎🚀
import { useTableColumns } from "../../hooks/useTableColumns";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * SalePage V18.9 - Global Context Sync 🏹⚖️✨💎🚀
 * Reintegración de useEditionFilter para sincronización con barra de tareas.
 */
export default function SalePage() {
  const { getSales, sales, cancelSale, loading } = useSales();
  const { getEditions } = useEditions();
  const { selectedEdition } = useEditionFilter(); // CONTEXTO DE CABECERA 🧭
  const { user } = useAuth();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [omniSearch, setOmniSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // ESTADO PARA MODAL DE ANULACIÓN 🛡️
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState(null);
  const [isVoiding, setIsVoiding] = useState(false);

  // CONFIGURACIÓN DE COLUMNAS v18.5 🛡️
  const initialColumns = [
    { id: 'saleNumber', label: 'Nro Venta', isMandatory: true },
    { id: 'carton', label: 'Cartón / Edición' },
    { id: 'seller', label: 'Vendedor' },
    { id: 'associate', label: 'Asociado / Localidad' },
    { id: 'status', label: 'Estado' },
    { id: 'date', label: 'Fecha' },
    { id: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }
  ];

  const columnManager = useTableColumns("SalesPage", initialColumns);
  const { visibleColumns } = columnManager;

  useEffect(() => {
    if (user) {
      getSales();
      getEditions();
    }
  }, [getSales, getEditions, user]);

  const filteredSales = useMemo(() => {
    let list = Array.isArray(sales) ? sales : [];

    // FILTRO DE CONTEXTO GLOBAL (BARRA DE TAREAS) 🏹⚖️
    if (selectedEdition) {
      list = list.filter(sale => sale.edition?._id === selectedEdition);
    }

    if (selectedStatus !== "all") {
      list = list.filter(sale => sale.status === selectedStatus);
    }

    if (selectedDate) {
      const targetDate = dayjs(selectedDate).startOf('day');
      list = list.filter(sale => dayjs(sale.saleDate).isSame(targetDate, 'day'));
    }

    if (omniSearch) {
      const search = omniSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      list = list.filter(sale => {
        const saleNum = String(sale.saleNumber || "");
        const associateName = sale.client?.person ? `${sale.client.person.firstName} ${sale.client.person.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
        const sellerName = sale.seller?.person ? `${sale.seller.person.firstName} ${sale.seller.person.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
        const cityName = (sale.client?.person?.city || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return saleNum.includes(search) || associateName.includes(search) || sellerName.includes(search) || cityName.includes(search);
      });
    }
    return list;
  }, [sales, omniSearch, selectedStatus, selectedDate, selectedEdition]);

  const activeFilters = useMemo(() => {
    const list = [];
    if (omniSearch) list.push({ key: 'search', label: 'Búsqueda', value: omniSearch });
    if (selectedStatus !== 'all') list.push({ key: 'status', label: 'Estado', value: selectedStatus });
    if (selectedDate) list.push({ key: 'date', label: 'Fecha', value: dayjs(selectedDate).format('DD/MM/YYYY') });
    return list;
  }, [omniSearch, selectedStatus, selectedDate]);

  const handleRemoveFilter = useCallback((key) => {
    if (key === 'search') setOmniSearch("");
    if (key === 'status') setSelectedStatus("all");
    if (key === 'date') setSelectedDate("");
  }, []);

  const handleClearFilters = useCallback(() => {
    setOmniSearch("");
    setSelectedStatus("all");
    setSelectedDate("");
    showToast("Filtros restablecidos", "info");
  }, [showToast]);

  // MANEJO DE MODAL ELITE ✨💎🚀
  const handleCancelClick = (sale) => {
    setSaleToCancel(sale);
    setIsCancelModalOpen(true);
  };

  const confirmCancelSale = async () => {
    if (!saleToCancel) return;
    
    setIsVoiding(true);
    try {
      await cancelSale(saleToCancel._id);
      showToast(`Venta #${saleToCancel.saleNumber} anulada y cartón liberado`, "success");
      setIsCancelModalOpen(false);
    } catch (error) {
      showToast("Error crítico al anular la operación", "danger");
    } finally {
      setIsVoiding(false);
      setSaleToCancel(null);
    }
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Gestión de Ventas"
        breadcrumbs={[{ label: "Ventas", href: "/sales" }]}
        compact={true}
        actions={[
          { label: "Exportar", icon: FileSpreadsheet, variant: "ghost", onClick: () => exportToExcel(filteredSales, "Ventas_Filtradas", {}) },
          { label: "Crear Venta", icon: Plus, variant: "primary", onClick: () => navigate("/sale/new") }
        ]}
      />

      <div className="pb-10 flex-1 flex flex-col min-h-0">
        <Card padding="p-0" className="flex-1 flex flex-col min-h-0 shadow-sm border-slate-200/60 overflow-visible bg-white">

          <div className="flex items-center justify-between border-b border-slate-100/60 elite-audit-bar px-6">
            <div className="flex-1 min-h-[32px]">
              <FilterBar
                variant="slim"
                activeFilters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearFilters={handleClearFilters}
                title="Panel de filtros"
              >
                <div className="flex-1 min-w-[280px]">
                  <InputField
                    placeholder="Venta, Asociado, Localidad o Vendedor..."
                    icon={Search}
                    value={omniSearch}
                    onChange={(e) => setOmniSearch(e.target.value)}
                    className="!space-y-0 shadow-none border-transparent focus-within:border-primary/20"
                  />
                </div>

                <div className="w-[180px]">
                  <EliteSelect
                    options={[
                      { value: "all", label: "Todos los Estados" },
                      { value: "Pendiente de pago", label: "Pendiente de Pago" },
                      { value: "Pagado", label: "Pagado" },
                      { value: "Anulada", label: "Anulada" },
                      { value: "Entregado sin cargo", label: "Entregado sin cargo" }
                    ]}
                    value={{ value: selectedStatus, label: selectedStatus === "all" ? "Estado de Venta" : (selectedStatus === 'all' ? 'Estado' : selectedStatus) }}
                    onChange={(selected) => setSelectedStatus(selected.value)}
                    isSearchable={false}
                  />
                </div>

                <div className="w-[180px]">
                  <InputField
                    type="date"
                    icon={Calendar}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="!space-y-0"
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
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Personalizar Columnas</span>
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
              <div className="py-24 flex flex-col items-center gap-6">
                <Loader2 className="animate-spin text-primary opacity-20" size={64} />
                <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Analizando Registros...</p>
              </div>
            ) : (
              <Table className="overflow-hidden">
                <THead>
                   {visibleColumns.map(col => (
                     <TH key={col.id} className={col.id === 'actions' ? 'text-right px-10 font-black' : ''}>{col.label}</TH>
                   ))}
                </THead>
                <TBody>
                  {filteredSales.length === 0 ? (
                    <TR><TD colSpan={visibleColumns.length} className="py-20 text-center text-slate-300 font-medium italic animate-in fade-in slide-in-from-top-2 duration-500">No se encontraron ventas para este criterio</TD></TR>
                  ) : (
                    filteredSales.map((sale) => (
                      <TR key={sale._id} className="group transition-all duration-300">
                        {visibleColumns.map(col => {
                          if (col.id === 'saleNumber') return <OperationCell key={col.id} number={sale.saleNumber} />;
                          if (col.id === 'carton') return <StockCell key={col.id} main={sale.bingoCard?.number ? `Cartón #${sale.bingoCard.number}` : "No asignado"} sub={sale.edition?.name || "S/E"} />;
                          if (col.id === 'seller') return <UserCell key={col.id} name={sale.seller?.person ? `${sale.seller.person.firstName} ${sale.seller.person.lastName}` : "No asignado"} sub={sale.seller?.username ? `@${sale.seller.username}` : ""} />;
                          if (col.id === 'associate') return <UserCell key={col.id} variant="secondary" name={sale.client?.person ? `${sale.client.person.firstName} ${sale.client.person.lastName}` : "S/A"} sub={sale.client?.person?.city || "Sin localidad"} />;

                          if (col.id === 'status') {
                            const statusVariants = {
                              "Pagado": "success",
                              "Pendiente de pago": "warning",
                              "Anulada": "danger",
                              "Entregado sin cargo": "info"
                            };
                            return (
                              <TD key={col.id}>
                                <Badge variant={statusVariants[sale.status] || "warning"} className="px-3 h-6">
                                  <span className="text-[10px] tracking-tight font-black uppercase tracking-widest leading-none">
                                    {sale.status || "Pendiente de pago"}
                                  </span>
                                </Badge>
                              </TD>
                            );
                          }

                          if (col.id === 'date') return <TD key={col.id} className="text-xs font-black text-slate-500">{dayjs(sale.saleDate).format('DD/MM/YYYY')}</TD>;
                          if (col.id === 'actions') return (
                            <TD key={col.id} className="text-right px-10 bg-slate-50/10">
                              <div className="flex justify-end gap-3 transition-all">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/sale/view/${sale._id}`)}
                                  icon={ExternalLink}
                                >
                                  Detalle
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`transition-all ${sale.status === "Anulada" ? 'opacity-30 cursor-not-allowed text-slate-300' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                  icon={Ban}
                                  onClick={() => handleCancelClick(sale)}
                                  disabled={sale.status === "Anulada"}
                                >
                                  Anular
                                </Button>
                              </div>
                            </TD>
                          );
                          return <TD key={col.id}>—</TD>;
                        })}
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            )}
          </div>
        </Card>
      </div>

      {/* ELITE VOID CONFIRMATION MODAL 🏹⚖️✨💎🚀 */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancelSale}
        title="Anular Operación de Venta"
        message={
          <>
            ¿Está seguro de anular la <strong>Venta #{saleToCancel?.saleNumber}</strong>? 
            <br /><br />
            Esta acción liberará el <strong>Cartón #{saleToCancel?.bingoCard?.number}</strong> y marcará la venta definitivamente como anulada. Esta acción no se puede deshacer.
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
