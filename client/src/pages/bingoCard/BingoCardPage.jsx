import { useEffect, useState, useMemo, useCallback } from "react";
import { useBingoCards } from "../../context/BingoCardContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import {
  Ticket,
  Search,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  Clock,
  Loader2,
  Calendar,
  Settings2,
  ChevronDown,
  Database,
  ArrowRightLeft,
  UserX
} from "lucide-react";

// Infraestructura Premium 2026 ⚓ 🛡️
import { useEditionFilter } from "../../context/EditionFilterContext";
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
  StockCell,
  UserCell
} from "../../components/ui/Table";
import ColumnPicker from "../../components/ui/ColumnPicker";
import { exportToExcel } from "../../libs/excelExport";
import { useFeedback } from "../../context/FeedbackContext";
import EliteSelect from "../../components/ui/Select";

// HOOK DE LAYOUT DINÁMICO v19.5 ✨💎🚀
import { useTableColumns } from "../../hooks/useTableColumns";

/**
 * BingoCardPage V19.5.4 - Polished Audit Hub 🏹⚖️✨💎🚀
 * Refinamiento visual de badges y placeholders unificados.
 */
export default function BingoCardPage() {
  const { getBingoCardsWithSales, bingoCardsWithSales, loading } = useBingoCards();
  const { user } = useAuth();
  const { selectedEdition } = useEditionFilter();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [omniSearch, setOmniSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // CONFIGURACIÓN DE COLUMNAS v19.5.4 (Audit Sync) 🛡️
  const initialColumns = [
    { id: 'card', label: 'CARTÓN / EDICIÓN', isMandatory: true },
    { id: 'status', label: 'ESTADO' },
    { id: 'assignedTo', label: 'ASIGNADO A...', isMandatory: true },
    { id: 'soldBy', label: 'VENDIDO POR' },
    { id: 'associate', label: 'ASOCIADO / LOCALIDAD', isMandatory: true },
    { id: 'date', label: 'FECHA VENTA' },
    { id: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }
  ];

  const columnManager = useTableColumns("BingoCardsCrossAuditPage_v4", initialColumns);
  const { visibleColumns } = columnManager;

  useEffect(() => {
    if (user) {
      getBingoCardsWithSales();
    }
  }, [getBingoCardsWithSales, user]);

  const filteredCards = useMemo(() => {
    let filtered = bingoCardsWithSales || [];

    if (selectedEdition) {
      filtered = filtered.filter(card => card.edition?._id === selectedEdition);
    }

    if (omniSearch) {
      const search = omniSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      filtered = filtered.filter(card => {
        const cardNumber = String(card.number);
        const assignedSeller = card.seller?.person
          ? `${card.seller.person.firstName} ${card.seller.person.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          : "";
        const saleSeller = card.sale?.seller?.fullName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
        const clientName = card.sale?.client?.fullName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";

        return cardNumber.includes(search) || assignedSeller.includes(search) || saleSeller.includes(search) || clientName.includes(search);
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(card => card.status === statusFilter);
    }

    if (assignmentFilter === "assigned") {
      filtered = filtered.filter(card => !!card.seller);
    } else if (assignmentFilter === "unassigned") {
      filtered = filtered.filter(card => !card.seller);
    }

    if (dateFilter) {
      filtered = filtered.filter(card => {
        const saleDate = card.sale?.saleDate;
        return saleDate && dayjs(saleDate).format("YYYY-MM-DD") === dateFilter;
      });
    }

    return filtered;
  }, [bingoCardsWithSales, omniSearch, statusFilter, assignmentFilter, dateFilter, selectedEdition]);

  const activeFilters = useMemo(() => {
    const list = [];
    if (omniSearch) list.push({ key: 'search', label: 'Búsqueda', value: omniSearch });
    if (statusFilter !== 'all') list.push({ key: 'status', label: 'Estado', value: statusFilter });
    if (assignmentFilter !== 'all') list.push({ key: 'assignment', label: 'Asignación', value: assignmentFilter === 'assigned' ? 'Con Vendedor' : 'Sin Vendedor' });
    if (dateFilter) list.push({ key: 'date', label: 'Fecha', value: dayjs(dateFilter).format('DD/MM/YYYY') });
    return list;
  }, [omniSearch, statusFilter, assignmentFilter, dateFilter]);

  const handleRemoveFilter = useCallback((key) => {
    if (key === 'search') setOmniSearch("");
    if (key === 'status') setStatusFilter("all");
    if (key === 'assignment') setAssignmentFilter("all");
    if (key === 'date') setDateFilter("");
  }, []);

  const handleClearFilters = useCallback(() => {
    setOmniSearch("");
    setStatusFilter("all");
    setAssignmentFilter("all");
    setDateFilter("");
    showToast("Inventario restablecido", "info");
  }, [showToast]);

  const handleExport = () => {
    const columnMap = {
      "edition.name": "Edición",
      "number": "N° Cartón",
      "status": "Estado",
      "seller.person.lastName": "Asignado a",
      "sale.seller.fullName": "Vendido por",
      "sale.client.fullName": "Asociado",
      "sale.client.city": "Localidad",
      "sale.saleDate": "Fecha"
    };
    exportToExcel(filteredCards, "Auditoria_Inventario_Bingo", columnMap);
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Inventario de Cartones"
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
            label: "Volumen Auditoría",
            value: filteredCards.length,
            icon: ArrowRightLeft,
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
                activeFilters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearFilters={handleClearFilters}
                title="Panel de filtros"
              >
                <div className="flex-1 min-w-[300px]">
                  <InputField
                    placeholder="Buscar por Nro, Vendedor o Asociado..."
                    icon={Search}
                    value={omniSearch}
                    onChange={(e) => setOmniSearch(e.target.value)}
                    className="!space-y-0"
                  />
                </div>

                <div className="w-[180px]">
                  <EliteSelect
                    options={[
                      { value: "all", label: "Todos los Vendedores" },
                      { value: "assigned", label: "Asignados" },
                      { value: "unassigned", label: "Sin Asignar" }
                    ]}
                    value={{
                      value: assignmentFilter,
                      label: assignmentFilter === "all" ? "Vendedores: Todos" : (assignmentFilter === "assigned" ? "✅ Asignados" : "❌ Sin Asignar")
                    }}
                    onChange={(selected) => setAssignmentFilter(selected.value)}
                    isSearchable={false}
                  />
                </div>

                <div className="w-[180px]">
                  <EliteSelect
                    options={[
                      { value: "all", label: "Todos los Estados" },
                      { value: "Vendido", label: "Vendido" },
                      { value: "Disponible", label: "Disponible" }
                    ]}
                    value={{ value: statusFilter, label: statusFilter === "all" ? "Estados: Todos" : (statusFilter === "Vendido" ? "🟡 Vendido" : "🟢 Disponible") }}
                    onChange={(selected) => setStatusFilter(selected.value)}
                    isSearchable={false}
                  />
                </div>

                <div className="w-[180px]">
                  <InputField
                    type="date"
                    icon={Calendar}
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
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
              <div className="py-40 flex flex-col items-center gap-6">
                <Loader2 className="animate-spin text-primary opacity-20" size={64} />
                <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Cruzando Datos...</p>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-300 italic">
                <Database className="w-12 h-12 text-slate-100 mb-4" />
                <h3 className="text-sm font-bold text-slate-400 font-manrope tracking-tight">Sin registros para esta auditoría</h3>
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="mt-4">Limpiar Filtros</Button>
              </div>
            ) : (
              <Table className="overflow-hidden">
                <THead>
                  {visibleColumns.map(col => (
                    <TH key={col.id} className={col.id === 'actions' ? 'text-right px-10 font-black' : ''}>{col.label}</TH>
                  ))}
                </THead>
                <TBody>
                  {filteredCards.map((card) => (
                    <TR key={card._id} className="group transition-all duration-300">
                      {visibleColumns.map(col => {
                        if (col.id === 'card') return (
                          <StockCell
                            key={col.id}
                            main={`Cartón #${card.number}`}
                            sub={card.edition?.name || "Global"}
                          />
                        );
                        if (col.id === 'status') return (
                          <TD key={col.id}>
                            <Badge variant={card.status === "Vendido" ? "success" : "secondary"} className="gap-2 px-3 h-6">
                              {card.status === "Vendido" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                              <span className="text-[10px] uppercase font-black tracking-widest">{card.status}</span>
                            </Badge>
                          </TD>
                        );
                        if (col.id === 'assignedTo') return (
                          <TD key={col.id}>
                            {card.seller?.person ? (
                              <UserCell
                                variant="secondary"
                                name={`${card.seller.person.firstName} ${card.seller.person.lastName}`}
                              />
                            ) : (
                              <Badge variant="ghost" className="bg-amber-50 border-amber-100/50 text-amber-600/80 font-black tracking-[0.1em] text-[9px] gap-1.5 px-3 uppercase">
                                <UserX size={10} />
                                Sin Asignar
                              </Badge>
                            )}
                          </TD>
                        );
                        if (col.id === 'soldBy') return (
                          <TD key={col.id}>
                            {card.status === "Vendido" ? (
                              <UserCell
                                variant="secondary"
                                name={card.sale?.seller?.fullName || "—"}
                              />
                            ) : (
                              <span className="text-slate-200 pl-6">—</span>
                            )}
                          </TD>
                        );
                        if (col.id === 'associate') return (
                          <TD key={col.id}>
                            {card.status === "Vendido" ? (
                              <UserCell
                                name={card.sale?.client?.fullName || "REVISAR VENTA"}
                                sub={card.sale?.client?.city || "Sin localidad"}
                                variant="primary"
                              />
                            ) : (
                              <span className="text-slate-200 pl-6">—</span>
                            )}
                          </TD>
                        );
                        if (col.id === 'date') return (
                          <TD key={col.id} className="text-xs font-black text-slate-500">
                            {card.sale?.saleDate ? dayjs(card.sale.saleDate).format('DD/MM/YYYY') : "—"}
                          </TD>
                        );
                        if (col.id === 'actions') return (
                          <TD key={col.id} className="text-right px-10 bg-slate-50/10">
                            <div className="flex justify-end transition-all">
                              {card.status === "Vendido" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/sale/view/${card.sale?._id}`)}
                                  icon={ExternalLink}
                                >
                                  Detalle
                                </Button>
                              ) : (
                                <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest leading-none pr-3">
                                  No Disponible
                                </span>
                              )}
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
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">
              Elite Cross-Audit Center v19.5
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
