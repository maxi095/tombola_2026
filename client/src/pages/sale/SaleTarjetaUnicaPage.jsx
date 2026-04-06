import { useEffect, useState, useMemo } from "react";
import { useSales } from "../../context/SaleContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import { 
  Search, 
  Calendar, 
  FilterX, 
  CreditCard, 
  DollarSign, 
  ListOrdered, 
  ExternalLink,
  FileSpreadsheet 
} from "lucide-react";

import { useEditionFilter } from "../../context/EditionFilterContext";
import { useLayout } from "../../context/LayoutContext";
import { useFeedback } from "../../context/FeedbackContext";
import { exportToExcel } from "../../libs/excelExport";

// Componentes UI Elite
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

function SaleTarjetaUnicaPage() {
  const { getSales, sales } = useSales();
  const { user } = useAuth();
  const { selectedEdition } = useEditionFilter();
  const { isFilterExpanded, toggleFilters } = useLayout();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    saleNumber: "",
    date: ""
  });
  const [filteredSales, setFilteredSales] = useState([]);

  // 1) Cargar todas las ventas al montar
  useEffect(() => {
    if (user) {
      getSales().catch(err => console.error("Error fetching sales:", err));
    }
  }, [getSales, user]);

  // 2) Aplicar filtros cada vez que cambien ventas o filtros
  useEffect(() => {
    let filtered = Array.isArray(sales) ? sales : [];
    
    // Solo las pagadas con Tarjeta
    filtered = filtered.filter(s => s.fullPaymentMethod === "Tarjeta");

    if (selectedEdition) {
      filtered = filtered.filter(s =>
        s.edition?._id === selectedEdition
      );
    }
    if (filters.saleNumber) {
      filtered = filtered.filter(s =>
        s.saleNumber?.toString().includes(filters.saleNumber)
      );
    }
    if (filters.date) {
      filtered = filtered.filter(s => {
        const formatted = dayjs(s.saleDate).format("YYYY-MM-DD");
        return formatted === filters.date;
      });
    }

    setFilteredSales(filtered);
  }, [sales, filters, selectedEdition]);

  // 3) Cálculo del KPI Dinámico
  const totalOperated = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      const amount = sale.cardPaymentDetails?.cardAmount || 0;
      return acc + amount;
    }, 0);
  }, [filteredSales]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ saleNumber: "", date: "" });
  };

  // 4) Lógica de Exportación
  const handleExport = () => {
    const columnMap = {
      "saleNumber": "Nro Venta",
      "edition.name": "Edición",
      "bingoCard.number": "Nro Cartón",
      "seller.person.firstName": "Vendedor",
      "client.person.firstName": "Asociado",
      "saleDate": "Fecha",
      "cardPaymentDetails.cardAmount": "Importe",
      "cardPaymentDetails.cardHolder": "Titular",
      "cardPaymentDetails.cardNumber": "Tarjeta",
      "cardPaymentDetails.cardPlan": "Plan",
      "cardPaymentDetails.authCode": "Autorización"
    };

    exportToExcel(filteredSales, "Ventas_Tarjeta_Unica_2026", columnMap);
    showToast("Exportando auditoría de tarjetas...", "info");
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Gestión de Ventas"
        subtitle="Auditoría de Pagos con Tarjeta Única"
        breadcrumbs={[{ label: "Ventas", href: "/sales" }, { label: "Tarjeta Única", href: "/sales/tarjeta-unica" }]}
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
            label: "Ventas Registradas",
            value: filteredSales.length,
            icon: ListOrdered,
            variant: "primary"
          }
        ]}
      />

      <div className="pb-8 flex-1 flex flex-col min-h-0">
        <FilterBar
          isExpanded={isFilterExpanded}
          onToggle={toggleFilters}
          activeFiltersCount={Object.values(filters).filter(f => f !== "").length}
          rightContent={
            <Button
              variant="ghost"
              size="sm"
              icon={FilterX}
              onClick={handleClearFilters}
              className="text-[10px] uppercase font-black tracking-widest h-9"
            >
              Limpiar
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
            <InputField
              label="N° DE VENTA"
              placeholder="Buscar por nro..."
              icon={Search}
              value={filters.saleNumber}
              onChange={(e) => handleFilterChange("saleNumber", e.target.value)}
            />
            <InputField
              label="FECHA VENTA"
              type="date"
              icon={Calendar}
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
            />
          </div>
        </FilterBar>

        {filteredSales.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
              <CreditCard className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-1">Sin movimientos registrados</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              No hay ventas con Tarjeta Única registradas bajo estos criterios.
            </p>
          </Card>
        ) : (
          <Card padding="p-0 overflow-hidden" className="flex-1 flex flex-col min-h-0 shadow-sm border-slate-200/60">
            <div className="overflow-auto flex-1 custom-scrollbar">
              <Table>
                <THead>
                  <TH className="w-[100px]">N° VENTA</TH>
                  <TH>CARTÓN / EDICIÓN</TH>
                  <TH>VENDEDOR</TH>
                  <TH>ASOCIADO / LOCALIDAD</TH>
                  <TH className="w-[110px]">FECHA</TH>
                  <TH className="text-right">IMPORTE</TH>
                  <TH>TITULAR</TH>
                  <TH>N° TARJETA</TH>
                  <TH className="w-[70px]">PLAN</TH>
                  <TH>AUTORIZACIÓN</TH>
                  <TH className="w-[120px] text-right px-8">ACCIONES</TH>
                </THead>
                <TBody>
                  {filteredSales.map(sale => {
                    const d = sale.cardPaymentDetails || {};
                    return (
                      <TR key={sale._id}>
                        <OperationCell number={sale.saleNumber} />
                        
                        <StockCell 
                          main={sale.bingoCard?.number || "S/N"} 
                          sub={sale.edition?.name || "Global"} 
                        />

                        <UserCell 
                          variant="secondary"
                          name={sale.seller?.person ? `${sale.seller.person.firstName} ${sale.seller.person.lastName}` : "No asig."}
                        />

                        <UserCell 
                          variant="primary"
                          name={sale.client?.person ? `${sale.client.person.lastName} ${sale.client.person.firstName}` : "S/D"}
                          sub={sale.client?.person?.city || "Sin localidad"}
                        />

                        <TD className="text-xs font-black text-slate-500">
                          {dayjs(sale.saleDate).format("DD/MM/YYYY")}
                        </TD>

                        <AmountCell value={d.cardAmount} />

                        <TD className="text-xs font-bold text-slate-600 whitespace-nowrap min-w-[140px]">
                          {d.cardHolder || "-"}
                        </TD>
                        <TD className="text-[11px] font-mono text-slate-500 tracking-tighter">
                          {d.cardNumber || "-"}
                        </TD>
                        <TD className="text-center font-bold text-slate-600">
                          {d.cardPlan || "-"}
                        </TD>
                        <TD className="text-xs font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded">
                          {d.authCode || "-"}
                        </TD>
                        <TD className="text-right px-8">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-slate-50 hover:bg-primary hover:text-white group transition-all duration-300"
                              onClick={() => navigate(`/sale/view/${sale._id}`)}
                              icon={ExternalLink}
                            >
                              Detalle
                            </Button>
                          </div>
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default SaleTarjetaUnicaPage;
