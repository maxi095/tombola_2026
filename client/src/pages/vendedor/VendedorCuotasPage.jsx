import { useEffect, useState, useMemo } from 'react';
import { useVendedor } from '../../context/VendedorContext';
import { useFeedback } from '../../context/FeedbackContext';
import { MobileCard } from '../../components/mobile/MobileCard';
import { formatCurrency, formatDocument } from '../../libs/formatters';
import {
    CreditCard,
    Search,
    RotateCw,
    CheckCircle2,
    Calendar,
    Banknote,
    Building2,
    X,
    Loader2,
    Share2
} from 'lucide-react';
import dayjs from 'dayjs';

export const VendedorCuotasPage = () => {
    const { quotas, loading, loadQuotas, payQuota, selectedEditionId, summary } = useVendedor();
    const { showToast } = useFeedback();

    const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'paid' | 'all'
    const [searchTerm, setSearchTerm] = useState('');

    // Modal de cobro de cuota
    const [selectedQuota, setSelectedQuota] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Efectivo'); // 'Efectivo' | 'Transferencia'
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        loadQuotas({ status: statusFilter });
    }, [loadQuotas, statusFilter, selectedEditionId]);

    const filteredQuotas = useMemo(() => {
        if (!quotas) return [];
        const term = searchTerm.trim().toLowerCase();
        if (!term) return quotas;

        return quotas.filter((q) => {
            const cardStr = String(q.cardNumber ?? q.bingoCardNumber ?? '');
            const clientName = (
                q.client?.fullName ||
                `${q.client?.lastName || ''} ${q.client?.firstName || ''}`
            ).toLowerCase();
            const dniStr = String(q.client?.dni || q.client?.document || '');
            return cardStr.includes(term) || clientName.includes(term) || dniStr.includes(term);
        });
    }, [quotas, searchTerm]);

    const handleConfirmPayment = async () => {
        if (!selectedQuota) return;

        setProcessingPayment(true);
        try {
            const amount = selectedQuota.totalAmount ?? selectedQuota.amount ?? 0;
            await payQuota({
                quotaId: selectedQuota._id || selectedQuota.id,
                paymentMethod,
            });

            showToast(
                `Cuota #${selectedQuota.quotaNumber} cobrada (${formatCurrency(amount)}). Recordá rendirla en secretaría.`,
                'success'
            );
            setSelectedQuota(null);
            loadQuotas({ status: statusFilter });
        } catch (err) {
            showToast(err.message || 'Error al registrar cobro de cuota', 'error');
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleShareWhatsApp = (quota) => {
        const clientName =
            quota.client?.fullName ||
            `${quota.client?.lastName || ''}, ${quota.client?.firstName || ''}`.trim() ||
            'Asociado';
        const cardNum = quota.cardNumber ?? quota.bingoCardNumber ?? '';
        const amountStr = formatCurrency(quota.totalAmount ?? quota.amount ?? 0);
        const editionName = summary?.edition?.name || '2026';

        const message = `*Club Atlético Newell's Old Boys* 🔴⚫\n*Tómbola NOB - Edición ${editionName}*\n\n✅ *Comprobante de Cobro de Cuota*\n• *Asociado:* ${clientName}\n• *Cartón:* #${cardNum}\n• *Cuota:* #${quota.quotaNumber}\n• *Monto Cobrado:* ${amountStr}\n• *Medio:* ${quota.paymentMethod || 'Efectivo'}\n\n¡Muchas gracias por su apoyo al club!`;

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white">Cobranzas</h2>
                    <p className="text-xs text-slate-400">
                        {summary?.edition?.name || 'Edición Vigente'} • Cuotas de tus ventas
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => loadQuotas({ status: statusFilter })}
                    disabled={loading}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all"
                    title="Actualizar cuotas"
                    aria-label="Actualizar cuotas"
                >
                    <RotateCw className={`w-5 h-5 ${loading ? 'animate-spin text-red-500' : ''}`} />
                </button>
            </div>

            {/* Búsqueda */}
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por asociado, DNI o cartón..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
            </div>

            {/* Chips de filtro */}
            <div className="flex items-center gap-2">
                {[
                    { id: 'pending', label: 'Pendientes' },
                    { id: 'paid', label: 'Cobradas' },
                    { id: 'all', label: 'Todas' },
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

            {/* Listado de cuotas */}
            <div className="space-y-2.5">
                {filteredQuotas.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/50">
                        <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-300">No hay cuotas encontradas</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {searchTerm
                                ? 'Probá cambiando el criterio de búsqueda'
                                : 'No se registran cuotas con el filtro seleccionado'}
                        </p>
                    </div>
                ) : (
                    filteredQuotas.map((quota) => {
                        const isPaid = quota.status === 'Pagado' || quota.isPaid;
                        const dueDate = quota.dueDate ? dayjs(quota.dueDate).format('DD/MM/YYYY') : '-';
                        const cardNum = quota.cardNumber ?? quota.bingoCardNumber ?? '';
                        const clientName =
                            quota.client?.fullName ||
                            `${quota.client?.lastName || ''}, ${quota.client?.firstName || ''}`.trim() ||
                            'Asociado Registrado';
                        const clientDoc = quota.client?.dni || quota.client?.document || '';
                        const amount = quota.totalAmount ?? quota.amount ?? 0;

                        return (
                            <MobileCard
                                key={quota._id || quota.id}
                                className={`p-3.5 transition-all ${
                                    isPaid ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-700'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                                Cuota #{quota.quotaNumber}
                                            </span>
                                            <span className="text-xs font-bold text-red-400">
                                                Cartón #{cardNum}
                                            </span>
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    isPaid
                                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                                                        : quota.isExpired
                                                        ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                                                        : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                                                }`}
                                            >
                                                {isPaid ? 'Cobrada' : quota.isExpired ? 'Vencida' : 'Pendiente'}
                                            </span>
                                        </div>

                                        <p className="text-xs font-bold text-slate-100 mt-1.5">
                                            {clientName}
                                        </p>
                                        <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                            {clientDoc && <span>DNI: {formatDocument(clientDoc)}</span>}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Vence: {dueDate}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-black text-white">
                                            {formatCurrency(amount)}
                                        </p>
                                        {isPaid ? (
                                            <div className="mt-1 flex items-center justify-end gap-1.5">
                                                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Cobrado</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleShareWhatsApp(quota)}
                                                    className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-950/60 active:scale-95 transition-colors"
                                                    title="Enviar comprobante por WhatsApp"
                                                >
                                                    <Share2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedQuota(quota);
                                                    setPaymentMethod('Efectivo');
                                                }}
                                                className="mt-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                                            >
                                                Cobrar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </MobileCard>
                        );
                    })
                )}
            </div>

            {/* Modal de cobro de cuota */}
            {selectedQuota && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-white">Registrar Cobranza</h3>
                                <p className="text-xs text-slate-400">Cobro presencial de cuota</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedQuota(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="my-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Asociado:</span>
                                <span className="font-bold text-white">
                                    {selectedQuota.client?.fullName ||
                                        `${selectedQuota.client?.lastName || ''}, ${selectedQuota.client?.firstName || ''}`.trim() ||
                                        'Asociado'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Cartón:</span>
                                <span className="font-bold text-red-400">
                                    #{selectedQuota.cardNumber ?? selectedQuota.bingoCardNumber ?? ''}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Cuota:</span>
                                <span className="font-bold text-white">#{selectedQuota.quotaNumber}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t border-slate-700/60">
                                <span className="text-slate-300 font-semibold">Total a cobrar:</span>
                                <span className="font-black text-emerald-400 text-sm">
                                    {formatCurrency(selectedQuota.totalAmount ?? selectedQuota.amount ?? 0)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <label className="text-xs text-slate-300 font-medium block">
                                Método de Cobro:
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('Efectivo')}
                                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                        paymentMethod === 'Efectivo'
                                            ? 'bg-red-600 border-red-500 text-white'
                                            : 'bg-slate-800 border-slate-700 text-slate-300'
                                    }`}
                                >
                                    <Banknote className="w-4 h-4" />
                                    <span>Efectivo</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('Transferencia')}
                                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                        paymentMethod === 'Transferencia'
                                            ? 'bg-red-600 border-red-500 text-white'
                                            : 'bg-slate-800 border-slate-700 text-slate-300'
                                    }`}
                                >
                                    <Building2 className="w-4 h-4" />
                                    <span>Transferencia</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedQuota(null)}
                                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                            >
                                Volver
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmPayment}
                                disabled={processingPayment}
                                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-950/40"
                            >
                                {processingPayment ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span>Confirmar Cobro</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
