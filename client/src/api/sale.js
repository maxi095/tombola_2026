import axios from './axios';

// Obtener todas las ventas
export const getSalesRequest = () => axios.get('/sales');

// Obtener una venta por ID
export const getSaleRequest = (id) => axios.get(`/sale/${id}`);

// Crear una nueva venta
export const createSaleRequest = (sale) => axios.post('/sale', sale);

// Actualizar una venta
export const updateSaleRequest = (id, sale) => axios.put(`/sale/${id}`, sale);

// Operación atómica batch de pago/bonificación de venta
export const batchSalePaymentRequest = (id, payload) => axios.put(`/sale/${id}/batch-payment`, payload);

// Eliminar una venta
export const deleteSaleRequest = (id) => axios.delete(`/sale/${id}`);

// Anular una venta
export const cancelSaleRequest = (id, sale) => axios.put(`/cancelSale/${id}`, sale);

export const getSalesBySellerRequest = (sellerId) => axios.get(`/sales/seller/${sellerId}`);
