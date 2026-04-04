import { useEffect, useState, useMemo } from "react";
import { useBingoCards } from "../../context/BingoCardContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import { 
  Ticket, 
  Search, 
  FileSpreadsheet, 
  ExternalLink, 
  User as UserIcon,
  Tag,
  CheckCircle2,
  Clock,
  FilterX,
  Loader2
} from "lucide-react";

// Infraestructura Premium 2026
import { useEditionFilter } from "../../context/EditionFilterContext";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import InputField from "../../components/ui/InputField";
import FilterBar from "../../components/ui/FilterBar";
import { Table, THead, TBody, TH, TD } from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { exportToExcel } from "../../libs/excelExport";
import { useFeedback } from "../../context/FeedbackContext";
// Se renombra a EliteSelect para evitar conflictos de identificación con Babel/Vite
import EliteSelect from "../../components/ui/Select";

/**
 * BingoCardPage V4.9 - Unificación de Interfaz
 * Inventario de cartones integrado al sistema de FilterBar oficial.
 */
export default function BingoCardPage() {
  const { getBingoCardsWithSales, bingoCardsWithSales, loading } = useBingoCards();
  const { user } = useAuth();
  const { selectedEdition } = useEditionFilter();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

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

    if (globalSearch) {
      const search = globalSearch.toLowerCase();
      filtered = filtered.filter(card => {
        const cardNumber = String(card.number);
        const sellerName = card.seller?.person 
          ? `${card.seller.person.firstName} ${card.seller.person.lastName}`.toLowerCase() 
          : "";
        const clientName = card.sale?.client
          ? `${card.sale.client.firstName} ${card.sale.client.lastName}`.toLowerCase()
          : "";
        
        return cardNumber.includes(search) || sellerName.includes(search) || clientName.includes(search);
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
        return saleDate && dayjs.utc(saleDate).format("YYYY-MM-DD") === dateFilter;
      });
    }

    return filtered;
  }, [bingoCardsWithSales, globalSearch, statusFilter, assignmentFilter, dateFilter, selectedEdition]);

  const handleExport = () => {
    const columnMap = {
      "edition.name": "Edición",
      "number": "N° Cartón",
      "status": "Estado",
      "seller.person.firstName": "Vendedor",
      "sale.client.firstName": "Asociado",
      "sale.saleDate": "Fecha Venta"
    };
    exportToExcel(filteredCards, "Inventario_Cartones_Tombola", columnMap);
    showToast("Exportando inventario filtrado...", "info");
  };

  const clearFilters = () => {
    setGlobalSearch("");
    setStatusFilter("all");
    setAssignmentFilter("all");
    setDateFilter("");
    showToast("Filtros restablecidos", "info");
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700">
      
      <PageHeader
        title="Inventario de Cartones"
        subtitle="Monitoreo de estado, asignaciones y trazabilidad de ventas en tiempo real."
        breadcrumbs={[{ label: "Cartones", href: "#" }]}
        actions={[
          {
            label: "Exportar",
            icon: FileSpreadsheet,
            variant: "ghost",
            onClick: handleExport
          }
        ]}
      />

      <div className="pb-24">
        
        <FilterBar>
          <div className="flex-1 min-w-[280px]">
             <InputField
               label="Búsqueda Inteligente"
               placeholder="Nro, Vendedor o Asociado..."
               icon={Search}
               value={globalSearch}
               onChange={(e) => setGlobalSearch(e.target.value)}
             />
          </div>

          <div className="w-[180px]">
            <EliteSelect
              label="Filtrar Estado"
              options={[
                { value: "all", label: "Todos los Estados" },
                { value: "Sorteando", label: "🟡 Vendido" },
                { value: "Disponible", label: "🟢 Disponible" },
                { value: "Cancelado", label: "🔴 Cancelado" }
              ]}
              value={{ 
                value: statusFilter, 
                label: statusFilter === "all" ? "Todos los Estados" : statusFilter === "Sorteando" ? "🟡 Vendido" : statusFilter === "Disponible" ? "🟢 Disponible" : "🔴 Cancelado"
              }}
              onChange={(selected) => setStatusFilter(selected.value)}
              isSearchable={false}
            />
          </div>

          <div className="w-[180px]">
            <EliteSelect
              label="Asignación"
              options={[
                { value: "all", label: "Sin Filtrar" },
                { value: "assigned", label: "Con Vendedor" },
                { value: "unassigned", label: "Sin Vendedor" }
              ]}
              value={{ 
                value: assignmentFilter, 
                label: assignmentFilter === "all" ? "Sin Filtrar" : assignmentFilter === "assigned" ? "Con Vendedor" : "Sin Vendedor" 
              }}
              onChange={(selected) => setAssignmentFilter(selected.value)}
              isSearchable={false}
            />
          </div>

          <div className="w-[160px]">
            <InputField
              label="Fecha de Venta"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <Button 
            variant="ghost" 
            className="h-12 px-5 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-black text-[10px] uppercase tracking-widest gap-2" 
            onClick={clearFilters}
          >
             <FilterX size={16} />
             Limpiar
          </Button>
        </FilterBar>

        <Card padding="p-0 overflow-hidden">
          {loading ? (
             <div className="py-40 flex flex-col items-center gap-6">
                <Loader2 className="animate-spin text-primary opacity-20" size={64} />
                <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Refrescando Inventario...</p>
             </div>
          ) : (
            <>
              <Table>
                <THead>
                  <TH>Cartón</TH>
                  <TH>Estado</TH>
                  <TH>Vendedor</TH>
                  <TH>Asociado</TH>
                  <TH>Fecha</TH>
                  <TH className="text-right px-8">ACCIONES</TH>
                </THead>
                <TBody>
                  {filteredCards.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-20 text-center text-slate-300 font-medium italic">Sin resultados para tu búsqueda actual</td>
                    </tr>
                  ) : (
                    filteredCards.map((card) => (
                      <tr key={card._id} className="group hover:bg-slate-50/40 transition-all duration-300">
                        <TD>
                          <div className="flex items-center gap-4">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner group-hover:rotate-6 transition-all ${
                              card.status === "Vendido" ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-indigo-50 text-indigo-500 border-indigo-100"
                            }`}>
                              <Ticket size={16} />
                            </div>
                            <div>
                              <div className="font-black text-primary text-[13px] tracking-tight leading-none mb-1">
                                No. {card.number}
                              </div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                {card.edition?.name || "Global"}
                              </div>
                            </div>
                          </div>
                        </TD>
                        <TD>
                          <Badge variant={card.status === "Vendido" ? "success" : "secondary"} className="gap-1.5 px-3 h-6">
                             {card.status === "Vendido" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                             <span className="text-[10px] tracking-tight">{card.status}</span>
                          </Badge>
                        </TD>
                        <TD>
                           <div className="flex items-start gap-2 max-w-[180px]">
                              <UserIcon size={12} className="text-slate-300 mt-1 shrink-0" />
                              <span className="text-[12px] font-bold text-slate-600 leading-tight">
                                {card.seller?.person ? `${card.seller.person.firstName} ${card.seller.person.lastName}` : <span className="text-slate-300 font-normal">No asignado</span>}
                              </span>
                           </div>
                        </TD>
                        <TD>
                           <div className="flex items-start gap-2 max-w-[180px]">
                              <Tag size={12} className={`shrink-0 mt-1 ${card.status === "Vendido" ? "text-indigo-300" : "text-slate-200"}`} />
                              <span className={`text-[12px] font-bold leading-tight ${card.status === "Vendido" ? "text-slate-700" : "text-slate-300 font-normal"}`}>
                                {card.sale?.client ? `${card.sale.client.firstName} ${card.sale.client.lastName}` : "—"}
                              </span>
                           </div>
                        </TD>
                        <TD>
                          <div className={`text-[12px] font-bold ${card.status === "Vendido" ? "text-slate-600" : "text-slate-300 font-normal"}`}>
                             {card.sale?.saleDate ? dayjs.utc(card.sale.saleDate).format('DD/MM/YYYY') : "—"}
                          </div>
                        </TD>
                        <TD className="text-right px-8">
                          {card.status === "Vendido" ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary hover:bg-primary/10 rounded-xl px-4 h-8" 
                              onClick={() => navigate(`/sale/view/${card.sale?._id}`)} 
                              icon={ExternalLink}
                            >
                              Ver Operación
                            </Button>
                          ) : (
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.1em] pr-2">
                               Disponible
                            </span>
                          )}
                        </TD>
                      </tr>
                    ))
                  )}
                </TBody>
              </Table>
              <Pagination totalItems={filteredCards.length} className="bg-white/50 backdrop-blur" />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
