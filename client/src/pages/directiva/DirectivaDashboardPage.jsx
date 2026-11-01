import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEditions } from '../../context/EditionContext';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency, formatNumber } from '../../libs/formatters';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Ticket,
    CreditCard,
    Award,
    AlertTriangle,
    RotateCw,
    LogOut,
    Building2,
    DollarSign,
    Users,
    CheckCircle2
} from 'lucide-react';
import logoNob from '../../assets/images/logo_nob.png';

export const DirectivaDashboardPage = () => {
    const { user, logout } = useAuth();
    const { editions, getEditions } = useEditions();
    const { dashboardData, loading, getDashboard } = useDashboard();
    const navigate = useNavigate();

    const [selectedEditionId, setSelectedEditionId] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Cargar ediciones iniciales
    useEffect(() => {
        getEditions();
    }, [getEditions]);

    // Establecer edición por defecto
    useEffect(() => {
        if (editions && editions.length > 0 && !selectedEditionId) {
            // Seleccionar la edición activa o la primera
            const active = editions.find((e) => e.status === 'Activa') || editions[0];
            setSelectedEditionId(active._id);
        }
    }, [editions, selectedEditionId]);

    // Cargar datos cuando cambia la edición
    useEffect(() => {
        if (selectedEditionId) {
            getDashboard(selectedEditionId);
        }
    }, [selectedEditionId, getDashboard]);

    const handleConfirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        navigate('/login');
    };

    const bingoCards = dashboardData?.bingoCards || { total: 0, sold: 0, available: 0 };
    const quotas = dashboardData?.quotas || { total: 0, paid: 0, pending: 0, overdue: 0, totalPaidAmount: 0 };
    const payments = dashboardData?.sellerPayments || { total: 0, commissions: 0 };
    const balance = dashboardData?.balanceStats || { totalIncome: 0, totalExpense: 0, netBalance: 0 };
    const paymentTypes = dashboardData?.salesPaymentType || { contado: 0, cuotas: 0 };
    const topSellers = (dashboardData?.salesBySeller || []).slice(0, 5);

    const percentSold = bingoCards.total > 0 ? Math.round((bingoCards.sold / bingoCards.total) * 100) : 0;
    const percentQuotasPaid = quotas.total > 0 ? Math.round((quotas.paid / quotas.total) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-red-500 selection:text-white pb-12">
            {/* Header Directiva */}
            <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img
                            src={logoNob}
                            alt="Club Atlético Newell's Old Boys"
                            className="w-9 h-9 object-contain"
                        />
                        <div>
                            <h1 className="text-base font-black text-white leading-tight">
                                Tómbola <span className="text-red-500">NOB</span>
                            </h1>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Tablero Ejecutivo Directiva
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
                            {user?.username || 'Directivo'}
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowLogoutConfirm(true)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Cerrar sesión"
                            aria-label="Cerrar sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenido */}
            <main className="max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
                {/* Selector de Edición & Refresh */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">
                            Filtro Institucional
                        </span>
                        <h2 className="text-lg font-black text-white">Estado de la Edición</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={selectedEditionId}
                            onChange={(e) => setSelectedEditionId(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                        >
                            {editions.map((ed) => (
                                <option key={ed._id} value={ed._id}>
                                    {ed.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => selectedEditionId && getDashboard(selectedEditionId)}
                            disabled={loading}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-all active:scale-95"
                            title="Actualizar datos"
                        >
                            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Grid de KPIs Principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Recaudación Total */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-medium uppercase tracking-wider">Recaudación Neta</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-700/40 flex items-center justify-center text-emerald-400">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-white">
                            {formatCurrency(quotas.totalPaidAmount || payments.total)}
                        </p>
                        <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Cobrado e ingresado
                        </p>
                    </div>

                    {/* Cartones Vendidos */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-medium uppercase tracking-wider">Cartones Colocados</span>
                            <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-700/40 flex items-center justify-center text-red-400">
                                <Ticket className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-white">
                                {formatNumber(bingoCards.sold)}
                            </p>
                            <span className="text-xs text-slate-400 font-medium">
                                / {formatNumber(bingoCards.total)} ({percentSold}%)
                            </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div
                                className="bg-red-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(percentSold, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Salud de Cobranzas / Cuotas */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-medium uppercase tracking-wider">Cobranza de Cuotas</span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-700/40 flex items-center justify-center text-indigo-400">
                                <CreditCard className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-white">
                                {percentQuotasPaid}%
                            </p>
                            <span className="text-xs text-slate-400 font-medium">
                                al día
                            </span>
                        </div>
                        <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {formatNumber(quotas.overdue)} cuotas vencidas
                        </p>
                    </div>

                    {/* Balance Neto */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs font-medium uppercase tracking-wider">Superávit Tómbola</span>
                            <div className="w-8 h-8 rounded-lg bg-sky-950/60 border border-sky-700/40 flex items-center justify-center text-sky-400">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <p className={`text-2xl font-black ${balance.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(balance.netBalance)}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Ingresos: {formatCurrency(balance.totalIncome)}
                        </p>
                    </div>
                </div>

                {/* Sección Desglose: Modalidades y Ranking */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Modalidades de Venta */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                            <CreditCard className="w-4 h-4 text-red-500" />
                            Modalidades de Comercialización
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                                <div>
                                    <p className="text-xs font-bold text-white">Ventas en Cuotas</p>
                                    <p className="text-[11px] text-slate-400">Pago diferido mensual</p>
                                </div>
                                <span className="text-base font-black text-indigo-400">
                                    {paymentTypes.cuotas} ventas
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                                <div>
                                    <p className="text-xs font-bold text-white">Ventas de Contado</p>
                                    <p className="text-[11px] text-slate-400">Pago total inmediato</p>
                                </div>
                                <span className="text-base font-black text-emerald-400">
                                    {paymentTypes.contado} ventas
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                                <div>
                                    <p className="text-xs font-bold text-white">Comisiones Liquidadas</p>
                                    <p className="text-[11px] text-slate-400">Incentivo a la fuerza de venta</p>
                                </div>
                                <span className="text-base font-black text-amber-400">
                                    {formatCurrency(payments.commissions)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ranking Top Vendedores */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                            <Award className="w-4 h-4 text-amber-400" />
                            Líderes de Ventas (Top 5)
                        </h3>

                        {topSellers.length === 0 ? (
                            <div className="text-center py-8 text-xs text-slate-500">
                                Sin registros de ventas de vendedores para esta edición.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {topSellers.map((seller, idx) => (
                                    <div
                                        key={seller.name || idx}
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center">
                                                #{idx + 1}
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold text-white">{seller.name}</p>
                                                <p className="text-[11px] text-slate-400">
                                                    {seller.value} cartones colocados
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-400">
                                            Activo
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal de confirmación para cerrar sesión */}
            <ConfirmModal
                isOpen={showLogoutConfirm}
                title="Cerrar sesión"
                message="¿Estás seguro de que deseas salir del portal de directiva?"
                confirmText="Cerrar sesión"
                cancelText="Volver"
                variant="danger"
                onConfirm={handleConfirmLogout}
                onClose={() => setShowLogoutConfirm(false)}
            />
        </div>
    );
};
