import axios from "./axios";

export const getDrawsRequest = () => axios.get("/draws");

export const getDrawRequest = (id) => axios.get(`/draw/${id}`);

export const getDrawsByEditionRequest = (editionId) =>
  axios.get(`/draws/edition/${editionId}`);

export const createDrawRequest = (draw) => axios.post("/draw", draw);

export const updateDrawRequest = (id, draw) => axios.put(`/draw/${id}`, draw);

export const deleteDrawRequest = (id) => axios.delete(`/draw/${id}`);

export const registerWinnerRequest = (data) => axios.post("/draw/winner", data);

export const registerDrawnNumbersRequest = (data) =>
  axios.post("/draw/drawn-numbers", data);

export const getTopBingoCardsRequest = (drawId) => 
  axios.get(`/draw/${drawId}/top-cards`);

export const addDrawnNumberRequest = (data) => 
  axios.post("/draw/add-number", data);

export const removeLastDrawnNumberRequest = (data) => 
  axios.post("/draw/remove-last-number", data);