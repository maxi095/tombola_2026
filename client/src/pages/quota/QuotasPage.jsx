import { useEffect, useState, useMemo, useCallback } from "react";
import { useQuotas } from "../../context/QuotaContext";
import { useEditionFilter } from "../../context/EditionFilterContext"; // SINCRONIZACIÓN GLOBAL 🧭
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  FileSpreadsheet,
  ExternalLink,
  Settings2,
  ChevronDown,
  Loader2,
  Hash,
  Database,
  Tag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import dayjs from "dayjs";

// Infraestructura Premium 2026 ⚓ 🛡️ 🏹⚖️
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import Card from "../../components/ui/Card";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  OperationCell,
  StockCell,
  UserCell,
  AmountCell
} from "../../components/ui/Table";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import ColumnPicker from "../../components/ui/ColumnPicker";
import Badge from "../../components/ui/Badge";
import { exportToExcel } from "../../libs/excelExport";

// HOOK DE LAYOUT DINÁMICO v17.5 ✨💎🚀
import { useTableColumns } from "../../hooks/useTableColumns";

/**
 * QuotasPage V19.1 - Financial Audit Elite 🏹⚖️✨💎🚀
 * Gestión de Cuotas con estándar de alta densidad, blindaje de z-index y sincronización global.
 */
