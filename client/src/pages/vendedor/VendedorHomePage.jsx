import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendedor } from '../../context/VendedorContext';
import { MobileCard } from '../../components/mobile/MobileCard';
import { formatCurrency } from '../../libs/formatters';
import {
    Ticket,
    CreditCard,
    PlusCircle,
    AlertCircle,
    RotateCw,
    Building2,
    Award,
    AlertTriangle
} from 'lucide-react';

const HomeSkeleton = () => (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Cargando resumen">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-800 rounded" />
                <div className="h-6 w-44 bg-slate-800 rounded" />
            </div>
            <div className="w-9 h-9 bg-slate-800 rounded-xl" />
        </div>
        <div className="h-28 bg-slate-800/80 rounded-2xl border border-slate-700/60" />
        <div className="grid grid-cols-3 gap-2">
            <div className="h-20 bg-slate-800/80 rounded-2xl" />
            <div className="h-20 bg-slate-800/80 rounded-2xl" />
            <div className="h-20 bg-slate-800/80 rounded-2xl" />
        </div>
        <div className="h-16 bg-slate-800/80 rounded-2xl" />
    </div>
);

export const VendedorHomePage = () => {
    const { summary, loading, error, loadSummary, selectedEditionId } = useVendedor();
    const navigate = useNavigate();

    useEffect(() => {
        loadSummary().catch(() => {});
    }, [loadSummary, selectedEditionId]);

    if (loading && !summary) {
        return <HomeSkeleton />;
    }

    const metrics = summary?.metrics || {};
    const totalAssigned = metrics.totalAssigned ?? metrics.totalCards ?? 0;
    const totalSold = metrics.totalSold ?? metrics.soldCards ?? 0;
    const totalAvailable = metrics.totalAvailable ?? metrics.availableCards ?? 0;
    const cobradoSinRendir = metrics.cobradoSinRendir ?? metrics.pendingToRender ?? 0;
    const comisionAcumulada = metrics.comisionAcumulada ?? metrics.commissionEarned ?? 0;
    const commissionRate = summary?.seller?.commissionRate ?? summary?.seller?.commission ?? 0;

    return (
        <div className="space-y-4">
            {error && (
                <div
                    role="alert"
                    className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-between gap-3"
                >
                    <div className="flex items-center gap-2.5 text-xs text-rose-200">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => loadSummary().catch(() => {})}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 min-h-[36px]"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {/* Header / Resumen del vendedor */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-red-500">
                            {summary?.edition?.name || 'Edición Vigente'}
                        </span>
                    </div>
                    <h2 className="text-xl font-black text-white">
                        {summary?.seller?.name || 'Mi Cuenta'}
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={() => loadSummary().catch(() => {})}
                    disabled={loading}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Actualizar datos"
                    aria-label="Actualizar datos"
                >
                    <RotateCw className={`w-5 h-5 ${loading ? 'animate-spin text-red-500' : ''}`} />
                </button>
            </div>

            {/* Tarjeta Destacada: Cobrado por Rendir */}
            <MobileCard variant={cobradoSinRendir > 0 ? 'highlight' : 'default'}>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-300">
                            Por Rendir en Secretaría
                        </p>
                        <h3 className="text-2xl font-black text-white mt-1 tracking-tight tabular-nums">
                            {formatCurrency(cobradoSinRendir)}
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                        <Building2 className="w-5 h-5" />
                    </div>
                </div>

                {cobradoSinRendir > 0 ? (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1.5 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Tenés dinero de ventas/cuotas cobradas para rendir.</span>
                    </div>
                ) : (
                    <p className="mt-2 text-xs text-slate-400">
                        Estás al día con secretaría.
                    </p>
                )}
            </MobileCard>

            {/* Métricas de Cartones en cuadrícula */}
            <div className="grid grid-cols-3 gap-2">
                <MobileCard className="text-center p-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Asignados</p>
                    <p className="text-xl font-black text-white mt-0.5 tabular-nums">{totalAssigned}</p>
                </MobileCard>
                <MobileCard className="text-center p-3">
                    <p className="text-[11px] font-semibold text-emerald-400 uppercase">Vendidos</p>
                    <p className="text-xl font-black text-emerald-400 mt-0.5 tabular-nums">{totalSold}</p>
                </MobileCard>
                <MobileCard className="text-center p-3">
                    <p className="text-[11px] font-semibold text-amber-400 uppercase">Disponibles</p>
                    <p className="text-xl font-black text-amber-400 mt-0.5 tabular-nums">{totalAvailable}</p>
                </MobileCard>
            </div>

            {/* Comisión estimada acumulada */}
            <MobileCard className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-700/40 flex items-center justify-center text-emerald-400">
                            <Award className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Comisión estimada ({commissionRate}%)</p>
                            <p className="text-sm font-bold text-white tabular-nums">
                                {formatCurrency(comisionAcumulada)}
                            </p>
                        </div>
                    </div>
                    <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        Total vendido: {totalSold}
                    </span>
                </div>
            </MobileCard>

            {/* Acciones Rápidas */}
            <div className="pt-2 space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                    Operaciones Rápidas
                </h4>

                <button
                    type="button"
                    onClick={() => navigate('/vendedor/vender')}
                    className="w-full min-h-[52px] px-4 py-3 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-red-950/50 flex items-center justify-between transition-all"
                >
                    <div className="flex items-center gap-3">
                        <PlusCircle className="w-6 h-6" />
                        <div className="text-left">
                            <p className="text-sm font-bold leading-tight">Vender Cartón</p>
                            <p className="text-[11px] font-normal text-red-100">
                                Asigná un cartón a un asociado
                            </p>
                        </div>
                    </div>
                    <span className="text-xs bg-red-700/60 px-2.5 py-1 rounded-lg tabular-nums">
                        {totalAvailable} disp.
                    </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/vendedor/cuotas')}
                        className="min-h-[50px] p-3 bg-slate-800 hover:bg-slate-700/80 active:scale-[0.98] border border-slate-700 rounded-2xl flex flex-col items-start justify-center transition-all"
                    >
                        <CreditCard className="w-5 h-5 text-red-400 mb-1" />
                        <span className="text-xs font-bold text-white">Cobrar Cuota</span>
                        <span className="text-[11px] text-slate-400">Registrar pago</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/vendedor/cartones')}
                        className="min-h-[50px] p-3 bg-slate-800 hover:bg-slate-700/80 active:scale-[0.98] border border-slate-700 rounded-2xl flex flex-col items-start justify-center transition-all"
                    >
                        <Ticket className="w-5 h-5 text-amber-400 mb-1" />
                        <span className="text-xs font-bold text-white">Mis Cartones</span>
                        <span className="text-[11px] text-slate-400">Listado completo</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
