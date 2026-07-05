import { useEffect, useState, useMemo } from "react";
import {
  ShoppingBag,
  Layers,
  UserCheck,
  UserPlus,
  Clock,
  Banknote,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CreditCard,
  Receipt,
  Briefcase,
  CheckCircle2,
  Calendar,
  MapPin,
  Wallet,
  PieChart as LucidePieChart,
  BarChart3,
  RefreshCw,
  Info,
  Percent,
  Gift,
  Scale
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

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

// Paletas de Colores Elite para Reportes 🎨💎
const INCOME_COLORS = ['#10b981', '#059669', '#34d399', '#0284c7', '#60a5fa', '#3b82f6'];
const EXPENSE_COLORS = ['#f43f5e', '#e11d48', '#fb7185', '#f59e0b', '#d97706', '#ec4899'];
const SELLER_COLORS = ['#f59e0b', '#6366f1'];
const PAYMENT_COLORS = ['#10b981', '#6366f1', '#94a3b8'];
const LOCALITY_COLORS = ['#3b82f6', '#60a5fa', '#2563eb', '#1d4ed8', '#1e40af', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#10b981'];

/**
 * DashboardPage v3.0 - Multi-Tab High Density 📑📊✨🛡️
 * Panel central estructurado por pestañas para gestión de Ventas y Balance.
 */
export default function DashboardPage() {
  const { dashboardData, loading, error, getDashboard } = useDashboard();
  const { selectedEdition } = useEditionFilter();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'ventas' | 'balance'

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

  const {
    bingoCards,
    sales,
    quotas,
    sellerPayments,
    expectedRevenueEdition,
    edition,
    balanceStats = { income: [], expense: [], totalIncome: 0, totalExpense: 0, netBalance: 0 },
    salesTrend = [],
    salesBySellerType = { particular: 0, club: 0 },
    salesPaymentType = { contado: 0, cuotas: 0, sinCargo: 0 },
    salesByCity = [],
    salesBySeller = [],
    newClientsByCity = []
  } = metrics;

  // KPIs para la Cabecera
  const headerStats = [
    { label: 'Ventas %', value: `${metrics.soldPercent}%`, icon: LucidePieChart, variant: metrics.soldPercent > 70 ? 'success' : 'primary' },
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
          { id: 'general', label: 'General', icon: BarChart3 },
          { id: 'ventas', label: 'Ventas', icon: ShoppingBag },
          { id: 'balance', label: 'Balance', icon: Scale }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        showIcons={false}
        className="mb-6"
      />

      <div className="flex flex-col gap-6">

        {activeTab === 'general' && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-500">
            {/* KPIs Principales de Finanzas */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard
                icon={TrendingUp}
                label="Ingresos Totales"
                value={formatCurrency(balanceStats.totalIncome)}
                variant="success"
              />
              <KPICard
                icon={TrendingDown}
                label="Egresos Totales"
                value={formatCurrency(balanceStats.totalExpense)}
                variant="danger"
              />
              {/* Tarjeta de Balance Neto con gradiente premium */}
              <div className={`p-6 rounded-3xl border flex items-center justify-between shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md ${balanceStats.netBalance >= 0
                ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-100/80 text-emerald-800'
                : 'bg-gradient-to-br from-rose-500/10 to-amber-500/5 border-rose-100/80 text-rose-800'
                }`}>
                <div className="flex flex-col gap-1 z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-60">Balance Neto</span>
                  <span className="text-3xl font-black font-manrope tracking-tighter">
                    {formatCurrency(balanceStats.netBalance)}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${balanceStats.netBalance >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                  {balanceStats.netBalance >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                {/* Decoración de fondo */}
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-1/4 translate-x-1/8">
                  {balanceStats.netBalance >= 0 ? <TrendingUp size={160} /> : <TrendingDown size={160} />}
                </div>
              </div>
            </section>

            {/* Fila de Gráficos de Balance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ingresos por Categoría */}
              <Card title="Ingresos por Categoría" icon={TrendingUp} size="slim">
                {balanceStats.income.length === 0 ? (
                  <EmptyState
                    icon={TrendingUp}
                    title="Sin Ingresos Registrados"
                    message="No se han registrado movimientos de ingresos en el balance para esta edición."
                    className="py-10 border-0 bg-transparent"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={balanceStats.income}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {balanceStats.income.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Leyenda Personalizada */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-2 px-4 pb-2 border-t border-slate-50 pt-3">
                      {balanceStats.income.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: INCOME_COLORS[index % INCOME_COLORS.length] }}></span>
                            <span className="truncate">{entry.name}</span>
                          </div>
                          <span className="text-slate-700 ml-2">{formatCurrency(entry.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Egresos por Categoría */}
              <Card title="Egresos por Categoría" icon={TrendingDown} size="slim">
                {balanceStats.expense.length === 0 ? (
                  <EmptyState
                    icon={TrendingDown}
                    title="Sin Egresos Registrados"
                    message="No se han registrado movimientos de egresos en el balance para esta edición."
                    className="py-10 border-0 bg-transparent"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={balanceStats.expense}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {balanceStats.expense.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Leyenda Personalizada */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-2 px-4 pb-2 border-t border-slate-50 pt-3">
                      {balanceStats.expense.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}></span>
                            <span className="truncate">{entry.name}</span>
                          </div>
                          <span className="text-slate-700 ml-2">{formatCurrency(entry.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Fila de Canales de Venta e Historial de Pago */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ventas por Vendedor */}
              <Card title="Canales de Venta (Particular vs. Club)" icon={Briefcase} size="slim">
                {salesBySellerType.particular === 0 && salesBySellerType.club === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="Sin Ventas Registradas"
                    message="No se registran ventas para analizar la distribución de canales."
                    className="py-10 border-0 bg-transparent"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Particular', value: salesBySellerType.particular },
                              { name: 'Comisión Club', value: salesBySellerType.club }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            <Cell fill={SELLER_COLORS[0]} />
                            <Cell fill={SELLER_COLORS[1]} />
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} ventas`, 'Cantidad']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Leyendas y totales */}
                    <div className="flex justify-around w-full mt-1 px-8 pb-3">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-slate-700">{salesBySellerType.particular}</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SELLER_COLORS[0] }}></span>
                          Particular
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-slate-700">{salesBySellerType.club}</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SELLER_COLORS[1] }}></span>
                          Comisión Club
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Modalidad de Pago */}
              <Card title="Modalidad de Pago (Contado vs. Cuotas)" icon={Wallet} size="slim">
                {salesPaymentType.contado === 0 && salesPaymentType.cuotas === 0 && salesPaymentType.sinCargo === 0 ? (
                  <EmptyState
                    icon={Wallet}
                    title="Sin Ventas Registradas"
                    message="No se registran ventas para analizar las modalidades de pago."
                    className="py-10 border-0 bg-transparent"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Contado', value: salesPaymentType.contado },
                              { name: 'Cuotas', value: salesPaymentType.cuotas },
                              { name: 'Sin Cargo', value: salesPaymentType.sinCargo }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            <Cell fill={PAYMENT_COLORS[0]} />
                            <Cell fill={PAYMENT_COLORS[1]} />
                            <Cell fill={PAYMENT_COLORS[2]} />
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} ventas`, 'Cantidad']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Leyendas y totales */}
                    <div className="flex justify-around w-full mt-1 px-4 pb-3">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-slate-700">{salesPaymentType.contado}</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[0] }}></span>
                          Contado
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-slate-700">{salesPaymentType.cuotas}</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[1] }}></span>
                          Cuotas
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-slate-700">{salesPaymentType.sinCargo}</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[2] }}></span>
                          Sin Cargo
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Ventas por Localidad */}
              <Card title="Distribución Geográfica de Ventas" icon={MapPin} size="slim">
                {salesByCity.length === 0 ? (
                  <EmptyState
                    icon={MapPin}
                    title="Sin Localidades Registradas"
                    message="No se registran ventas asociadas a asociados con localidad."
                    className="py-12 border-0 bg-transparent"
                  />
                ) : (
                  <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-2 no-scrollbar py-2">
                    {salesByCity.map((item, index) => {
                      const totalSalesCount = salesByCity.reduce((acc, curr) => acc + curr.value, 0);
                      const percent = totalSalesCount > 0 ? Math.round((item.value / totalSalesCount) * 100) : 0;

                      return (
                        <div key={index} className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-slate-100/30 transition-all duration-300 group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin size={11} className="text-primary opacity-40 shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-black text-slate-800">
                              {item.value} {item.value === 1 ? 'venta' : 'ventas'}
                            </span>
                          </div>
                          {/* Barra de Proporción */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-slate-200/60 rounded-full overflow-hidden border border-slate-300/10">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 w-8 text-right shrink-0">
                              {percent}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Nuevos Compradores por Localidad */}
              <Card title="Nuevos Compradores por Localidad" icon={UserPlus} size="slim">
                {newClientsByCity.length === 0 ? (
                  <EmptyState
                    icon={UserPlus}
                    title="Sin Nuevos Compradores"
                    message="No se registran asociados cuya primera compra pertenezca a esta edición."
                    className="py-12 border-0 bg-transparent"
                  />
                ) : (
                  <div className="flex flex-col py-1">
                    {/* Indicador de Total */}
                    <div className="mb-2.5 mx-1 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                      <span>Total Nuevos</span>
                      <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full text-[10px] font-black font-manrope">
                        {newClientsByCity.reduce((acc, curr) => acc + curr.value, 0)} asociados
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[235px] overflow-y-auto pr-2 no-scrollbar">
                      {newClientsByCity.map((item, index) => {
                        const totalNewClients = newClientsByCity.reduce((acc, curr) => acc + curr.value, 0);
                        const percent = totalNewClients > 0 ? Math.round((item.value / totalNewClients) * 100) : 0;
                        
                        return (
                          <div key={index} className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-slate-100/30 transition-all duration-300 group">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin size={11} className="text-purple-500 opacity-40 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-[11px] font-black text-slate-800">
                                {item.value} {item.value === 1 ? 'comprador' : 'compradores'}
                              </span>
                            </div>
                            {/* Barra de Proporción */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-slate-200/60 rounded-full overflow-hidden border border-slate-300/10">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-[9px] font-black text-slate-400 w-8 text-right shrink-0">
                                {percent}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {/* Rendimiento de Vendedores */}
              <Card title="Rendimiento de Vendedores" icon={Briefcase} size="slim">
                {salesBySeller.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="Sin Ventas de Vendedores"
                    message="No se registran ventas asociadas a ningún vendedor en esta edición."
                    className="py-12 border-0 bg-transparent"
                  />
                ) : (
                  <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-2 no-scrollbar py-2">
                    {salesBySeller.map((item, index) => (
                      <div key={index} className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-slate-100/30 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 font-semibold truncate max-w-[220px]" title={item.name}>
                            {item.name}
                          </span>
                          <span className="text-[11px] font-black text-slate-800 shrink-0">
                            {item.cartonsCount} {item.cartonsCount === 1 ? 'cartón' : 'cartones'}
                          </span>
                        </div>
                        {/* Detalle de Posición y Tipo */}
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mt-1">
                          {item.isParticular ? (
                            <Badge variant="warning" size="sm" className="py-0.5 px-1.5 text-[8px] shrink-0">Particular</Badge>
                          ) : (
                            <Badge variant="primary" size="sm" className="py-0.5 px-1.5 text-[8px] shrink-0">Comisión Club</Badge>
                          )}
                          <span>Top #{index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Evolución Mensual de Ventas */}
            <div className="mt-6">
              <Card title="Evolución Mensual de Ventas" icon={Calendar} size="slim">
                {salesTrend.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="Sin Tendencia de Ventas"
                    message="Aún no hay ventas registradas cronológicamente en esta edición."
                    className="py-12 border-0 bg-transparent"
                  />
                ) : (
                  <div className="w-full h-[280px] pr-4 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesTrend}>
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="monthLabel"
                          stroke="#94a3b8"
                          fontSize={10}
                          fontWeight="bold"
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={10}
                          fontWeight="bold"
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip formatter={(value) => [`${value} ventas`, 'Ventas Registradas']} />
                        <Area
                          type="monotone"
                          dataKey="salesCount"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#salesGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

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
