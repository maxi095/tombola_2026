import { useEffect, useState } from "react";
import { useSales } from "../../context/SaleContext";
import { useQuotas } from "../../context/QuotaContext";
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
 * SaleViewPage V6.0 - Elite Architecture Edition 2026
 * Refactorización atómica con KPICard, InfoItem y QuotaCard.
 */
function SaleViewPage() {
  const { getSale, updateSale } = useSales();
  const { getQuotasBySale, updateQuota } = useQuotas();
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
        const saleData = await getSale(params.id);
        setSale(saleData);
        if (saleData?._id) {
          const quotasData = await getQuotasBySale(params.id);
          setQuotas(Array.isArray(quotasData) ? quotasData : []);
        }
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
      const refreshedQuotas = await getQuotasBySale(sale._id);
      setQuotas(refreshedQuotas);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveQuota = async (updatedQuota) => {
    try {
      await updateQuota(updatedQuota._id, updatedQuota);
      const refreshedQuotas = await getQuotasBySale(sale._id);
      setQuotas(refreshedQuotas);
    } catch (error) {
      console.error(error);
    }
    setIsModalOpen(false);
  };

  const handleFullPaymentSave = async (data) => {
    try {
      const updatedQs = quotas.map((q) => ({ ...q, paymentDate: data.date, paymentMethod: data.method }));
      await Promise.all(updatedQs.map((q) => updateQuota(q._id, q)));
      if (data.cardDetails) {
        await updateSale(sale._id, {
          fullPaymentMethod: data.method,
          lastFullPayment: data.date,
          cardPaymentDetails: { ...data.cardDetails },
        });
      }
      const refreshed = await getQuotasBySale(sale._id);
      setQuotas(refreshed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFullModalOpen(false);
    }
  };

  const handleNoChargeSave = async (data) => {
    try {
      const updatedQs = quotas.map((q) => ({ ...q, paymentDate: data.date, paymentMethod: "Entregado sin cargo" }));
      await Promise.all(updatedQs.map((q) => updateQuota(q._id, q)));
      await updateSale(sale._id, { status: "Entregado sin cargo", lastFullPayment: data.date, fullPaymentMethod: "Otro" });
      const refreshed = await getQuotasBySale(sale._id);
      setQuotas(refreshed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsNoChargeModalOpen(false);
    }
  };

  const handleUndoNoCharge = async () => {
    if (!confirm("¿Anular entrega sin cargo?")) return;
    try {
      const updatedQs = quotas.map((q) => ({ ...q, paymentDate: null, paymentMethod: "" }));
      await Promise.all(updatedQs.map((q) => updateQuota(q._id, q)));
      await updateSale(sale._id, { status: "Pendiente de pago", lastFullPayment: null, fullPaymentMethod: "" });
      const refreshed = await getQuotasBySale(sale._id);
      setQuotas(refreshed);
    } catch (err) {
      console.error(err);
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

      <div className="flex flex-col gap-6">
        {/* NIVEL 2: FICHA TÉCNICA HORIZONTAL (SLIM VERSION) ✨🚀 */}
        <Card className="overflow-hidden border-t-2 border-t-primary/30 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 py-0.5">
            
            <div className="flex flex-col items-center justify-center border-r border-slate-50 last:border-0 px-2 py-2 group">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-primary transition-colors">Cartón</p>
              <p className="text-lg font-black text-primary/80 font-manrope">#{sale.bingoCard?.number || "N/A"}</p>
            </div>

            <div className="flex flex-col items-center justify-center border-r border-slate-50 last:border-0 px-2 py-2 group">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-primary transition-colors">Edición</p>
              <p className="text-lg font-black text-primary/80 font-manrope">{sale.edition?.name || "N/A"}</p>
            </div>

            <div className="flex flex-col items-center justify-center border-r border-slate-50 last:border-0 px-4 py-2 group">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-primary transition-colors">Asociado</p>
              <h4 className="text-[13px] font-black text-slate-700 tracking-tight font-manrope leading-none text-center truncate w-full">
                {sale.client?.person?.firstName} {sale.client?.person?.lastName}
              </h4>
              <p className="text-[8px] font-bold text-slate-300 mt-1 tracking-tighter">DNI {sale.client?.person?.document}</p>
            </div>

            <div className="flex flex-col items-center justify-center border-r border-slate-50 last:border-0 px-4 py-2 group">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-primary transition-colors">Vendedor</p>
              <p className="text-[13px] font-black text-slate-600 font-manrope truncate w-full text-center">
                {sale.seller?.person?.firstName} {sale.seller?.person?.lastName}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center border-r border-slate-50 last:border-0 px-2 py-2 group">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-primary transition-colors">Fecha</p>
              <p className="text-[13px] font-black text-slate-600 font-manrope">
                {dayjs.utc(sale.saleDate).format('DD/MM/YYYY')}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center px-2 py-2">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 text-center">Estado</p>
              <Badge variant={sale.status === 'Anulada' ? 'error' : 'default'} size="xs" className="font-bold uppercase py-0 px-2">
                {sale.status}
              </Badge>
            </div>

          </div>
        </Card>

        {/* NIVEL 3: GESTIÓN DE CUOTAS (HIGHLIGHT SYSTEM) 🏹⚖️ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 text-primary/60">
              <CreditCard size={14} />
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em]">Plan de Pagos</h3>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{quotas.length} Transacciones</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
      <FullPaymentModal isOpen={isFullModalOpen} onClose={() => setIsFullModalOpen(false)} quotas={quotas} saleId={sale._id} bingoCardId={sale.bingoCard._id} onSave={handleFullPaymentSave} />
      <NoChargeModal isOpen={isNoChargeModalOpen} onClose={() => setIsNoChargeModalOpen(false)} onSave={handleNoChargeSave} />
    </div>
  );
}

export default SaleViewPage;
