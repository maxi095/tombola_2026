import axios from './axios';

// Obtener todas las tarjetas de bingo
export const getBingoCardsRequest = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const url = query ? `/bingoCards?${query}` : '/bingoCards';
  return axios.get(url);
};

// Obtener una tarjeta de bingo por ID
export const getBingoCardRequest = (id) => axios.get(`/bingoCard/${id}`);

// Crear una nueva tarjeta de bingo
export const createBingoCardRequest = (bingoCard) => axios.post('/bingoCard', bingoCard);

// Actualizar una tarjeta de bingo
export const updateBingoCardRequest = (id, bingoCard) => axios.put(`/bingoCard/${id}`, bingoCard);

// Eliminar una tarjeta de bingo
export const deleteBingoCardRequest = (id) => axios.delete(`/bingoCard/${id}`);

export const getBingoCardsWithSalesRequest = (params = {}) => axios.get('/bingoCardsWithSales', { params });

export const getBingoCardStatusRequest = (editionId, number) => 
    axios.get('/bingoCardStatus', {
      params: { edition: editionId, number }
    });

export const assignSellerToBingoCardRequest = (id, sellerId) => axios.put(`/bingoCard/assignSeller/${id}`, { sellerId });

export const removeSellerToBingoCardRequest = (id) => axios.put(`/bingoCard/removeSeller/${id}`);

export const getBingoCardsBySellerRequest = (sellerId) => axios.get(`/bingoCardsBySeller/${sellerId}`);
