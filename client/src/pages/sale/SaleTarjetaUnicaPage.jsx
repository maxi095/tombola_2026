import { useEffect, useState, useMemo, useCallback } from "react";
import { useSales } from "../../context/SaleContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import {
  Calendar,
  CreditCard,
  DollarSign,
  ListOrdered,
  ExternalLink,
  FileSpreadsheet,
  Search,
  Settings2,
  ChevronDown,
  Loader2
} from "lucide-react";

import { useEditionFilter } from "../../context/EditionFilterContext";
import { useFeedback } from "../../context/FeedbackContext";
import { exportToExcel } from "../../libs/excelExport";

// Infraestructura Premium 2026 ⚓ 🛡️
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import Badge from "../../components/ui/Badge";
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

// HOOK DE LAYOUT DINÁMICO v17.1 ✨💎🚀
import { useTableColumns } from "../../hooks/useTableColumns";

/**
 * SaleTarjetaUnicaPage V4.6 - Financial Audit Elite 🏹⚖️✨💎🚀
 * Sincronizado con Estándar Elite 2026 y Columnas Dinámicas.
 */
function SaleTarjetaUnicaPage() {
  const { getSales, sales, loading } = useSales();
  const { user } = useAuth();
  const { selectedEdition } = useEditionFilter();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    omniSearch: "",
    date: ""
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // CONFIGURACIÓN DE COLUMNAS v4.6 🛡️
  const initialColumns = [
    { id: 'saleNumber', label: 'NRO VENTA', isMandatory: true },
    { id: 'carton', label: 'CARTÓN / EDICIÓN' },
    { id: 'seller', label: 'VENDEDOR' },
    { id: 'associate', label: 'ASOCIADO / LOCALIDAD' },
    { id: 'date', label: 'FECHA' },
    { id: 'amount', label: 'IMPORTE' },
    { id: 'holder', label: 'TITULAR' },
    { id: 'cardNumber', label: 'N° TARJETA' },
    { id: 'plan', label: 'PLAN' },
    { id: 'authCode', label: 'AUTORIZACIÓN' },
    { id: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }
  ];

  const columnManager = useTableColumns("SaleTarjetaUnicaPage", initialColumns);
  const { visibleColumns } = columnManager;

  useEffect(() => {
    if (user) {
      getSales().catch(err => console.error("Error fetching sales:", err));
    }
  }, [getSales, user]);

  const filteredSales = useMemo(() => {
    let filtered = Array.isArray(sales) ? sales : [];
    filtered = filtered.filter(s => s.fullPaymentMethod === "Tarjeta");

    if (selectedEdition) {
      filtered = filtered.filter(s => s.edition?._id === selectedEdition);
    }

    if (filters.omniSearch) {
      const search = filters.omniSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      filtered = filtered.filter(s => {
        const associateName = s.client?.person ? `${s.client.person.firstName} ${s.client.person.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
        const city = (s.client?.person?.city || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cardNumber = String(s.bingoCard?.number || "");
        const sellerName = s.seller?.person ? `${s.seller.person.firstName} ${s.seller.person.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
        const saleNum = String(s.saleNumber || "");
        const cardHolder = (s.cardPaymentDetails?.cardHolder || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        return associateName.includes(search) || city.includes(search) || cardNumber.includes(search) || sellerName.includes(search) || saleNum.includes(search) || cardHolder.includes(search);
      });
    }

    if (filters.date) {
      filtered = filtered.filter(s => dayjs(s.saleDate).format("YYYY-MM-DD") === filters.date);
    }

    return filtered;
  }, [sales, filters, selectedEdition]);

  const activeFiltersArr = useMemo(() => {
    const caps = [];
    if (filters.omniSearch) caps.push({ key: 'omniSearch', label: 'Búsqueda', value: filters.omniSearch });
    if (filters.date) caps.push({ key: 'date', label: 'Fecha', value: dayjs(filters.date).format('DD/MM/YYYY') });
    return caps;
  }, [filters]);

  const handleRemoveFilter = useCallback((key) => {
    setFilters(prev => ({ ...prev, [key]: "" }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ omniSearch: "", date: "" });
    showToast("Auditoría restablecida", "info");
  }, [showToast]);

  const totalOperated = useMemo(() => {
    return filteredSales.reduce((acc, sale) => acc + (sale.cardPaymentDetails?.cardAmount || 0), 0);
  }, [filteredSales]);

  const handleExport = () => {
    const columnMap = { "saleNumber": "Nro Venta", "edition.name": "Edición", "bingoCard.number": "Nro Cartón", "seller.person.firstName": "Vendedor", "client.person.firstName": "Asociado", "saleDate": "Fecha", "cardPaymentDetails.cardAmount": "Importe", "cardPaymentDetails.cardHolder": "Titular", "cardPaymentDetails.cardNumber": "Tarjeta", "cardPaymentDetails.cardPlan": "Plan", "cardPaymentDetails.authCode": "Autorización" };
    exportToExcel(filteredSales, "Audit_Tarjeta_Unica", columnMap);
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Tarjeta Única"
        breadcrumbs={[{ label: "Tarjeta Única", href: "/sales/tarjeta-unica" }]}
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
            label: "Importe Total",
            value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(totalOperated),
            icon: DollarSign,
            variant: "success"
          },
          {
            label: "Operaciones",
            value: filteredSales.length,
            icon: ListOrdered,
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
                onRemoveFilter={handleRemoveFilter}
                onClearFilters={handleClearFilters}
                title="Panel de filtros"
              >
                <div className="flex-1 min-w-[280px]">
                  <InputField
                    icon={Search}
                    placeholder="Cartón, Vendedor, Asociado o Titular de tarjeta..."
                    value={filters.omniSearch}
                    onChange={(e) => setFilters(p => ({ ...p, omniSearch: e.target.value }))}
                    className="!space-y-0"
                  />
                </div>

                <div className="w-[180px]">
                  <InputField
                    type="date"
                    icon={Calendar}
                    value={filters.date}
                    onChange={(e) => setFilters(p => ({ ...p, date: e.target.value }))}
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

          <div className="overflow-auto flex-1 custom-scrollbar min-h-0">
            {loading ? (
              <div className="py-24 flex flex-col items-center gap-6">
                <Loader2 className="animate-spin text-primary opacity-20" size={64} />
                <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Analizando Transacciones...</p>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CreditCard className="w-12 h-12 text-slate-100 mb-4" />
                <h3 className="text-sm font-bold text-slate-400 font-manrope">Sin movimientos encontrados</h3>
              </div>
            ) : (
              <Table className="overflow-hidden">
                <THead>
                  {visibleColumns.map(col => (
                    <TH key={col.id} className={col.id === 'actions' || col.id === 'amount' ? 'text-right px-10 font-black' : ''}>{col.label}</TH>
                  ))}
                </THead>
                <TBody>
                  {filteredSales.map(sale => {
                    const d = sale.cardPaymentDetails || {};
                    return (
                      <TR key={sale._id} className="group transition-all duration-300">
                        {visibleColumns.map(col => {
                          if (col.id === 'saleNumber') return <OperationCell key={col.id} number={sale.saleNumber} />;
                          if (col.id === 'carton') return <StockCell key={col.id} main={`Cartón #${sale.bingoCard?.number}` || "S/N"} sub={sale.edition?.name || "Global"} />;
                          if (col.id === 'seller') return <UserCell key={col.id} variant="secondary" name={sale.seller?.person ? `${sale.seller.person.firstName} ${sale.seller.person.lastName}` : "No asig."} />;
                          if (col.id === 'associate') return <UserCell key={col.id} variant="primary" name={sale.client?.person ? `${sale.client.person.lastName} ${sale.client.person.firstName}` : "S/D"} sub={sale.client?.person?.city || "Sin localidad"} />;
                          if (col.id === 'date') return <TD key={col.id} className="text-xs font-black text-slate-500">{dayjs(sale.saleDate).format("DD/MM/YYYY")}</TD>;
                          if (col.id === 'amount') return <AmountCell key={col.id} value={d.cardAmount} />;
                          if (col.id === 'holder') return <TD key={col.id} className="text-xs font-bold text-slate-600 whitespace-nowrap">{d.cardHolder || "-"}</TD>;
                          if (col.id === 'cardNumber') return <TD key={col.id} className="text-[11px] font-mono text-slate-500 tracking-tighter">{d.cardNumber || "-"}</TD>;
                          if (col.id === 'plan') return <TD key={col.id} className="text-center font-bold text-slate-600">{d.cardPlan || "-"}</TD>;
                          if (col.id === 'authCode') return (
                            <TD key={col.id}>
                              <Badge variant="secondary" className="px-3 h-6">
                                <span className="text-[10px] font-black tracking-widest">{d.authCode || "-"}</span>
                              </Badge>
                            </TD>
                          );
                          if (col.id === 'actions') return (
                            <TD key={col.id} className="text-right px-10 bg-slate-50/10">
                              <div className="flex justify-end transition-all">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/sale/view/${sale._id}`)}
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
                    );
                  })}
                </TBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SaleTarjetaUnicaPage;
