import { useEffect, useState, useMemo } from "react";
import { useSales } from "../../context/SaleContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import {
  Plus,
  Search,
  FileSpreadsheet,
  Ban,
  ExternalLink,
  FilterX,
  Loader2,
  Ticket,
  CreditCard
} from "lucide-react";

// Infraestructura Premium 2026
import { useEditionFilter } from "../../context/EditionFilterContext";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import InputField from "../../components/ui/InputField";
import FilterBar from "../../components/ui/FilterBar";
import { Table, THead, TBody, TH, TR, TD, OperationCell, StockCell, UserCell } from "../../components/ui/Table";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useFeedback } from "../../context/FeedbackContext";
import { exportToExcel } from "../../libs/excelExport";
import EliteSelect from "../../components/ui/Select";

/**
 * SalePage V5.6 - Consola de Operaciones Administrativas
 * Gestión centralizada de ventas con Omni-Search y trazabilidad de cuotas.
 * Refactorizada con Celdas Atómicas Elite. 🏹⚖️✨💎
 */
function SalePage() {
  const { getSales, sales, cancelSale, loading } = useSales();
  const { user } = useAuth();
  const { selectedEdition } = useEditionFilter();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [omniSearch, setOmniSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState(null);

  useEffect(() => {
    if (user) {
      getSales();
    }
  }, [getSales, user]);

  const filteredSales = useMemo(() => {
    let temp = Array.isArray(sales) ? sales : [];

    if (selectedEdition) {
      temp = temp.filter(sale => sale.edition?._id === selectedEdition);
    }

    if (omniSearch) {
      const search = omniSearch.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      temp = temp.filter(sale => {
        const associateName = sale.client?.person
          ? `${sale.client.person.firstName} ${sale.client.person.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          : "";

        const city = (sale.client?.person?.city || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cardNumber = String(sale.bingoCard?.number || "");
        const sellerName = sale.seller?.person
          ? `${sale.seller.person.firstName} ${sale.seller.person.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          : "";

        return associateName.includes(search) ||
          city.includes(search) ||
          cardNumber.includes(search) ||
          sellerName.includes(search);
      });
    }

    if (statusFilter !== "all") {
      temp = temp.filter(sale => sale.status === statusFilter);
    } else {
      temp = temp.filter(sale =>
        sale.status === "Pagado" || sale.status === "Pendiente de pago" || sale.status === "Entregado sin cargo"
      );
    }

    if (dateFilter) {
      temp = temp.filter(sale => dayjs.utc(sale.saleDate).format("YYYY-MM-DD") === dateFilter);
    }

    return temp;
  }, [sales, omniSearch, statusFilter, dateFilter, selectedEdition]);

  const handleExport = () => {
    const columnMap = {
      "saleNumber": "Nro Venta",
      "edition.name": "Edición",
      "bingoCard.number": "Nro Cartón",
      "seller.person.firstName": "Vendedor",
      "client.person.firstName": "Asociado",
      "client.person.document": "DNI Asociado",
      "status": "Estado",
      "saleDate": "Fecha"
    };

    const exportData = filteredSales.map(sale => {
      const paidInstallments = (sale.installments || []).filter(i => i.status === "Pagado").length;
      const totalInstallments = (sale.installments || []).length;
      return {
        ...sale,
        "Cuotas Pagadas": paidInstallments,
        "Cuotas Totales": totalInstallments,
        "Resumen Pago": `${paidInstallments}/${totalInstallments}`
      };
    });

    const finalColumnMap = { ...columnMap, "Resumen Pago": "Estado de Cobranza" };
    exportToExcel(exportData, "Ventas_Tombola_2026", finalColumnMap);
    showToast("Exportando detalle de ventas y cobranzas...", "info");
  };

  const clearFilters = () => {
    setOmniSearch("");
    setStatusFilter("all");
    setDateFilter("");
    showToast("Filtros restablecidos", "info");
  };

  const handleCancelClick = (id) => {
    setSaleToCancel(id);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    try {
      await cancelSale(saleToCancel);
      showToast("Venta anulada correctamente", "success");
      setIsCancelModalOpen(false);
      getSales();
    } catch (error) {
      showToast("Error al anular la venta", "error");
    }
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700">
      <PageHeader
        title="Gestión de Ventas"
        subtitle="Monitoreo de cobranzas, estados de cartones y auditoría de cuotas."
        breadcrumbs={[{ label: "Ventas", href: "/sales" }]}
        actions={[
          {
            label: "Exportar",
            icon: FileSpreadsheet,
            variant: "ghost",
            onClick: handleExport
          },
          {
            label: "Crear Venta",
            icon: Plus,
            variant: "primary",
            onClick: () => navigate("/sale/new")
          }
        ]}
      />

      <div className="pb-8">
        <FilterBar>
          <div className="flex-1 min-w-[320px]">
            <InputField
              label="Búsqueda Inteligente"
              placeholder="Cartón, Vendedor, Asociado o Localidad"
              icon={Search}
              value={omniSearch}
              onChange={(e) => setOmniSearch(e.target.value)}
            />
          </div>

          <div className="w-[180px]">
            <EliteSelect
              label="Filtrar por Estado"
              options={[
                { value: "all", label: "Todas las Ventas" },
                { value: "Pendiente de pago", label: "🟡 Pendientes" },
                { value: "Pagado", label: "🟢 Pagadas" },
                { value: "Entregado sin cargo", label: "🔵 Sin Cargo" },
                { value: "Anulada", label: "🔴 Anuladas" }
              ]}
              value={{
                value: statusFilter,
                label: statusFilter === "all" ? "Todas las Ventas" : statusFilter === "Pendiente de pago" ? "🟡 Pendientes" : statusFilter === "Pagado" ? "🟢 Pagadas" : statusFilter === "Entregado sin cargo" ? "🔵 Sin Cargo" : "🔴 Anuladas"
              }}
              onChange={(selected) => setStatusFilter(selected.value)}
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
            icon={FilterX}
            className="h-12 px-5 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-black text-[10px] uppercase tracking-widest gap-2"
            onClick={clearFilters}
          >
            Limpiar
          </Button>
        </FilterBar>

        <Card padding="p-0 overflow-hidden shadow-sm border-slate-200/60">
          {loading ? (
            <div className="py-40 flex flex-col items-center gap-6">
              <Loader2 className="animate-spin text-primary opacity-20" size={64} />
              <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Sincronizando Operaciones...</p>
            </div>
          ) : (
            <Table>
              <THead>
                <TH>Nro venta</TH>
                <TH>Cartón / Edición</TH>
                <TH>Vendedor</TH>
                <TH>Asociado / Localidad</TH>
                <TH>Estado</TH>
                <TH>Fecha</TH>
                <TH className="text-right px-8">ACCIONES</TH>
              </THead>
              <TBody>
                {filteredSales.length === 0 ? (
                  <TR>
                    <TD colSpan="7" className="py-20 text-center text-slate-300 font-medium italic">Sin ventas para este criterio</TD>
                  </TR>
                ) : (
                  filteredSales.map((sale) => (
                    <TR key={sale._id}>
                      <OperationCell number={sale.saleNumber} />
                      
                      <StockCell 
                        main={sale.bingoCard?.number || "SIN Nº"} 
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

                      <TD>
                        <Badge
                          variant={
                            sale.status === "Pagado" ? "success" :
                              sale.status === "Anulada" ? "danger" :
                                sale.status === "Pendiente de pago" ? "warning" : "secondary"
                          }
                          className="gap-1.5"
                        >
                          <CreditCard size={10} />
                          {sale.status}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="text-xs font-black text-slate-500">
                          {dayjs.utc(sale.saleDate).format('DD/MM/YYYY')}
                        </div>
                      </TD>
                      <TD className="text-right px-8">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-slate-50 hover:bg-primary hover:text-white"
                            onClick={() => navigate(`/sale/view/${sale._id}`)}
                            icon={ExternalLink}
                          >
                            Detalle
                          </Button>
                          {sale.status !== "Anulada" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleCancelClick(sale._id)}
                              icon={Ban}
                            >
                              Anular
                            </Button>
                          )}
                        </div>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancel}
        title="¿Anular operación de venta?"
        message="Esta acción liberará el cartón asociado y marcará la venta como nula. Las cuotas vinculadas dejarán de ser exigibles. ¿Deseas continuar?"
        confirmLabel="Sí, anular venta"
        variant="danger"
        icon={Ban}
      />
    </div>
  );
}

export default SalePage;