function QuotasPage() {
  const { getQuotasFilter } = useQuotas();
  const { selectedEdition } = useEditionFilter(); // CONTEXTO DE CABECERA 🧭
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    quotaNumber: "",
    updatedDate: ""
  });

  const [appliedFilters, setAppliedFilters] = useState({});
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    totalPages: 1,
    total: 0
  });

  const [localQuotas, setLocalQuotas] = useState([]);

  // CONFIGURACIÓN DE COLUMNAS v19.5 🛡️
  const initialColumns = [
    { id: 'stock', label: 'CARTÓN / EDICIÓN', isMandatory: true },
    { id: 'quotaNumber', label: 'CUOTA' },
    { id: 'seller', label: 'VENDEDOR' },
    { id: 'associate', label: 'ASOCIADO / LOCALIDAD', isMandatory: true },
    { id: 'amount', label: 'IMPORTE', isMandatory: true },
    { id: 'status', label: 'ESTADO', isMandatory: true },
    { id: 'updatedAt', label: 'MODIFICACIÓN' },
    { id: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }
  ];

  const columnManager = useTableColumns("QuotasManagementPage_v6", initialColumns);
  const { visibleColumns } = columnManager;

  const fetchQuotas = useCallback(async () => {
    setLoading(true);

    // MEZCLAR FILTROS MANUALES CON CONTEXTO GLOBAL 🏹⚖️
    const finalFilters = { ...appliedFilters };
    if (selectedEdition) {
      finalFilters.edition = selectedEdition;
    }

    const res = await getQuotasFilter({
      page: pagination.page,
      limit: pagination.limit,
      sortBy: "updatedAt:desc",
      filters: finalFilters
    });

    if (res && Array.isArray(res.quotas)) {
      setLocalQuotas(res.quotas);
      setPagination(prev => ({
        ...prev,
        total: res.total,
        totalPages: res.totalPages
      }));
    } else {
      setLocalQuotas([]);
    }
    setLoading(false);
  }, [pagination.page, pagination.limit, appliedFilters, selectedEdition, getQuotasFilter]);

  useEffect(() => {
    fetchQuotas();
  }, [fetchQuotas]);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPagination(p => ({ ...p, page: 1 }));
  };

  const handleClearFilters = () => {
    const cleared = { quotaNumber: "", updatedDate: "" };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setPagination(p => ({ ...p, page: 1 }));
  };

  const handleExport = () => {
    const columnMap = {
      "sale.edition.name": "Edición",
      "sale.bingoCard.number": "Nro Cartón",
      "quotaNumber": "Nro Cuota",
      "sale.seller.person.lastName": "Vendedor",
      "sale.client.person.lastName": "Asociado",
      "sale.client.person.city": "Localidad",
      "amount": "Monto",
      "paymentDate": "Fecha Pago",
      "updatedAt": "Ult. Modif"
    };
    exportToExcel(localQuotas, "Gestion_Cuotas_Audit", columnMap);
  };

  const activeFiltersArr = useMemo(() => {
    const caps = [];
    if (filters.quotaNumber) caps.push({ key: 'quotaNumber', label: 'N° Cuota', value: filters.quotaNumber });
    if (filters.updatedDate) caps.push({ key: 'updatedDate', label: 'Fecha', value: dayjs(filters.updatedDate).format('DD/MM/YYYY') });
    return caps;
  }, [filters]);

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Historial de actualización de Cuotas"
        compact={true}
        actions={[
          {
            label: "Exportar",
            icon: FileSpreadsheet,
            variant: "ghost",
            onClick: handleExport
          }
        ]}
        stats={[
          {
            label: "Volumen Filtrado",
            value: pagination.total,
            icon: Tag,
            variant: "primary"
          }
        ]}
      />

      <div className="pb-10 flex-1 flex flex-col min-h-0">
        <Card padding="p-0" className="flex-1 flex flex-col min-h-0 shadow-sm border-slate-200/60 overflow-visible bg-white">

          {/* PANEL DE AUDITORÍA ELITE 🔱 */}
          <div className="flex items-center justify-between elite-audit-bar px-6">
            <div className="flex-1 min-h-[32px]">
              <FilterBar
                variant="slim"
                activeFilters={activeFiltersArr}
                onRemoveFilter={(key) => setFilters(prev => ({ ...prev, [key]: "" }))}
                onClearFilters={handleClearFilters}
                title="Panel de filtros"
              >
                <div className="w-[200px]">
                  <InputField
                    icon={Search}
                    type="number"
                    placeholder="Filtrar N° cuota..."
                    value={filters.quotaNumber}
                    onChange={(e) => setFilters(p => ({ ...p, quotaNumber: e.target.value }))}
                    className="!space-y-0"
                  />
                </div>

                <div className="w-[180px]">
                  <InputField
                    type="date"
                    icon={Calendar}
                    value={filters.updatedDate}
                    onChange={(e) => setFilters(p => ({ ...p, updatedDate: e.target.value }))}
                    className="!space-y-0"
                  />
                </div>

                <Button variant="primary" size="sm" onClick={handleApplyFilters} className="h-9 px-4">
                  Filtrar
                </Button>
              </FilterBar>
            </div>

            <div className="relative shrink-0 flex items-center pr-4">
              <button
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all active:scale-95 group ${isPickerOpen ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/40'}`}
              >
                <Settings2 size={13} className={isPickerOpen ? 'animate-spin-slow' : 'opacity-60'} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Personalizar columnas</span>
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

          <div className="overflow-auto flex-1 custom-scrollbar min-h-0 bg-white">
            {loading ? (
              <div className="py-40 flex flex-col items-center gap-6">
                <Loader2 className="animate-spin text-primary opacity-20" size={64} />
                <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Analizando Historial Pago...</p>
              </div>
            ) : localQuotas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center text-slate-300 italic">
                <Database className="w-12 h-12 text-slate-100 mb-4" />
                <h3 className="text-sm font-bold text-slate-400 font-manrope tracking-tight">Sin registros para esta auditoría financiera</h3>
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="mt-4">Limpiar Filtros</Button>
              </div>
            ) : (
              <Table className="overflow-hidden">
                <THead>
                  {visibleColumns.map(col => (
                    <TH key={col.id} className={col.id === 'actions' || col.id === 'amount' ? 'text-right px-10 font-black' : ''}>{col.label}</TH>
                  ))}
                </THead>
                <TBody>
                  {localQuotas.map(quota => (
                    <TR key={quota._id} className="group transition-all duration-300">
                      {visibleColumns.map(col => {
                        if (col.id === 'stock') return (
                          <StockCell
                            key={col.id}
                            main={quota.sale?.bingoCard?.number ? `Cartón #${quota.sale.bingoCard.number}` : "S/N"}
                            sub={quota.sale?.edition?.name || "Sin edición"}
                          />
                        );
                        if (col.id === 'quotaNumber') return (
                          <TD key={col.id}>
                            <Badge variant="ghost" className="bg-indigo-50 border-indigo-100 text-indigo-600 font-black tracking-tight text-[11px] gap-1.5 px-4 h-7 uppercase">
                              <Hash size={10} className="text-indigo-400" />
                              {quota.quotaNumber}
                            </Badge>
                          </TD>
                        );
                        if (col.id === 'seller') return (
                          <UserCell
                            key={col.id}
                            variant="secondary"
                            name={quota.sale?.seller?.person ? `${quota.sale.seller.person.firstName} ${quota.sale.seller.person.lastName}` : "No asignado"}
                          />
                        );
                        if (col.id === 'associate') return (
                          <UserCell
                            key={col.id}
                            variant="primary"
                            name={quota.sale?.client?.person ? `${quota.sale.client.person.firstName} ${quota.sale.client.person.lastName}` : "Sin asociado"}
                            sub={quota.sale?.client?.person?.city || "Sin localidad"}
                          />
                        );
                        if (col.id === 'amount') return <AmountCell key={col.id} value={quota.amount} />;
                        if (col.id === 'status') return (
                          <TD key={col.id}>
                            <Badge variant={quota.paymentDate ? "success" : "warning"} className="px-3 h-6">
                              <span className="text-[10px] uppercase font-black tracking-widest leading-none">{quota.paymentDate ? "Pagado" : "Pendiente"}</span>
                            </Badge>
                          </TD>
                        );
                        if (col.id === 'updatedAt') return (
                          <TD key={col.id} className="text-xs font-black text-slate-500">
                            {dayjs(quota.updatedAt).format("DD/MM/YYYY HH:mm")}
                          </TD>
                        );
                        if (col.id === 'actions') return (
                          <TD key={col.id} className="text-right px-10 bg-slate-50/10">
                            <div className="flex justify-end transition-all">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/sale/view/${quota.sale?._id}`)}
                                icon={ExternalLink}
                              >
                                Detalle
                              </Button>
                            </div>
                          </TD>
                        );
                        return <TD key={col.id}>—</TD>;
                      })}
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </div>

          {/* PAGINACIÓN PREMIUM 📐 */}
          <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 rounded-b-[32px]">
            <div className="flex items-center gap-6 pl-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Visualización</span>
                <span className="text-[11px] font-black text-primary uppercase tracking-tighter">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-100" />
              <div className="flex items-center gap-3">
                <select
                  value={pagination.limit}
                  onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
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
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                icon={ChevronLeft}
                className="px-6 h-10 rounded-2xl"
              >
                Anterior
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                icon={ChevronRight}
                iconPosition="right"
                className="px-6 h-10 rounded-2xl shadow-lg shadow-primary/10"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default QuotasPage;
