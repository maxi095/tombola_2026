import axios from './axios';

// Obtener todos los pagos registrados de todos los vendedores
export const getSellerPaymentsRequest = () => axios.get('/sellerPayments');

// Obtener pagos de un vendedor específico
export const getSellerPaymentsBySellerRequest = (sellerId) =>
  axios.get(`/sellerPayments/seller/${sellerId}`);

// Crear un nuevo pago
export const createSellerPaymentRequest = (payment) =>
  axios.post('/sellerPayments', payment);

// Eliminar un pago por ID
export const deleteSellerPaymentRequest = (id) =>
  axios.delete(`/sellerPayments/${id}`);

export const cancelSellerPaymentRequest = (id, payment) => axios.put(`/cancelSellerPayment/${id}`, payment);

export const getSellerPaymentByIdRequest = (id) =>
  axios.get(`/sellerPaymentById/${id}`);

export const updateSellerPaymentRequest = (id, payment) => axios.put(`/sellerPayments/${id}`, payment)
