import { createContext, useContext, useState, useEffect } from 'react';
import {
  getSellerPaymentsRequest,
  getSellerPaymentsBySellerRequest,
  createSellerPaymentRequest,
  deleteSellerPaymentRequest,
  cancelSellerPaymentRequest,
  getSellerPaymentByIdRequest,
  updateSellerPaymentRequest
} from '../api/sellerPayment';

const SellerPaymentContext = createContext();

export const useSellerPayments = () => {
  const context = useContext(SellerPaymentContext);
  if (!context) throw new Error('useSellerPayments debe usarse dentro de un SellerPaymentProvider');
  return context;
};

export const SellerPaymentProvider = ({ children }) => {
  const [sellerPayments, setSellerPayments] = useState([]);

  const getSellerPayments = async () => {
    const res = await getSellerPaymentsRequest();
    setSellerPayments(res.data);
  };

  const getSellerPaymentsBySeller = async (sellerId) => {
    const res = await getSellerPaymentsBySellerRequest(sellerId);
    return res.data;
  };

  const getSellerPaymentById = async (id) => {
    const res = await getSellerPaymentByIdRequest(id);
    return res.data;
  };

  const createSellerPayment = async (paymentData) => {
    const res = await createSellerPaymentRequest(paymentData);
    setSellerPayments((prev) => [...prev, res.data]);
  };

  const deleteSellerPayment = async (id) => {
    await deleteSellerPaymentRequest(id);
    setSellerPayments((prev) => prev.filter((p) => p._id !== id));
  };

  const cancelSellerPayment = async (id) => {
    try {
      await cancelSellerPaymentRequest(id); // hacé el request al backend
      await getSellerPayments(); // actualiza la lista
    } catch (error) {
      console.error("Error al cancelar pago:", error);
    }
  };

  const updateSellerPayment = async (id, updates) => {
    try {
      const res = await updateSellerPaymentRequest(id, updates);
      return res.data; // Esto actualiza el componente
    } catch (error) {
      console.error("Error actualizando el pago de vendedor:", error);
      throw error;
    }
  };

  useEffect(() => {
    getSellerPayments();
  }, []);

  return (
    <SellerPaymentContext.Provider
      value={{
        sellerPayments,
        getSellerPayments,
        getSellerPaymentsBySeller,
        createSellerPayment,
        deleteSellerPayment,
        cancelSellerPayment,
        getSellerPaymentById,
        updateSellerPayment
      }}
    >
      {children}
    </SellerPaymentContext.Provider>
  );
};
