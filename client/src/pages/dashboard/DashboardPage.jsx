import { useEffect, useState, useMemo } from "react";
import {
  ShoppingBag,
  Layers,
  UserCheck,
  Clock,
  Banknote,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Receipt,
  Briefcase,
  CheckCircle2,
  Calendar,
  Wallet,
  PieChart,
  BarChart3,
  RefreshCw,
  Info,
  Percent,
  Gift,
  Scale
} from "lucide-react";

import { useDashboard } from "../../context/DashboardContext";
import { useEditionFilter } from "../../context/EditionFilterContext";

// Infraestructura Elite 2026 🛡️
import PageHeader from "../../components/ui/PageHeader";
import KPICard from "../../components/ui/KPICard";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Tabs from "../../components/ui/Tabs";
import { formatCurrency } from "../../libs/formatters";

/**
 * DashboardPage v3.0 - Multi-Tab High Density 📑📊✨🛡️
 * Panel central estructurado por pestañas para gestión de Ventas y Balance.
 */
export default function DashboardPage() {
  const { dashboardData, loading, error, getDashboard } = useDashboard();
  const { selectedEdition } = useEditionFilter();
  const [activeTab, setActiveTab] = useState('ventas'); // 'ventas' | 'balance'

  // Cargar datos al cambiar la edición seleccionada
  useEffect(() => {
    if (selectedEdition) {
      getDashboard(selectedEdition);
    }
  }, [selectedEdition, getDashboard]);

  // Cálculos de métricas derivadas 🧠
  const metrics = useMemo(() => {
    if (!dashboardData) return null;

    const { bingoCards, sales, quotas, sellerPayments, expectedRevenueEdition } = dashboardData;

    const soldPercent = bingoCards?.total ? Math.round((bingoCards.sold / bingoCards.total) * 100) : 0;
    const collectionPercent = expectedRevenueEdition ? Math.round((sellerPayments.total / expectedRevenueEdition) * 100) : 0;

    return {
      soldPercent,
      collectionPercent,
      ...dashboardData
    };
  }, [dashboardData]);

  // ─── Estados de Interfaz ──────────────────────────────────────────────────

  if (!selectedEdition) {
    return (
      <div className="px-8 py-10">
        <PageHeader
          title="Panel de Control"
          subtitle="Seleccione una edición para comenzar"
        />
        <EmptyState
          icon={Calendar}
          title="Esperando Edición"
          message="Para visualizar las estadísticas operativas y financieras, por favor seleccione una edición en el filtro superior."
          className="mt-10"
        />
      </div>
    );
  }

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw size={36} className="animate-spin text-primary opacity-20" />
        <p className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">Sincronizando Datacenter...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 py-10 text-red-500">
        <PageHeader title="Error de Conexión" subtitle="No se pudieron cargar los datos" />
        <div className="mt-10 bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center gap-4">
          <AlertTriangle size={24} />
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const { bingoCards, sales, quotas, sellerPayments, expectedRevenueEdition, edition } = metrics;

  // KPIs para la Cabecera
  const headerStats = [
    { label: 'Ventas %', value: `${metrics.soldPercent}%`, icon: PieChart, variant: metrics.soldPercent > 70 ? 'success' : 'primary' },
    { label: 'Recaudado', value: formatCurrency(sellerPayments.total), icon: TrendingUp, variant: 'success' },
    { label: 'Cuotas Vencidas', value: quotas.overdue, icon: AlertTriangle, variant: quotas.overdue > 0 ? 'danger' : 'slate' },
  ];

  return (
    <div className="flex flex-col px-8 animate-in fade-in duration-700 pb-20 no-scrollbar">

      <PageHeader
        title={`Dashboard ${edition}`}
        stats={headerStats}
        compact={true}
      />

      {/* ── NAVEGACIÓN DE PESTAÑAS (Elite Tabs) 📑 ──────────────────────── */}
      <Tabs
        tabs={[
          { id: 'ventas', label: 'Ventas', icon: ShoppingBag },
          { id: 'balance', label: 'Balance', icon: Scale }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        showIcons={false}
        className="mb-6"
      />

      <div className="flex flex-col gap-6">

        {activeTab === 'ventas' && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-500">
            {/* ── SECCIÓN 1: ESTADO DE CARTONES (KPI GRID) ─────────────────── */}
            <section>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard
                  icon={Layers}
                  label="Total Cartones"
                  value={bingoCards.total}
                  variant="slate"
                />
                <KPICard
                  icon={UserCheck}
                  label="Asignados"
                  value={bingoCards.totalAssigned}
                  variant="primary"
                />
                <KPICard
                  icon={ShoppingBag}
                  label="Vendidos"
                  value={bingoCards.sold}
                  variant="success"
                />
                <KPICard
                  icon={CheckCircle2}
                  label="Pagados"
                  value={sales.paid}
                  variant="success"
                />
                <KPICard
                  icon={Gift}
                  label="Sin Cargo"
                  value={sales.noCharge}
                  variant="primary"
                />
                <KPICard
                  icon={Clock}
                  label="Pend. Pago"
                  value={sales.pending}
                  variant={sales.pending > 0 ? "danger" : "slate"}
                />
              </div>
            </section>

            {/* ── SECCIÓN 2: GESTIÓN FINANCIERA (PANEL DIVIDIDO) ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Tarjeta de Recaudación vs Objetivo */}
              <Card title="Recaudación vs Objetivo" icon={TrendingUp} className="lg:col-span-2" size="slim">
                <div className="flex flex-col h-full justify-center py-2">
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                        Monto Recaudado
                      </p>
                      <h2 className="text-3xl font-black font-manrope text-primary tracking-tighter">
                        {formatCurrency(sellerPayments.total)}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                        Objetivo Total
                      </p>
                      <p className="text-lg font-bold text-slate-500">
                        / {formatCurrency(expectedRevenueEdition)}
                      </p>
                    </div>
                  </div>

                  {/* Barra de Progreso Elite */}
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200/50 shadow-inner">
                    <div
                      className={`h-full transition-all duration-1000 ease-out shadow-lg ${metrics.collectionPercent >= 100 ? 'bg-emerald-500' : 'bg-primary'
                        }`}
                      style={{ width: `${Math.min(metrics.collectionPercent, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <Badge variant={metrics.collectionPercent >= 100 ? "success" : "primary"}>
                      {metrics.collectionPercent}% Alcanzado
                    </Badge>
                    <p className="text-[11px] font-bold text-slate-400 italic">
                      * Basado en (Cant. Cartones - Sin Cargo) x Precio
                    </p>
                  </div>
                </div>
              </Card>

              {/* Desglose de Medios de Pago */}
              <Card title="Medios de Pago" icon={Wallet} size="slim">
                <div className="flex flex-col gap-2 py-0">
                  <PaymentRow label="Efectivo" value={sellerPayments.cash} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" />
                  <PaymentRow label="Transferencia" value={sellerPayments.transfer} icon={RefreshCw} color="text-blue-600" bg="bg-blue-50" />
                  <PaymentRow label="Cheque" value={sellerPayments.check} icon={Receipt} color="text-amber-600" bg="bg-amber-50" />
                  <PaymentRow label="Tarjeta Única" value={sellerPayments.tarjetaUnica} icon={CreditCard} color="text-indigo-600" bg="bg-indigo-50" />

                  <div className="border-t border-slate-100 mt-1 pt-2 flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suma Total</span>
                    <span className="text-sm font-black text-slate-700">{formatCurrency(sellerPayments.total)}</span>
                  </div>
                </div>
              </Card>

            </div>

            {/* ── SECCIÓN 3: CUOTAS Y COMISIONES ───────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Estado de Cuotas */}
              <Card title="Control de Cuotas" icon={BarChart3} size="slim">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Pagado</p>
                    <p className="text-xl font-black text-emerald-600">{formatCurrency(quotas.totalPaidAmount)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500">{quotas.paid} cuotas</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 p-3 bg-red-50/30 rounded-2xl border border-red-100">
                    <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">En Mora (Vencidas)</p>
                    <p className="text-xl font-black text-red-600">{quotas.overdue}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle size={10} className="text-red-500" />
                      <span className="text-[10px] font-bold text-slate-500">Acción requerida</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Comisiones de Vendedores */}
              <Card title="Comisiones de Vendedores" icon={Briefcase} size="slim">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                      <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest">Efectivo</p>
                      <p className="text-xl font-black text-emerald-600">{formatCurrency(sellerPayments.totalCommissionCash)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <DollarSign size={10} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-500">Pago Directo</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <p className="text-[9px] font-black text-blue-600/60 uppercase tracking-widest">Transferencia</p>
                      <p className="text-xl font-black text-blue-600">{formatCurrency(sellerPayments.totalCommissionTransfer)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <RefreshCw size={10} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-slate-500">Bancarizado</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Comisiones</span>
                    <span className="text-sm font-black text-amber-600">{formatCurrency(sellerPayments.commissions)}</span>
                  </div>
                </div>
              </Card>

            </div>
          </div>
        )}

        {activeTab === 'balance' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <EmptyState
              icon={Scale}
              title="Módulo de Balance Operativo"
              message="Este espacio está reservado para las estadísticas detalladas de arqueos, cajas y movimientos financieros de la edición."
              className="py-20"
            />
          </div>
        )}

      </div>
    </div>
  );
}

/**
 * Componente interno para filas de pago estilizadas 💎
 */
function PaymentRow({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-110`}>
          {Icon && <Icon size={14} />}
        </div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-700 transition-colors">
          {label}
        </span>
      </div>
      <span className="text-[13px] font-black text-slate-700">
        {formatCurrency(value)}
      </span>
    </div>
  );
}
