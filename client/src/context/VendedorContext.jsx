import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getVendedorSummaryRequest,
    getVendedorCardsRequest,
    getVendedorQuotasRequest,
    createVendedorSaleRequest,
    payVendedorQuotaRequest,
    searchClientsVendedorRequest,
    createClientVendedorRequest
} from "../api/vendedor.js";

const VendedorContext = createContext();

export const useVendedor = () => {
    const context = useContext(VendedorContext);
    if (!context) {
        throw new Error("useVendedor debe ser utilizado dentro de VendedorProvider");
    }
    return context;
};

export const VendedorProvider = ({ children }) => {
    const qc = useQueryClient();
    const [selectedEditionId, setSelectedEditionId] = useState("");
    const [cardStatusFilter, setCardStatusFilter] = useState("all");
    const [quotaStatusFilter, setQuotaStatusFilter] = useState("pending");
    const [cardsEnabled, setCardsEnabled] = useState(false);
    const [quotasEnabled, setQuotasEnabled] = useState(false);

    // 1. Query cacheada de Resumen + Ediciones
    const summaryQuery = useQuery({
        queryKey: ["vendedor", "summary", selectedEditionId || "default"],
        queryFn: async () => {
            const params = selectedEditionId ? { editionId: selectedEditionId } : {};
            const res = await getVendedorSummaryRequest(params);
            return res.data;
        },
    });

    const summary = summaryQuery.data || null;
    const editions = useMemo(() => summary?.editions || [], [summary]);

    // Sincronizar edición inicial al cargar el resumen
    useEffect(() => {
        if (summary?.edition?._id && !selectedEditionId) {
            setSelectedEditionId(summary.edition._id);
        }
    }, [summary, selectedEditionId]);

    // 2. Query cacheada de Cartones (por edición + estado)
    const cardsQuery = useQuery({
        queryKey: ["vendedor", "cards", selectedEditionId || "default", cardStatusFilter],
        queryFn: async () => {
            const params = {
                status: cardStatusFilter,
                ...(selectedEditionId ? { editionId: selectedEditionId } : {}),
            };
            const res = await getVendedorCardsRequest(params);
            return res.data;
        },
        enabled: cardsEnabled,
    });

    // 3. Query cacheada de Cuotas (por edición + estado)
    const quotasQuery = useQuery({
        queryKey: ["vendedor", "quotas", selectedEditionId || "default", quotaStatusFilter],
        queryFn: async () => {
            const params = {
                status: quotaStatusFilter,
                ...(selectedEditionId ? { editionId: selectedEditionId } : {}),
            };
            const res = await getVendedorQuotasRequest(params);
            return res.data;
        },
        enabled: quotasEnabled,
    });

    // 4. Mutación de Venta Rápida (invalida toda la caché de vendedor automáticamente)
    const createSaleMutation = useMutation({
        mutationFn: async (saleData) => {
            const payload = {
                ...saleData,
                editionId: saleData.editionId || selectedEditionId,
            };
            const res = await createVendedorSaleRequest(payload);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["vendedor"] });
        },
    });

    // 5. Mutación de Cobro de Cuota (invalida toda la caché de vendedor automáticamente)
    const payQuotaMutation = useMutation({
        mutationFn: async (paymentData) => {
            const res = await payVendedorQuotaRequest(paymentData);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["vendedor"] });
        },
    });

    // Handlers retrocompatibles con las pantallas móviles existentes
    const loadSummary = useCallback(async (editionIdParam) => {
        if (editionIdParam && editionIdParam !== selectedEditionId) {
            setSelectedEditionId(editionIdParam);
            return null;
        }
        const result = await summaryQuery.refetch();
        if (result.error) throw result.error;
        return result.data;
    }, [selectedEditionId, summaryQuery]);

    const loadCards = useCallback(async (params = {}) => {
        const nextStatus = params.status || "all";
        setCardStatusFilter(nextStatus);
        if (!cardsEnabled) {
            setCardsEnabled(true);
            return cardsQuery.data || [];
        }
        if (nextStatus === cardStatusFilter) {
            const result = await cardsQuery.refetch();
            if (result.error) throw result.error;
            return result.data;
        }
        return cardsQuery.data || [];
    }, [cardsEnabled, cardStatusFilter, cardsQuery]);

    const loadQuotas = useCallback(async (params = {}) => {
        const nextStatus = params.status || "pending";
        setQuotaStatusFilter(nextStatus);
        if (!quotasEnabled) {
            setQuotasEnabled(true);
            return quotasQuery.data || [];
        }
        if (nextStatus === quotaStatusFilter) {
            const result = await quotasQuery.refetch();
            if (result.error) throw result.error;
            return result.data;
        }
        return quotasQuery.data || [];
    }, [quotasEnabled, quotaStatusFilter, quotasQuery]);

    const changeEdition = useCallback((newEditionId) => {
        setSelectedEditionId(newEditionId);
    }, []);

    const createSale = useCallback(async (saleData) => {
        try {
            return await createSaleMutation.mutateAsync(saleData);
        } catch (err) {
            const msg = err.response?.data?.message || "Error al registrar venta";
            throw new Error(msg);
        }
    }, [createSaleMutation]);

    const payQuota = useCallback(async (paymentData) => {
        try {
            return await payQuotaMutation.mutateAsync(paymentData);
        } catch (err) {
            const msg = err.response?.data?.message || "Error al registrar pago";
            throw new Error(msg);
        }
    }, [payQuotaMutation]);

    const searchClients = useCallback(async (query) => {
        if (!query || query.trim().length < 3) return [];
        try {
            const res = await searchClientsVendedorRequest(query.trim());
            return res.data;
        } catch (err) {
            console.error("Error buscando clientes:", err);
            return [];
        }
    }, []);

    const createClient = useCallback(async (clientData) => {
        try {
            const res = await createClientVendedorRequest(clientData);
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.message || "Error al registrar cliente";
            throw new Error(msg);
        }
    }, []);

    const loading =
        summaryQuery.isFetching ||
        cardsQuery.isFetching ||
        quotasQuery.isFetching ||
        createSaleMutation.isPending ||
        payQuotaMutation.isPending;

    const rawError = summaryQuery.error || cardsQuery.error || quotasQuery.error;
    const error = rawError
        ? rawError.response?.data?.message || rawError.message || "Error de conexión"
        : null;

    const value = useMemo(
        () => ({
            summary,
            editions,
            selectedEditionId,
            changeEdition,
            cards: cardsQuery.data || [],
            quotas: quotasQuery.data || [],
            loading,
            error,
            loadSummary,
            loadCards,
            loadQuotas,
            createSale,
            payQuota,
            searchClients,
            createClient,
        }),
        [
            summary,
            editions,
            selectedEditionId,
            changeEdition,
            cardsQuery.data,
            quotasQuery.data,
            loading,
            error,
            loadSummary,
            loadCards,
            loadQuotas,
            createSale,
            payQuota,
            searchClients,
            createClient,
        ]
    );

    return (
        <VendedorContext.Provider value={value}>
            {children}
        </VendedorContext.Provider>
    );
};
