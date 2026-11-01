import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    getSalesRequest,
    getSaleRequest,
    createSaleRequest,
    deleteSaleRequest,
    updateSaleRequest,
    batchSalePaymentRequest,
    cancelSaleRequest,
    getSalesBySellerRequest
} from "../api/sale.js";

const SalesContext = createContext();

export const useSales = () => {
    const context = useContext(SalesContext);
    if (!context) {
        throw new Error("useSales must be used within a SalesProvider");
    }
    return context;
};

export const SalesProvider = ({ children }) => {
    const [sales, setSales] = useState([]); 
    const [error, setError] = useState(null);

    const getSales = useCallback(async () => {
        try {
            const res = await getSalesRequest();
            setSales(res.data);
        } catch (error) {
            setError(error);
            console.error(error);
        }
    }, []);

    const getSale = useCallback(async (id) => {
        try {
            const res = await getSaleRequest(id);
            return res.data; 
        } catch (error) {
            console.error("Error loading sale:", error);
            throw error; 
        }
    }, []);

    const createSale = async (sale) => {
        try {
            const res = await createSaleRequest(sale);
            setSales((prev) => [...prev, res.data]); 
        } catch (error) {
            console.error("Error creating sale:", error);
        }
    };

    const updateSale = async (id, sale) => {
        try {
            const res = await updateSaleRequest(id, sale);
            setSales((prev) => prev.map(s => (s._id === id ? res.data : s)));
            return res.data;
        } catch (error) {
            console.error("Error updating sale:", error);
        }
    };

    const batchSalePayment = async (id, payload) => {
        try {
            const res = await batchSalePaymentRequest(id, payload);
            if (res.data?.sale) {
                setSales((prev) => prev.map(s => (s._id === id ? res.data.sale : s)));
            }
            return res.data;
        } catch (error) {
            console.error("Error in batchSalePayment:", error);
            throw error;
        }
    };

    const deleteSale = async (id) => {
        try {
            await deleteSaleRequest(id);
            setSales((prev) => prev.filter(s => s._id !== id)); 
        } catch (error) {
            console.error("Error deleting sale:", error);
        }
    };

    const cancelSale = async (id) => {
        try {
            const res = await cancelSaleRequest(id);
            if (res.data) {
                setSales((prev) => prev.map(s => (s._id === id ? { ...s, status: "Anulada" } : s)));
            } else {
                console.error("Error: Respuesta vacía al cancelar la venta");
            }
        } catch (error) {
            console.error("Error canceling sale:", error);
        }
    };

    const getSalesBySeller = useCallback(async (sellerId) => {
        try {
          const res = await getSalesBySellerRequest(sellerId);
          return res.data;
        } catch (error) {
          console.error("Error obteniendo ventas por vendedor:", error);
          return [];
        }
    }, []);

    useEffect(() => {
        getSales();
    }, [getSales]);

    return (
        <SalesContext.Provider value={{ sales, createSale, updateSale, batchSalePayment, deleteSale, cancelSale, getSales, getSale, getSalesBySeller, error }}>
            {children}
        </SalesContext.Provider>
    );
};
