import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSellers } from "../../context/SellerContext";
import { useSales } from "../../context/SaleContext";
import { useQuotas } from "../../context/QuotaContext";
import { useBingoCards } from "../../context/BingoCardContext";
import { useSellerPayments } from "../../context/SellerPaymentContext";
import SellerPaymentReceipt from "../../components/SellerPaymentReceipt";
import ReactDOMServer from "react-dom/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  User,
  CreditCard,
  ShoppingBag,
  Receipt,
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Search,
  ExternalLink,
  MapPin,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Layers,
  Calendar,
  Loader2
} from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  OperationCell,
  UserCell,
  AmountCell,
  StockCell
} from "../../components/ui/Table";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import AssignBingoCardsModal from "../../components/AssignBingoCardsModal";
import { useEditionFilter } from "../../context/EditionFilterContext";
import { useFeedback } from "../../context/FeedbackContext";
import { formatCurrency, formatDocument } from "../../libs/formatters";

dayjs.extend(utc);

/**
 * SellerViewPage v25.0 - Elite Audit 2026 🛡️💎🚀
 * Vista de detalle 360° para vendedores con sistema de pestañas y auditoría HD.
 */
function SellerViewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useFeedback();

  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const { getSeller } = useSellers();
  const { getSalesBySeller } = useSales();
  const { getQuotasBySale } = useQuotas();
  const { getSellerPaymentsBySeller, cancelSellerPayment } = useSellerPayments();
  const { getBingoCardsBySeller, removeSellerFromBingoCard } = useBingoCards();
  const { selectedEdition } = useEditionFilter();

  const [seller, setSeller] = useState(null);
  const [sales, setSales] = useState([]);
  const [bingoCards, setBingoCards] = useState([]);
  const [sellerPayments, setSellerPayments] = useState([]);
  const [quotasBySale, setQuotasBySale] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [filterBingoCard, setFilterBingoCardNumber] = useState("");

  // Carga inicial coordinada
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [sellerData, salesData, cardsData, paymentsData] = await Promise.all([
          getSeller(id),
          getSalesBySeller(id),
          getBingoCardsBySeller(id),
          getSellerPaymentsBySeller(id)
        ]);

        setSeller(sellerData);
        setSales(salesData);
        setBingoCards(cardsData);
        setSellerPayments(paymentsData);

        // Carga diferida de cuotas para conciliación
        const quotasArray = await Promise.all(
          salesData.map((sale) => getQuotasBySale(sale._id))
        );
        const quotasMap = {};
        salesData.forEach((sale, index) => {
          quotasMap[sale._id] = quotasArray[index];
        });
        setQuotasBySale(quotasMap);
      } catch (error) {
        console.error("Error cargando datos:", error);
        showToast("Error al cargar el perfil del vendedor", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, getSeller, getSalesBySeller, getBingoCardsBySeller, getSellerPaymentsBySeller, getQuotasBySale, showToast]);

  // Filtros dinámicos por edición global
  const filteredData = useMemo(() => {
    if (loading) return { cards: [], sales: [], payments: [], quotas: {} };

    const fCards = selectedEdition
      ? bingoCards.filter(c => c.edition?._id === selectedEdition)
      : bingoCards;

    const fSales = selectedEdition
      ? sales.filter(s => s.edition?._id === selectedEdition)
      : sales;

    const fPayments = selectedEdition
      ? sellerPayments.filter(p => p.edition?._id === selectedEdition)
      : sellerPayments;

    const fQuotas = {};
    fSales.forEach(sale => {
      fQuotas[sale._id] = quotasBySale[sale._id] || [];
    });

    return { cards: fCards, sales: fSales, payments: fPayments, quotas: fQuotas };
  }, [selectedEdition, loading, bingoCards, sales, sellerPayments, quotasBySale]);

  // Cálculos financieros para KPIs
  const financialSummary = useMemo(() => {
    let salesTotal = 0;
    const { quotas, sales: fSales } = filteredData;

    for (const [saleId, qList] of Object.entries(quotas)) {
      const sale = fSales.find(s => s._id === saleId);
      if (sale && sale.status !== "Anulada") {
        salesTotal += qList.reduce((acc, q) => acc + (q.paymentDate ? q.amount : 0), 0);
      }
    }

    const totalPaidToSeller = filteredData.payments
      .filter(p => p.status !== "Anulado")
      .reduce((acc, p) => acc + (p.cashAmount || 0) + (p.transferAmount || 0) + (p.tarjetaUnicaAmount || 0) + (p.checkAmount || 0), 0);

    const totalCommission = filteredData.payments
      .filter(p => p.status !== "Anulado")
      .reduce((acc, p) => acc + (p.commissionAmount || 0), 0);

    return { salesTotal, totalPaidToSeller, totalCommission };
  }, [filteredData]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    searchParams.set("tab", tabId);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const handleRemoveSellerFromCard = async (cardId) => {
    if (window.confirm("¿Seguro que desea desasociar este cartón del vendedor?")) {
      try {
        await removeSellerFromBingoCard(cardId);
        const updatedCards = await getBingoCardsBySeller(id);
        setBingoCards(updatedCards);
        showToast("Cartón desasociado correctamente", "success");
      } catch (err) {
        showToast("Error al desasociar el cartón", "error");
      }
    }
  };

  const handleCancelPayment = async (paymentId) => {
    if (window.confirm("¿Confirmar la anulación de este pago? No se puede deshacer.")) {
      try {
        await cancelSellerPayment(paymentId);
        const updated = await getSellerPaymentsBySeller(id);
        setSellerPayments(updated);
        showToast("Pago anulado exitosamente", "success");
      } catch (err) {
        showToast("Error al anular el pago", "error");
      }
    }
  };

  const handleDownloadReceipt = async (payment) => {
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const htmlString = ReactDOMServer.renderToString(
        <SellerPaymentReceipt payment={payment} seller={seller} />
      );
      const opt = {
        margin: 0.5,
        filename: `Recibo_Vendedor_${payment.sellerPaymentNumber || "ID"}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().from(htmlString).set(opt).save();
      showToast("Recibo generado", "success");
    } catch (err) {
      showToast("Error al generar PDF", "error");
    }
  };

  if (loading && !seller) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-slate-400 font-bold animate-pulse">Sincronizando expediente del vendedor...</p>
      </div>
    );
  }

  if (!seller) return <div className="p-20 text-center text-red-500 font-bold">Vendedor no encontrado</div>;

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "cartones", label: "Cartones", icon: CreditCard },
    { id: "ventas", label: "Ventas", icon: ShoppingBag },
    { id: "pagos", label: "Historial Pagos", icon: Receipt },
  ];

  return (
    <div className="flex flex-col px-8 animate-in fade-in duration-700 bg-slate-50/10 min-h-screen pb-20">
      <PageHeader
        title={`${seller.person?.firstName} ${seller.person?.lastName}`}
        subtitle={`Vendedor N° ${seller.sellerNumber || "N/A"} • Comisión: ${seller.commissionRate || 0}%`}
        compact={true}
        breadcrumbs={[
          { label: "Vendedores", path: "/sellers" },
          { label: "Detalle" }
        ]}
        stats={[
          {
            label: "Conciliación Ventas",
            value: formatCurrency(financialSummary.salesTotal),
            icon: DollarSign,
            variant:
              Math.abs(financialSummary.totalPaidToSeller - financialSummary.salesTotal) < 0.01
                ? "success"
                : financialSummary.totalPaidToSeller < financialSummary.salesTotal
                  ? "danger"
                  : "warning"
          },
          {
            label: "Total Pagos",
            value: formatCurrency(financialSummary.totalPaidToSeller),
            icon: Briefcase,
            variant:
              Math.abs(financialSummary.totalPaidToSeller - financialSummary.salesTotal) < 0.01
                ? "success"
                : financialSummary.totalPaidToSeller < financialSummary.salesTotal
                  ? "danger"
                  : "warning"
          },
          {
            label: "Comisiones",
            value: formatCurrency(financialSummary.totalCommission),
            icon: CheckCircle2,
            variant: "primary"
          }
        ]}
        actions={[
          {
            label: "Volver",
            icon: ArrowLeft,
            variant: "ghost",
            onClick: () => navigate("/sellers")
          }
        ]}
      />

      {/* Selector de Pestañas Elite ✨ */}
      <div className="flex items-center gap-1 bg-white/50 backdrop-blur-md p-1 rounded-2xl border border-slate-200/60 mb-5 self-start shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-wider
                ${isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                  : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-700"}`}
            >
              <TabIcon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-8">

        {/* PESTAÑA: GENERAL (Ficha + KPIs) */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card title="Perfil Institucional" icon={User} size="slim" className="shadow-sm border-slate-200/60">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendedor N°</span>
                  <span className="text-sm font-bold text-primary">{seller.sellerNumber || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</span>
                  <span className="text-sm font-bold text-primary uppercase">{seller.person?.firstName} {seller.person?.lastName}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</span>
                  <span className="text-sm font-bold text-primary">{formatDocument(seller.person?.document) || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasa de Comisión</span>
                  <Badge variant="success" className="w-fit">{seller.commissionRate || 0}%</Badge>
                </div>
              </div>
            </Card>

            <Card title="Información de Contacto" icon={MapPin} size="slim" className="shadow-sm border-slate-200/60">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</span>
                  <span className="text-sm font-bold text-primary">{seller.person?.phone || "No registrado"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                  <span className="text-sm font-bold text-primary lowercase">{seller.person?.email || "Sin correo"}</span>
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domicilio / Localidad</span>
                  <span className="text-sm font-bold text-primary">
                    {seller.person?.address || "Domicilio no cargado"}, {seller.person?.city || "-"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* PESTAÑA: CARTONES */}
        {activeTab === "cartones" && (
          <Card padding="p-0" className="shadow-sm border-slate-200/60 overflow-visible">
            <div className="flex items-center justify-between p-3 px-6 border-b border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Layers className="text-primary" size={20} />
                <h3 className="text-sm font-black text-primary uppercase tracking-wider">Cartones Relacionados</h3>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                  {filteredData.cards.length}
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsAssignModalOpen(true)}
              >
                Relacionar cartón
              </Button>
            </div>

            <Table className="shadow-sm border-slate-200/60 transition-all duration-500 overflow-hidden">
              <THead>
                <TH>Cartón / Edición</TH>
                <TH>Estado</TH>
                <TH className="text-right px-6">Acciones</TH>
              </THead>
              <TBody>
                {filteredData.cards.map((card) => (
                  <TR key={card._id}>
                    <StockCell main={`Cartón #${card.number}`} sub={card.edition?.name || "Sin edición"} />
                    <TD>
                      <Badge variant={card.status === "Vendido" ? "success" : "warning"}>{card.status}</Badge>
                    </TD>
                    <TD className="text-right px-6">
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50"
                        icon={Trash2}
                        onClick={() => handleRemoveSellerFromCard(card._id)}
                        label="Desasociar"
                      >
                        Desasociar
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            <AssignBingoCardsModal
              isOpen={isAssignModalOpen}
              onClose={() => {
                setIsAssignModalOpen(false);
                getBingoCardsBySeller(id).then(setBingoCards);
              }}
              sellerId={id}
            />
          </Card>
        )}

        {/* PESTAÑA: VENTAS */}
        {activeTab === "ventas" && (
          <Card padding="p-0" className="shadow-sm border-slate-200/60 overflow-visible">
            <div className="flex items-center justify-between p-3 px-6 border-b border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-primary" size={20} />
                <h3 className="text-sm font-black text-primary uppercase tracking-wider">Listado de Ventas</h3>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                  {filteredData.sales.length}
                </span>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-40">
                  <InputField
                    placeholder="Filtrar N° Cartón"
                    icon={Search}
                    value={filterBingoCard}
                    onChange={(e) => setFilterBingoCardNumber(e.target.value)}
                    bsize="compact"
                  />
                </div>
                <Button
                  icon={Plus}
                  onClick={() => navigate(`/sale/new?sellerId=${id}`)}
                  variant="primary"
                  size="sm"
                >
                  Nueva Venta
                </Button>
              </div>
            </div>

            <Table className="shadow-sm border-slate-200/60 overflow-hidden">
              <THead>
                <TH>Cartón / Edición</TH>
                <TH>Asociado</TH>
                <TH>Fecha</TH>
                <TH>Estado</TH>
                <TH>Pagado</TH>
                <TH className="text-right px-10">Acciones</TH>
              </THead>
              <TBody>
                {filteredData.sales
                  .filter(s => filterBingoCard === "" || String(s.bingoCard?.number).includes(filterBingoCard))
                  .map((s) => (
                    <TR key={s._id}>
                      <StockCell main={`Cartón #${s.bingoCard?.number}`} sub={s.edition?.name || s.edition?.year || "S/E"} />
                      <UserCell
                        name={`${s.client?.person?.firstName} ${s.client?.person?.lastName}`}
                        sub={formatDocument(s.client?.person?.document)}
                      />
                      <TD>
                        <div className="flex items-center gap-2 text-slate-500 font-medium whitespace-nowrap">
                          <Calendar size={13} /> {dayjs.utc(s.saleDate).format("DD/MM/YYYY")}
                        </div>
                      </TD>
                      <TD>
                        <Badge
                          variant={s.status === "Pagado" ? "success" : s.status === "Pendiente de pago" ? "warning" : s.status === "Anulada" ? "danger" : "default"}
                        >
                          {s.status}
                        </Badge>
                      </TD>
                      <AmountCell value={filteredData.quotas[s._id]?.reduce((a, q) => a + (q.paymentDate ? q.amount : 0), 0) || 0} />
                      <TD className="text-right px-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={ExternalLink}
                          onClick={() => navigate(`/sale/view/${s._id}`)}
                        >
                          Ver Venta
                        </Button>
                      </TD>
                    </TR>
                  ))}
              </TBody>
            </Table>
          </Card>
        )}

        {/* PESTAÑA: PAGOS */}
        {activeTab === "pagos" && (
          <Card padding="p-0" className="shadow-sm border-slate-200/60">
            <div className="flex items-center gap-3 p-6 border-b border-slate-100 bg-slate-50/30">
              <Receipt className="text-primary" size={20} />
              <h3 className="text-sm font-black text-primary uppercase tracking-wider">Historial de Liquidaciones</h3>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                {filteredData.payments.length}
              </span>
            </div>

            <Table className="shadow-sm border-slate-200/60 overflow-hidden">
              <THead>
                <TH>Nro Pago</TH>
                <TH>Subtotal</TH>
                <TH>Comisión</TH>
                <TH>Neto</TH>
                <TH>Fecha</TH>
                <TH>Estado</TH>
                <TH className="text-right px-10">Gestión</TH>
              </THead>
              <TBody>
                {filteredData.payments
                  .slice()
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((p) => {
                    const subtotal = (p.cashAmount || 0) + (p.transferAmount || 0) + (p.tarjetaUnicaAmount || 0) + (p.checkAmount || 0);
                    const commission = p.commissionAmount || 0;
                    return (
                      <TR key={p._id}>
                        <TD><span className="font-black text-primary">#{p.sellerPaymentNumber || "N/A"}</span></TD>
                        <TD className="whitespace-nowrap"><span className="font-bold text-slate-500 text-xs">{formatCurrency(subtotal)}</span></TD>
                        <TD className="whitespace-nowrap"><span className="font-bold text-blue-500 text-xs">-{formatCurrency(commission)}</span></TD>
                        <AmountCell value={subtotal - commission} />
                        <TD className="whitespace-nowrap text-xs font-medium text-slate-500">{dayjs(p.date).format("DD/MM/YYYY")}</TD>
                        <TD>
                          <div className="flex flex-col">
                            <Badge variant={p.status === "Anulado" ? "danger" : "success"}>
                              {p.status === "Anulado" ? "Anulado" : "Efectivo"}
                            </Badge>
                            {p.status === "Anulado" && (
                              <>
                                <span className="text-[8px] font-bold text-red-400 uppercase mt-1">Por: {p.canceledBy?.person?.firstName} {p.canceledBy?.person?.lastName}</span>
                                <span className="text-[8px] font-bold text-red-400 uppercase mt-1">El: {dayjs(p.canceledAt).format("DD/MM/YYYY")}</span>
                              </>
                            )}
                          </div>
                        </TD>
                        <TD className="text-right px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              icon={Download}
                              onClick={() => handleDownloadReceipt(p)}
                              title="Descargar Recibo"
                              size="sm"
                            >Descargar
                            </Button>

                            {p.status !== "Anulado" && (
                              <Button
                                variant="ghost"
                                className="text-red-400"
                                icon={Trash2}
                                onClick={() => handleCancelPayment(p._id)}
                                title="Anular Liquidación"
                                size="sm"
                              >Anular
                              </Button>
                            )}
                          </div>
                        </TD>
                      </TR>
                    );
                  })}
              </TBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}

export default SellerViewPage;
