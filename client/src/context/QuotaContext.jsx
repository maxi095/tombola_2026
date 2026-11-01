import { createContext, useContext, useState, useCallback } from 'react';
import {
    getQuotasRequest,
    getQuotaRequest,
    createQuotaRequest,
    deleteQuotaRequest,
    updateQuotaRequest,
    getQuotasBySaleRequest,
    getExpiredQuotasRequest,
    getQuotasFilterRequest
} from "../api/quota.js";

const QuotaContext = createContext();

export const useQuotas = () => {
    const context = useContext(QuotaContext);
    if (!context) {
        throw new Error("useQuotas must be used within a QuotaProvider");
    }
    return context;
};

export const QuotaProvider = ({ children }) => {
    const [quotas, setQuotas] = useState([]);
    const [error, setError] = useState(null);

    const getQuotas = useCallback(async () => {
        try {
            const res = await getQuotasRequest();
            setQuotas(res.data);
        } catch (error) {
            setError(error);
            console.error(error);
        }
    }, []);

    const getQuotasFilter = useCallback(async ({ page = 1, limit = 10, filters = {}, sortBy } = {}) => {
        try {
            const params = {
                page,
                limit,
                ...filters,
            };

            if (sortBy) params.sortBy = sortBy;

            const res = await getQuotasFilterRequest(params);
            setQuotas(res.data);
            return res.data;
        } catch (error) {
            setError(error);
            console.error(error);
            return null;
        }
    }, []);

    const getQuota = async (id) => {
        try {
            const res = await getQuotaRequest(id);
            return res.data;
        } catch (error) {
            console.error("Error loading quota:", error);
            throw error;
        }
    };

    const createQuota = async (quota) => {
        try {
            const res = await createQuotaRequest(quota);
            setQuotas((prev) => [...prev, res.data]);
        } catch (error) {
            console.error("Error creating quota:", error);
        }
    };

    const updateQuota = async (id, quota) => {
        try {
            const res = await updateQuotaRequest(id, quota);
            const updatedQuota = res.data?.quota || res.data;
            setQuotas((prev) => Array.isArray(prev) ? prev.map(q => (q._id === id ? updatedQuota : q)) : prev);
            return res.data;
        } catch (error) {
            console.error("Error updating quota:", error);
        }
    };

    const deleteQuota = async (id) => {
        try {
            await deleteQuotaRequest(id);
            setQuotas((prev) => Array.isArray(prev) ? prev.filter(q => q._id !== id) : prev);
        } catch (error) {
            console.error("Error deleting quota:", error);
        }
    };

    const getQuotasBySale = useCallback(async (saleId) => {
        try {
            const res = await getQuotasBySaleRequest(saleId);
    
            if (!Array.isArray(res.data)) {
                throw new Error("Error: La respuesta no contiene un array de cuotas válido");
            }
    
            setQuotas(res.data);
            return res.data;
        } catch (error) {
            console.error("Error obteniendo cuotas:", error);
            setError(error);
            setQuotas([]);
            return [];
        }
    }, []);

    const getExpiredQuotas = useCallback(async () => {
        try {
            const res = await getExpiredQuotasRequest();
            setQuotas(res.data);
        } catch (error) {
            setError(error);
            console.error(error);
        }
    }, []);

    return (
        <QuotaContext.Provider value={{ quotas, createQuota, updateQuota, deleteQuota, getQuotas, getQuota, getQuotasBySale, getExpiredQuotas, error, getQuotasFilter }}>
            {children}
        </QuotaContext.Provider>
    );
};
