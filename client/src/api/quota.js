import axios from './axios';

// Obtener todas las cuotas
export const getQuotasRequest = () => axios.get('/quotas');

export const getQuotasFilterRequest = (params = {}) => {
  return axios.get('/quotasList', { params });
};

// Obtener una cuota por ID
export const getQuotaRequest = (id) => axios.get(`/quota/${id}`);

// Crear una nueva cuota
export const createQuotaRequest = (quota) => axios.post('/quota', quota);

// Actualizar una cuota
export const updateQuotaRequest = (id, quota) => axios.put(`/quota/${id}`, quota);

// Eliminar una cuota
export const deleteQuotaRequest = (id) => axios.delete(`/quota/${id}`);

// Obtener todas las cuotas de un bingo card
export const getQuotasBySaleRequest = (id) => axios.get(`/quotasBySale/${id}`);

export const getExpiredQuotasRequest = () => axios.get('/expiredQuotas');