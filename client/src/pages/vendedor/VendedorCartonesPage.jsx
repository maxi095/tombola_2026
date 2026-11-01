import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendedor } from '../../context/VendedorContext';
import { MobileCard } from '../../components/mobile/MobileCard';
import { Ticket, Search, PlusCircle, RotateCw, CheckCircle2 } from 'lucide-react';

export const VendedorCartonesPage = () => {
    const { cards, loading, loadCards } = useVendedor();
    const navigate = useNavigate();

    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'disponible' | 'vendido'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCards({ status: statusFilter });
    }, [loadCards, statusFilter]);

    const filteredCards = useMemo(() => {
        if (!cards) return [];
        return cards.filter((card) => {
            const numStr = String(card.cardNumber || '');
            if (searchTerm.trim() && !numStr.includes(searchTerm.trim())) {
                return false;
            }
            return true;
        });
    }, [cards, searchTerm]);

    return (
        <div className="space-y-4">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white">Mis Cartones</h2>
                    <p className="text-xs text-slate-400">Cartones asignados para esta edición</p>
                </div>
                <button
                    type="button"
                    onClick={() => loadCards({ status: statusFilter })}
                    disabled={loading}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all"
                    title="Actualizar cartones"
                    aria-label="Actualizar cartones"
                >
                    <RotateCw className={`w-5 h-5 ${loading ? 'animate-spin text-red-500' : ''}`} />
                </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Buscar por número de cartón..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
            </div>

            {/* Chips de filtro */}
            <div className="flex items-center gap-2">
                {[
                    { id: 'all', label: 'Todos' },
                    { id: 'disponible', label: 'Disponibles' },
                    { id: 'vendido', label: 'Vendidos' },
                ].map((chip) => (
                    <button
                        key={chip.id}
                        type="button"
                        onClick={() => setStatusFilter(chip.id)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                            statusFilter === chip.id
                                ? 'bg-red-600 text-white shadow-sm shadow-red-950/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        {chip.label}
                    </button>
                ))}
            </div>

            {/* Listado de cartones */}
            <div className="space-y-2.5">
                {filteredCards.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/50">
                        <Ticket className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-300">No se encontraron cartones</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {searchTerm
                                ? 'Probá con otro número de búsqueda'
                                : 'No tenés cartones asignados bajo este filtro'}
                        </p>
                    </div>
                ) : (
                    filteredCards.map((card) => {
                        const isSold = card.status === 'Vendido' || card.isSold;
                        return (
                            <MobileCard
                                key={card._id}
                                className="flex items-center justify-between gap-3 p-3.5"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base border ${
                                            isSold
                                                ? 'bg-slate-900 border-slate-700 text-slate-400'
                                                : 'bg-red-950/40 border-red-800/40 text-red-400'
                                        }`}
                                    >
                                        #{card.cardNumber}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    isSold
                                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                                        : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                                }`}
                                            >
                                                {isSold ? 'Vendido' : 'Disponible'}
                                            </span>
                                            {card.sale?.paymentType && (
                                                <span className="text-[10px] text-slate-400">
                                                    {card.sale.paymentType === 'Contado' ? 'Contado' : 'En Cuotas'}
                                                </span>
                                            )}
                                        </div>

                                        {isSold && card.sale?.client ? (
                                            <p className="text-xs text-slate-200 mt-1 font-medium truncate max-w-[170px]">
                                                {card.sale.client.lastName}, {card.sale.client.firstName}
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                Listo para la venta
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {!isSold ? (
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/vendedor/vender?cardNumber=${card.cardNumber}`)}
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0 min-h-[40px]"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Vender</span>
                                    </button>
                                ) : (
                                    <div className="text-right flex-shrink-0">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                                    </div>
                                )}
                            </MobileCard>
                        );
                    })
                )}
            </div>
        </div>
    );
};
