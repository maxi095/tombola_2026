import { useEffect, useState } from "react";
import { useSales } from "../../context/SaleContext";
import { useQuotas } from "../../context/QuotaContext";
import { useFeedback } from "../../context/FeedbackContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  Calendar,
  User as UserIcon,
  Hash,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Zap,
  Gift,
  Info
} from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// Componentes Elite UI [ATÓMICOS]
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import KPICard from "../../components/ui/KPICard";
import InfoItem from "../../components/ui/InfoItem";
import { formatCurrency } from "../../libs/formatters";

// Componentes de Negocio
import QuotaCard from "../../components/sale/QuotaCard";
import QuotaPaymentModal from "../../components/QuotaPaymentModal";
import FullPaymentModal from "../../components/FullPaymentModal";
import NoChargeModal from "../../components/NoChargeModal";

dayjs.extend(utc);

/**
 * SaleViewPage V6.5 - Elite Architecture Edition 2026
 * Refactorización atómica con KPICard, InfoItem, QuotaCard y operaciones batch O(1).
 */
function SaleViewPage() {
  const { getSale, batchSalePayment } = useSales();
  const { getQuotasBySale, updateQuota } = useQuotas();
  const { showToast } = useFeedback();
  const [sale, setSale] = useState(null);
  const [quotas, setQuotas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuota, setSelectedQuota] = useState(null);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);
  const [isNoChargeModalOpen, setIsNoChargeModalOpen] = useState(false);

  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSale = async () => {
      if (!params.id) return;
      try {
        const [saleData, quotasData] = await Promise.all([
          getSale(params.id),
          getQuotasBySale(params.id)
        ]);
        setSale(saleData);
        setQuotas(Array.isArray(quotasData) ? quotasData : []);
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    };
    loadSale();
  }, [params.id, getSale, getQuotasBySale]);

  if (!sale) return (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
      Sincronizando con el núcleo...
    </div>
  );

  // --- Lógica de Gestión ---
  const handlePay = (quota) => {
    setSelectedQuota(quota);
    setIsModalOpen(true);
  };

  const handleCancelPayment = async (quota) => {
    if (!window.confirm("¿Anular este pago institucional?")) return;
    try {
      await updateQuota(quota._id, { ...quota, paymentDate: null, paymentMethod: null });
      const [refreshedSale, refreshedQuotas] = await Promise.all([
        getSale(sale._id),
        getQuotasBySale(sale._id)
      ]);
      setSale(refreshedSale);
      setQuotas(refreshedQuotas);
      showToast("Pago institucional anulado", "info");
    } catch (error) {
      console.error(error);
      showToast("Error al anular pago", "error");
    }
  };

  const handleSaveQuota = async (updatedQuota) => {
    try {
      await updateQuota(updatedQuota._id, updatedQuota);
      const [refreshedSale, refreshedQuotas] = await Promise.all([
        getSale(sale._id),
        getQuotasBySale(sale._id)
      ]);
      setSale(refreshedSale);
      setQuotas(refreshedQuotas);
      showToast("Cobro registrado correctamente", "success");
    } catch (error) {
      console.error(error);
      showToast("Error al registrar cobro", "error");
    }
    setIsModalOpen(false);
  };

  const handleFullPaymentSave = async (data) => {
    try {
      const result = await batchSalePayment(sale._id, {
        action: "full_payment",
        date: data.date,
        method: data.method,
        cardDetails: data.cardDetails
      });
      if (result?.sale) setSale(result.sale);
      if (result?.quotas) setQuotas(result.quotas);
      showToast("Liquidación de contado realizada con éxito", "success");
    } catch (err) {
      console.error(err);
      showToast("Error en liquidación de contado", "error");
    } finally {
      setIsFullModalOpen(false);
    }
  };

  const handleNoChargeSave = async (data) => {
    try {
      const result = await batchSalePayment(sale._id, {
        action: "no_charge",
        date: data.date
      });
      if (result?.sale) setSale(result.sale);
      if (result?.quotas) setQuotas(result.quotas);
      showToast("Bonificación de entrega sin cargo aplicada", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al procesar bonificación", "error");
    } finally {
      setIsNoChargeModalOpen(false);
    }
  };

  const handleUndoNoCharge = async () => {
    if (!confirm("¿Anular entrega sin cargo?")) return;
    try {
      const result = await batchSalePayment(sale._id, {
        action: "undo_no_charge"
      });
      if (result?.sale) setSale(result.sale);
      if (result?.quotas) setQuotas(result.quotas);
      showToast("Bonificación de entrega sin cargo revertida", "info");
    } catch (err) {
      console.error(err);
      showToast("Error al revertir bonificación", "error");
    }
  };

  // --- Cálculos Financieros ---
  const totalPagado = quotas.reduce((acc, q) => acc + (q.paymentDate ? q.amount : 0), 0);
  const totalVenta = quotas.reduce((acc, q) => acc + (q.amount || 0), 0);
  const totalDeuda = totalVenta - totalPagado;
  const todasImpagas = quotas.length > 0 && quotas.every(q => !q.paymentDate);

  // --- Lógica de Próxima Cuota ✨🚀 ---
  const firstPendingQuota = quotas.find(q => !q.paymentDate && q.paymentMethod !== "Entregado sin cargo");

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 pb-24">
      <PageHeader
        title={`Venta N° ${sale.saleNumber || "Pte"}`}
        breadcrumbs={[
          { label: "Ventas", href: "/sales" },
          { label: `Detalle ${sale.saleNumber}` }
        ]}
        stats={[
          { label: "Total Venta", value: formatCurrency(totalVenta), icon: Wallet, variant: "primary" },
          { label: "Cobrado", value: formatCurrency(totalPagado), icon: CheckCircle2, variant: "success" },
          { label: "Deuda Pte", value: formatCurrency(totalDeuda), icon: ShieldAlert, variant: totalDeuda > 0 ? "danger" : "slate" }
        ]}
        actions={[
          ...(todasImpagas && sale.status !== "Anulada" ? [
            { label: "Pago Contado", onClick: () => setIsFullModalOpen(true), icon: Zap, variant: "primary" },
            { label: "Sin Cargo", onClick: () => setIsNoChargeModalOpen(true), icon: Gift, variant: "outline" }
          ] : []),
          ...(sale.status === "Entregado sin cargo" ? [
            { label: "Anular Sin Cargo", onClick: handleUndoNoCharge, icon: RotateCcw, variant: "outline" }
          ] : [])
        ]}
      />

      <div className="flex flex-col gap-2">
        {/* NIVEL 2: FICHA TÉCNICA ULTRA-SLIM (ZERO AIR) ✨🚀 */}
        <Card 
          padding="p-0" 
          hover={false}
          className="overflow-hidden border-t border-t-primary/20 shadow-sm py-2 px-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 divide-x divide-slate-50">
            
            <div className="flex flex-col items-center justify-center group py-2">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cartón</span>
              <span className="text-sm font-black text-primary font-manrope leading-none">#{sale.bingoCard?.number || "N/A"}</span>
            </div>

            <div className="flex flex-col items-center justify-center group py-2">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Edición</span>
              <span className="text-sm font-black text-primary font-manrope leading-none truncate max-w-[100px] text-center">{sale.edition?.name || "N/A"}</span>
            </div>

            <div className="flex flex-col items-center justify-center group py-2 px-2">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Asociado</span>
              <span className="text-[11px] lg:text-[12px] font-black text-slate-700 tracking-tight font-manrope leading-none truncate w-full text-center">
                {sale.client?.person?.firstName} {sale.client?.person?.lastName}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center group py-2 px-2">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Vendedor</span>
              <span className="text-[11px] lg:text-[12px] font-black text-slate-600 font-manrope leading-none truncate w-full text-center">
                {sale.seller?.person?.firstName} {sale.seller?.person?.lastName}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center group py-2">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fecha</span>
              <span className="text-[12px] font-black text-slate-600 font-manrope leading-none">
                {dayjs.utc(sale.saleDate).format('DD/MM/YY')}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-center">Estado</span>
              <Badge variant={sale.status === 'Anulada' ? 'error' : 'default'} size="xs" className="font-bold uppercase py-0 px-1.5 text-[8px] leading-none h-3.5 min-h-0 border-0">
                {sale.status}
              </Badge>
            </div>

          </div>
        </Card>

        {/* NIVEL 3: GESTIÓN DE CUOTAS (HIGHLIGHT SYSTEM) 🏹⚖️ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-slate-400/80">
            <div className="flex items-center gap-3">
              <CreditCard size={14} />
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em]">Plan de Pagos</h3>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest">{quotas.length} Transacciones</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {quotas.map((quota) => {
              const isNext = firstPendingQuota?._id === quota._id;
              return (
                <div key={quota._id} className={isNext ? "ring-2 ring-primary ring-offset-4 rounded-2xl animate-pulse-subtle" : ""}>
                  <QuotaCard
                    quota={quota}
                    saleStatus={sale.status}
                    onPay={handlePay}
                    onCancel={handleCancelPayment}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <QuotaPaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} quota={selectedQuota} onSave={handleSaveQuota} />
      <FullPaymentModal isOpen={isFullModalOpen} onClose={() => setIsFullModalOpen(false)} quotas={quotas} saleId={sale._id} bingoCardId={sale.bingoCard?._id} onSave={handleFullPaymentSave} />
      <NoChargeModal isOpen={isNoChargeModalOpen} onClose={() => setIsNoChargeModalOpen(false)} onSave={handleNoChargeSave} />
    </div>
  );
}

export default SaleViewPage;
