import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVendedor } from '../../context/VendedorContext';
import { useFeedback } from '../../context/FeedbackContext';
import { MobileCard } from '../../components/mobile/MobileCard';
import { formatCurrency, formatDocument } from '../../libs/formatters';
import {
    Ticket,
    UserCheck,
    UserPlus,
    Search,
    CreditCard,
    DollarSign,
    ArrowLeft,
    CheckCircle2,
    X,
    Loader2
} from 'lucide-react';

export const VendedorVentaPage = () => {
    const { summary, loadSummary, loadCards, cards, createSale, searchClients, createClient } = useVendedor();
    const { showToast } = useFeedback();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialCardNumber = searchParams.get('cardNumber') || '';

    // Estado del formulario de venta
    const [selectedCard, setSelectedCard] = useState(initialCardNumber);
    const [selectedClient, setSelectedClient] = useState(null);
    const [paymentType, setPaymentType] = useState('Cuotas'); // 'Cuotas' | 'Contado'
    const [submitting, setSubmitting] = useState(false);

    // Estado de búsqueda de cliente
    const [clientQuery, setClientQuery] = useState('');
    const [clientResults, setClientResults] = useState([]);
    const [searchingClient, setSearchingClient] = useState(false);

    // Modal de nuevo cliente
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [newClientData, setNewClientData] = useState({
        dni: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
    });
    const [creatingClient, setCreatingClient] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        if (!summary) {
            loadSummary();
        }
        loadCards({ status: 'disponible' });
    }, [loadSummary, loadCards, summary]);

    // Preseleccionar si venía por URL
    useEffect(() => {
        if (initialCardNumber) {
            setSelectedCard(initialCardNumber);
        }
    }, [initialCardNumber]);

    // Búsqueda debounce de clientes
    useEffect(() => {
        if (!clientQuery || clientQuery.trim().length < 3) {
            setClientResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearchingClient(true);
            try {
                const results = await searchClients(clientQuery.trim());
                setClientResults(results || []);
            } catch (err) {
                console.error(err);
            } finally {
                setSearchingClient(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [clientQuery, searchClients]);

    // Manejo de creación rápida de cliente
    const handleCreateClient = async (e) => {
        e.preventDefault();
        if (!newClientData.dni || !newClientData.firstName || !newClientData.lastName) {
            showToast('DNI, Nombre y Apellido son obligatorios', 'error');
            return;
        }

        setCreatingClient(true);
        try {
            const created = await createClient(newClientData);
            setSelectedClient(created);
            setShowNewClientModal(false);
            setNewClientData({ dni: '', firstName: '', lastName: '', phone: '', address: '' });
            setClientQuery('');
            setClientResults([]);
            showToast('Asociado registrado y seleccionado', 'success');
        } catch (err) {
            showToast(err.message || 'Error al registrar asociado', 'error');
        } finally {
            setCreatingClient(false);
        }
    };

    // Confirmación de venta
    const handleConfirmSale = async () => {
        if (!selectedCard) {
            showToast('Debés seleccionar un cartón para la venta', 'error');
            return;
        }
        if (!selectedClient) {
            showToast('Debés seleccionar o registrar un asociado', 'error');
            return;
        }

        const editionId = summary?.edition?._id;
        const price = summary?.edition?.price || 0;

        setSubmitting(true);
        try {
            await createSale({
                cardNumber: Number(selectedCard),
                clientId: selectedClient._id,
                paymentType,
                price,
                editionId,
            });

            showToast(`¡Venta del cartón #${selectedCard} confirmada!`, 'success');
            navigate('/vendedor/cartones');
        } catch (err) {
            showToast(err.message || 'Error al confirmar la venta', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const availableCards = (cards || []).filter((c) => c.status === 'Disponible' || !c.isSold);
    const editionPrice = summary?.edition?.price || 0;
    const quotasCount = summary?.edition?.quotasCount || 10;
    const quotaPrice = quotasCount > 0 ? editionPrice / quotasCount : 0;

    return (
        <div className="space-y-4">
            {/* Header con botón Volver */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all"
                    title="Volver"
                    aria-label="Volver"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-xl font-black text-white">Registrar Venta</h2>
                    <p className="text-xs text-slate-400">Venta rápida de cartón asignado</p>
                </div>
            </div>

            {/* Paso 1: Selección de Cartón */}
            <MobileCard>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Ticket className="w-4 h-4" /> Paso 1: Cartón
                    </span>
                    <span className="text-[11px] text-slate-400">
                        {availableCards.length} disponibles
                    </span>
                </div>

                {availableCards.length === 0 ? (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300">
                        No tenés cartones disponibles para vender en esta edición.
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-xs text-slate-300 block">Número de cartón a vender:</label>
                        <select
                            value={selectedCard}
                            onChange={(e) => setSelectedCard(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-red-500"
                        >
                            <option value="">-- Seleccionar cartón --</option>
                            {availableCards.map((c) => (
                                <option key={c._id || c.cardNumber} value={c.cardNumber}>
                                    Cartón #{c.cardNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </MobileCard>

            {/* Paso 2: Selección o Alta de Asociado */}
            <MobileCard>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" /> Paso 2: Asociado / Comprador
                    </span>
                    <button
                        type="button"
                        onClick={() => setShowNewClientModal(true)}
                        className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 active:scale-95"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Nuevo</span>
                    </button>
                </div>

                {selectedClient ? (
                    <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                    {selectedClient.lastName}, {selectedClient.firstName}
                                </span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                DNI: {formatDocument(selectedClient.dni)} {selectedClient.phone ? `• Tel: ${selectedClient.phone}` : ''}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedClient(null)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                            title="Cambiar asociado"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por DNI o Apellido (mín. 3 letras)..."
                                value={clientQuery}
                                onChange={(e) => setClientQuery(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                            />
                            {searchingClient && (
                                <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-red-500 animate-spin" />
                            )}
                        </div>

                        {/* Resultados de búsqueda */}
                        {clientResults.length > 0 && (
                            <div className="max-h-44 overflow-y-auto divide-y divide-slate-800 bg-slate-900 rounded-xl border border-slate-700">
                                {clientResults.map((cli) => (
                                    <button
                                        key={cli._id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedClient(cli);
                                            setClientQuery('');
                                            setClientResults([]);
                                        }}
                                        className="w-full text-left p-2.5 hover:bg-slate-800 active:bg-slate-700 flex items-center justify-between transition-colors"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-white">
                                                {cli.lastName}, {cli.firstName}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                DNI: {formatDocument(cli.dni)}
                                            </p>
                                        </div>
                                        <span className="text-[11px] text-red-400 font-medium">Seleccionar</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {clientQuery.trim().length >= 3 && !searchingClient && clientResults.length === 0 && (
                            <div className="text-center py-3 bg-slate-900 rounded-xl border border-slate-800">
                                <p className="text-xs text-slate-400">No se encontró ningún asociado</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewClientData((prev) => ({ ...prev, lastName: clientQuery }));
                                        setShowNewClientModal(true);
                                    }}
                                    className="mt-1 text-xs text-red-400 hover:underline font-semibold"
                                >
                                    + Crear asociado con este dato
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </MobileCard>

            {/* Paso 3: Forma de Pago */}
            <MobileCard>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" /> Paso 3: Forma de Pago
                    </span>
                    <span className="text-xs font-black text-white">
                        Total: {formatCurrency(editionPrice)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                        type="button"
                        onClick={() => setPaymentType('Cuotas')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                            paymentType === 'Cuotas'
                                ? 'bg-red-950/40 border-red-500 text-white shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold">En Cuotas</span>
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] text-slate-300">
                            {quotasCount} cuotas de {formatCurrency(quotaPrice)}
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => setPaymentType('Contado')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                            paymentType === 'Contado'
                                ? 'bg-red-950/40 border-red-500 text-white shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold">Contado</span>
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] text-slate-300">
                            Pago total inmediato
                        </p>
                    </button>
                </div>
            </MobileCard>

            {/* Botón de Confirmación */}
            <div className="pt-2">
                <button
                    type="button"
                    onClick={handleConfirmSale}
                    disabled={submitting || !selectedCard || !selectedClient}
                    className="w-full min-h-[50px] py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Confirmando venta...</span>
                        </>
                    ) : (
                        <span>Confirmar Venta</span>
                    )}
                </button>
            </div>

            {/* Modal Rápido de Nuevo Asociado */}
            {showNewClientModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-white">Registrar Asociado</h3>
                                <p className="text-xs text-slate-400">Datos para la venta del cartón</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowNewClientModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateClient} className="space-y-3 mt-4">
                            <div>
                                <label className="text-xs text-slate-300 font-medium block mb-1">
                                    DNI / CUIT *
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    placeholder="Ej: 35123456"
                                    value={newClientData.dni}
                                    onChange={(e) =>
                                        setNewClientData({ ...newClientData, dni: e.target.value })
                                    }
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-slate-300 font-medium block mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Juan"
                                        value={newClientData.firstName}
                                        onChange={(e) =>
                                            setNewClientData({ ...newClientData, firstName: e.target.value })
                                        }
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-300 font-medium block mb-1">
                                        Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Pérez"
                                        value={newClientData.lastName}
                                        onChange={(e) =>
                                            setNewClientData({ ...newClientData, lastName: e.target.value })
                                        }
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-300 font-medium block mb-1">
                                    Teléfono Celular
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Ej: 341 5123456"
                                    value={newClientData.phone}
                                    onChange={(e) =>
                                        setNewClientData({ ...newClientData, phone: e.target.value })
                                    }
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-300 font-medium block mb-1">
                                    Dirección / Localidad
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Rosario"
                                    value={newClientData.address}
                                    onChange={(e) =>
                                        setNewClientData({ ...newClientData, address: e.target.value })
                                    }
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewClientModal(false)}
                                    className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                                >
                                    Volver
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingClient}
                                    className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                                >
                                    {creatingClient ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <span>Guardar Asociado</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
