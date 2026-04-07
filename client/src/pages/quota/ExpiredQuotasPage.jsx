import { useEffect, useState, useMemo } from "react";
import { useQuotas } from "../../context/QuotaContext";
import QuotaPaymentModal from "../../components/QuotaPaymentModal";
import dayjs from "dayjs";
import {
  Calendar,
  Search,
  FileSpreadsheet,
  AlertCircle,
  Settings2,
  ChevronDown,
  CreditCard,
  User,
  Hash,
  Database,
  TrendingDown
} from "lucide-react";

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
  StockCell,
  UserCell,
  AmountCell
} from "../../components/ui/Table";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import ColumnPicker from "../../components/ui/ColumnPicker";
import { exportToExcel } from "../../libs/excelExport";
import { useEditionFilter } from "../../context/EditionFilterContext";

// HOOK DE LAYOUT DINÁMICO v17.5 ✨💎🚀
import { useTableColumns } from "../../hooks/useTableColumns";

/**
 * ExpiredQuotasPage V19.5 - Morosity Hub 🏹⚖️✨💎🚀
 * Gestión de morosidad con estándar de alta densidad y KPIs de deuda.
 */
function ExpiredQuotasPage() {
  const { getExpiredQuotas, quotas, updateQuota } = useQuotas();
  const { selectedEdition } = useEditionFilter();

  const [filters, setFilters] = useState({
    searchTerm: "",
    dueDate: ""
  });

  const [filteredQuotas, setFilteredQuotas] = useState([]);
  const [selectedQuota, setSelectedQuota] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // CONFIGURACIÓN DE COLUMNAS v19.5 🛡️
  const initialColumns = [
    { id: 'stock', label: 'EDICIÓN / CARTÓN', isMandatory: true },
    { id: 'quotaNumber', label: 'CUOTA' },
    { id: 'seller', label: 'VENDEDOR' },
    { id: 'client', label: 'ASOCIADO / LOCALIDAD', isMandatory: true },
    { id: 'amount', label: 'IMPORTE', isMandatory: true },
    { id: 'dueDate', label: 'VENCIMIENTO', isMandatory: true },
    { id: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }
  ];

  const columnManager = useTableColumns("ExpiredQuotasManagementPage", initialColumns);
  const { visibleColumns } = columnManager;

  useEffect(() => {
    const fetchExpired = async () => {
      try {
        await getExpiredQuotas();
      } catch (error) {
        console.error("Error al obtener cuotas vencidas:", error);
      }
    };
    fetchExpired();
  }, [getExpiredQuotas]);

  useEffect(() => {
    let filtered = Array.isArray(quotas) ? quotas : [];

    if (selectedEdition) {
      filtered = filtered.filter(quota => quota.sale?.edition?._id === selectedEdition);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(quota => {
        const sellerFullName = `${quota.sale?.seller?.person?.firstName || ""} ${quota.sale?.seller?.person?.lastName || ""}`.toLowerCase();
        const clientFullName = `${quota.sale?.client?.person?.firstName || ""} ${quota.sale?.client?.person?.lastName || ""}`.toLowerCase();
        const bingoCardNumber = (quota.sale?.bingoCard?.number || "").toString().toLowerCase();

        return sellerFullName.includes(term) ||
          clientFullName.includes(term) ||
          bingoCardNumber.includes(term);
      });
    }

    if (filters.dueDate) {
      filtered = filtered.filter(quota => dayjs(quota.dueDate).format("YYYY-MM-DD") === filters.dueDate);
    }

    setFilteredQuotas(filtered);
  }, [quotas, filters, selectedEdition]);

  // KPIs DINÁMICOS 📊
  const totalMoroso = useMemo(() => {
    return filteredQuotas.reduce((sum, q) => sum + (q.amount || 0), 0);
  }, [filteredQuotas]);

  const handleClearFilters = () => {
    setFilters({ searchTerm: "", dueDate: "" });
  };

  const openModal = (quota) => {
    if (isModalOpen) return;
    setSelectedQuota(quota);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuota(null);
  };

  const handleSaveQuota = async (updatedQuota) => {
    try {
      await updateQuota(updatedQuota._id, updatedQuota);
      await getExpiredQuotas();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar cuota:", error);
    }
  };

  const handleExport = () => {
    const columnMap = {
      "sale.edition.name": "Edición",
      "sale.bingoCard.number": "Nro Cartón",
      "quotaNumber": "Nro Cuota",
      "sale.seller.person.lastName": "Vendedor",
      "sale.client.person.lastName": "Cliente",
      "amount": "Monto",
      "dueDate": "Vencimiento"
    };
    exportToExcel(filteredQuotas, "Cuotas_Vencidas_Audit", columnMap);
  };

  const activeFiltersArr = useMemo(() => {
    const caps = [];
    if (filters.searchTerm) caps.push({ key: 'searchTerm', label: 'Búsqueda', value: filters.searchTerm });
    if (filters.dueDate) caps.push({ key: 'dueDate', label: 'Vencimiento', value: dayjs(filters.dueDate).format('DD/MM/YYYY') });
    return caps;
  }, [filters]);

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Cuotas Vencidas"
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
            label: "Total Vencidas",
            value: filteredQuotas.length,
            icon: AlertCircle,
            variant: "primary"
          },
          {
            label: "Deuda Estimada",
            value: `$${totalMoroso.toLocaleString('es-AR')}`,
            icon: TrendingDown,
            variant: "primary"
          }
        ]}
      />

      <div className="pb-10 flex-1 flex flex-col min-h-0">
        <Card padding="p-0" className="flex-1 flex flex-col min-h-0 shadow-sm border-slate-200/60 overflow-visible bg-white">
          <div className="flex items-center justify-between elite-audit-bar px-6">
            <div className="flex-1 min-h-[32px]">
              <FilterBar
                variant="slim"
                activeFilters={activeFiltersArr}
                onRemoveFilter={(key) => setFilters(prev => ({ ...prev, [key]: "" }))}
                onClearFilters={handleClearFilters}
                title="Panel de filtros"
              >
                <div className="flex-1 max-w-md">
                  <InputField
                    icon={Search}
                    placeholder="Buscar por Cartón, Vendedor o Asociado..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(p => ({ ...p, searchTerm: e.target.value }))}
                    className="!space-y-0"
                  />
                </div>
                <div className="w-[160px]">
                  <InputField
                    type="date"
                    icon={Calendar}
                    value={filters.dueDate}
                    onChange={(e) => setFilters(p => ({ ...p, dueDate: e.target.value }))}
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
            {filteredQuotas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Database className="w-12 h-12 text-slate-100 mb-4" />
                <h3 className="text-sm font-bold text-slate-400 font-manrope tracking-tight">No se detectaron cuotas vencidas bajo este criterio</h3>
              </div>
            ) : (
              <Table className="overflow-hidden">
                <THead>
                  {visibleColumns.map(col => (
                    <TH key={col.id} className={col.id === 'actions' || col.id === 'amount' ? 'text-right px-10 font-black' : ''}>{col.label}</TH>
                  ))}
                </THead>
                <TBody>
                  {filteredQuotas.map(quota => (
                    <TR key={quota._id} className="group transition-all duration-300">
                      {visibleColumns.map(col => {
                        if (col.id === 'stock') return (
                          <StockCell
                            key={col.id}
                            main={`Cartón #${quota.sale?.bingoCard?.number || "S/N"}`}
                            sub={quota.sale?.edition?.name || "Sin edición"}
                          />
                        );
                        if (col.id === 'quotaNumber') return (
                          <TD key={col.id} className="text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-black text-slate-600 shadow-sm">
                              <Hash size={10} className="text-primary/40" />
                              {quota.quotaNumber}
                            </span>
                          </TD>
                        );
                        if (col.id === 'seller') return (
                          <UserCell
                            key={col.id}
                            variant="secondary"
                            name={quota.sale?.seller?.person ? `${quota.sale.seller.person.firstName} ${quota.sale.seller.person.lastName}` : "No asig."}
                          />
                        );
                        if (col.id === 'client') return (
                          <UserCell
                            key={col.id}
                            variant="primary"
                            name={quota.sale?.client?.person ? `${quota.sale.client.person.lastName} ${quota.sale.client.person.firstName}` : "S/D"}
                            sub={quota.sale?.client?.person?.city || "Sin localidad"}
                          />
                        );
                        if (col.id === 'amount') return <AmountCell key={col.id} value={quota.amount} />;
                        if (col.id === 'dueDate') return (
                          <TD key={col.id} className="text-[11px] font-black text-red-600 tracking-tighter bg-red-50/20 px-3">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={10} />
                              {dayjs.utc(quota.dueDate).format("DD/MM/YYYY")}
                            </span>
                          </TD>
                        );
                        if (col.id === 'actions') return (
                          <TD key={col.id} className="text-right px-10 bg-slate-50/10">
                            <div className="flex justify-end transition-all">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => openModal(quota)}
                                icon={CreditCard}
                                className="shadow-sm"
                              >
                                Registrar pago
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

          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 rounded-b-[32px]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-6">
              Elite 2026 Morosity Analytics
            </span>
          </div>
        </Card>
      </div>

      {/* Modal */}
      {selectedQuota && (
        <QuotaPaymentModal
          isOpen={isModalOpen}
          quota={selectedQuota}
          onClose={handleCloseModal}
          onSave={handleSaveQuota}
        />
      )}
    </div>
  );
}

export default ExpiredQuotasPage;
