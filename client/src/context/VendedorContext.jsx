import { createContext, useContext, useState, useCallback } from 'react';
import {
    getVendedorSummaryRequest,
    getVendedorCardsRequest,
    getVendedorQuotasRequest,
    createVendedorSaleRequest,
    payVendedorQuotaRequest,
    searchClientsVendedorRequest,
    createClientVendedorRequest
} from '../api/vendedor.js';

const VendedorContext = createContext();

export const useVendedor = () => {
    const context = useContext(VendedorContext);
    if (!context) {
        throw new Error('useVendedor debe ser utilizado dentro de VendedorProvider');
    }
    return context;
};

export const VendedorProvider = ({ children }) => {
    const [summary, setSummary] = useState(null);
    const [cards, setCards] = useState([]);
    const [quotas, setQuotas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadSummary = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getVendedorSummaryRequest(params);
            setSummary(res.data);
            return res.data;
        } catch (err) {
            console.error('Error al cargar resumen de vendedor:', err);
            setError(err.response?.data?.message || 'Error al cargar resumen');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCards = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getVendedorCardsRequest(params);
            setCards(res.data);
            return res.data;
        } catch (err) {
            console.error('Error al cargar cartones:', err);
            setError(err.response?.data?.message || 'Error al cargar cartones');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const loadQuotas = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getVendedorQuotasRequest(params);
            setQuotas(res.data);
            return res.data;
        } catch (err) {
            console.error('Error al cargar cuotas:', err);
            setError(err.response?.data?.message || 'Error al cargar cuotas');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createSale = useCallback(async (saleData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createVendedorSaleRequest(saleData);
            // Actualizar resumen y cartones si estaban cargados
            return res.data;
        } catch (err) {
            console.error('Error al registrar venta rápida:', err);
            const msg = err.response?.data?.message || 'Error al registrar venta';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    const payQuota = useCallback(async (paymentData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await payVendedorQuotaRequest(paymentData);
            // Actualizar localmente el estado de la cuota pagada
            setQuotas((prev) =>
                prev.map((q) => (q._id === res.data.quota?._id ? { ...q, ...res.data.quota, status: 'Pagado' } : q))
            );
            return res.data;
        } catch (err) {
            console.error('Error al registrar pago de cuota:', err);
            const msg = err.response?.data?.message || 'Error al registrar pago';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    const searchClients = useCallback(async (query) => {
        if (!query || query.trim().length < 3) return [];
        try {
            const res = await searchClientsVendedorRequest(query.trim());
            return res.data;
        } catch (err) {
            console.error('Error buscando clientes:', err);
            return [];
        }
    }, []);

    const createClient = useCallback(async (clientData) => {
        try {
            const res = await createClientVendedorRequest(clientData);
            return res.data;
        } catch (err) {
            console.error('Error registrando cliente:', err);
            const msg = err.response?.data?.message || 'Error al registrar cliente';
            throw new Error(msg);
        }
    }, []);

    return (
        <VendedorContext.Provider
            value={{
                summary,
                cards,
                quotas,
                loading,
                error,
                loadSummary,
                loadCards,
                loadQuotas,
                createSale,
                payQuota,
                searchClients,
                createClient,
            }}
        >
            {children}
        </VendedorContext.Provider>
    );
};
