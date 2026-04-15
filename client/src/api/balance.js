import axios from './axios';

// Obtener todos los movimientos de balance
export const getBalancesRequest = () => axios.get('/balances');

// Obtener movimientos de una edición específica
export const getBalancesByEditionRequest = (editionId) =>
  axios.get(`/balances/edition/${editionId}`);

// Obtener resumen KPIs (totalIngresos, totalEgresos, netBalance)
export const getBalanceSummaryRequest = (editionId) =>
  axios.get('/balances/summary', { params: { edition: editionId } });

// Obtener un movimiento por ID
export const getBalanceByIdRequest = (id) =>
  axios.get(`/balanceById/${id}`);

// Crear un nuevo movimiento de balance
export const createBalanceRequest = (data) =>
  axios.post('/balances', data);

// Anular un movimiento de balance
export const cancelBalanceRequest = (id) =>
  axios.put(`/cancelBalance/${id}`);
