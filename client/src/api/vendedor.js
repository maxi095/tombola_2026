import axios from './axios';

export const getVendedorSummaryRequest = (params) => axios.get('/vendedor/summary', { params });
export const getVendedorCardsRequest = (params) => axios.get('/vendedor/cards', { params });
export const getVendedorQuotasRequest = (params) => axios.get('/vendedor/quotas', { params });
export const createVendedorSaleRequest = (data) => axios.post('/vendedor/sale', data);
export const payVendedorQuotaRequest = (data) => axios.post('/vendedor/quota-payment', data);
export const searchClientsVendedorRequest = (query) => axios.get('/clients/search', { params: { q: query } });
export const createClientVendedorRequest = (data) => axios.post('/clients', data);
