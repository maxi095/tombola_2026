import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    getQuotasRequest,
    getQuotaRequest,
    createQuotaRequest,
    deleteQuotaRequest,
    updateQuotaRequest,
    getQuotasBySaleRequest,
    getExpiredQuotasRequest,
    getQuotasFilterRequest
} from "../api/quota.js"; // Asegúrate de que la ruta sea correcta

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
    const [error, setError] = useState(null); // Estado para manejar errores

    const getQuotas = useCallback(async () => {
        try {
            const res = await getQuotasRequest(); // Asegúrate de que esta función esté definida
            setQuotas(res.data); // Asegúrate de que 'res.data' sea un arreglo
        } catch (error) {
            setError(error); // Maneja el error
            console.error(error);
        }
    }, []); // Asegúrate de que esto no cambie en futuras renderizaciones

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
        return res.data; // ✅ AHORA devuelve los datos esperados
    } catch (error) {
        setError(error);
        console.error(error);
        return null; // para evitar errores si algo falla
    }
    }, []);

    const getQuota = async (id) => {
        try {
            const res = await getQuotaRequest(id); // Asegúrate de que esta función esté definida
            return res.data; // Devuelve la cuota obtenida
        } catch (error) {
            console.error("Error loading quota:", error);
            throw error; // Lanza el error para que pueda ser manejado en el componente
        }
    };

    const createQuota = async (quota) => {
        try {
            const res = await createQuotaRequest(quota); // Asegúrate de que esta función esté definida
            setQuotas((prev) => [...prev, res.data]); // Agrega la nueva cuota a la lista
        } catch (error) {
            console.error("Error creating quota:", error);
        }
    };

    const updateQuota = async (id, quota) => {
        try {
            const res = await updateQuotaRequest(id, quota); // Asegúrate de que esta función esté definida
            setQuotas((prev) => prev.map(q => (q._id === id ? res.data : q))); // Actualiza la cuota en la lista
        } catch (error) {
            console.error("Error updating quota:", error);
        }
    };

    const deleteQuota = async (id) => {
        try {
            await deleteQuotaRequest(id); // Asegúrate de que esta función esté definida
            setQuotas((prev) => prev.filter(q => q._id !== id)); // Filtra la cuota eliminada
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
            return res.data;  // Retorna los datos obtenidos por si el componente que lo llama los necesita
        } catch (error) {
            console.error("Error obteniendo cuotas:", error);
            setError(error);
            setQuotas([]);  // Asegura que el estado no quede con datos erróneos
            return [];  // Devuelve un array vacío en caso de error
        }
    }, []);

    const getExpiredQuotas = useCallback(async () => {
        try {
            const res = await getExpiredQuotasRequest();
            setQuotas(res.data);
        } catch (error) {
            setError(error); // Maneja el error
            console.error(error);
        }
    }, []);
    
    


    useEffect(() => {
        getQuotas(); // Carga las cuotas al montar el componente
    }, [getQuotas]); // Añadido getQuotas a la lista de dependencias

    return (
        <QuotaContext.Provider value={{ quotas, createQuota, updateQuota, deleteQuota, getQuotas, getQuota, getQuotasBySale, getExpiredQuotas, error, getQuotasFilter }}>
            {children}
        </QuotaContext.Provider>
    );
};
