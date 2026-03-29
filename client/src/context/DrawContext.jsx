import { createContext, useContext, useState } from "react";
import {
  getDrawsRequest,
  getDrawRequest,
  getDrawsByEditionRequest,
  createDrawRequest,
  updateDrawRequest,
  deleteDrawRequest,
  registerWinnerRequest,
  registerDrawnNumbersRequest,
  getTopBingoCardsRequest,
  addDrawnNumberRequest,
  removeLastDrawnNumberRequest 
} from "../api/draw";

const DrawContext = createContext();

export const useDraws = () => {
  const context = useContext(DrawContext);
  if (!context) {
    throw new Error("useDraws must be used within a DrawProvider");
  }
  return context;
};

export function DrawProvider({ children }) {
  const [draws, setDraws] = useState([]);
  const [errors, setErrors] = useState([]);

  // Obtener todos los sorteos
  const getDraws = async () => {
    try {
      const res = await getDrawsRequest();
      setDraws(res.data);
      return res.data;
    } catch (error) {
      console.error("Error en getDraws:", error);
      setErrors(error.response?.data?.message || ["Error al obtener sorteos"]);
    }
  };

  // Obtener un sorteo por ID
  const getDraw = async (id) => {
    try {
      const res = await getDrawRequest(id);
      return res.data;
    } catch (error) {
      console.error("Error en getDraw:", error);
      setErrors(error.response?.data?.message || ["Error al obtener sorteo"]);
    }
  };

  // Obtener sorteos por edición
  const getDrawsByEdition = async (editionId) => {
    try {
      const res = await getDrawsByEditionRequest(editionId);
      return res.data;
    } catch (error) {
      console.error("Error en getDrawsByEdition:", error);
      setErrors(error.response?.data?.message || ["Error al obtener sorteos"]);
    }
  };

  // Crear sorteo
  const createDraw = async (draw) => {
    try {
      const res = await createDrawRequest(draw);
      setDraws([...draws, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error en createDraw:", error);
      setErrors(error.response?.data?.message || ["Error al crear sorteo"]);
      throw error;
    }
  };

  // Actualizar sorteo
  const updateDraw = async (id, draw) => {
    try {
      const res = await updateDrawRequest(id, draw);
      setDraws(draws.map((d) => (d._id === id ? res.data : d)));
      return res.data;
    } catch (error) {
      console.error("Error en updateDraw:", error);
      setErrors(error.response?.data?.message || ["Error al actualizar sorteo"]);
      throw error;
    }
  };

  // Eliminar sorteo
  const deleteDraw = async (id) => {
    try {
      await deleteDrawRequest(id);
      setDraws(draws.filter((d) => d._id !== id));
    } catch (error) {
      console.error("Error en deleteDraw:", error);
      setErrors(error.response?.data?.message || ["Error al eliminar sorteo"]);
    }
  };

  // Registrar ganador
  const registerWinner = async (data) => {
    try {
      const res = await registerWinnerRequest(data);
      setDraws(draws.map((d) => (d._id === res.data._id ? res.data : d)));
      return res.data;
    } catch (error) {
      console.error("Error en registerWinner:", error);
      setErrors(error.response?.data?.message || ["Error al registrar ganador"]);
      throw error;
    }
  };

  // Registrar números sorteados
  const registerDrawnNumbers = async (data) => {
    try {
      const res = await registerDrawnNumbersRequest(data);
      setDraws(draws.map((d) => (d._id === res.data._id ? res.data : d)));
      return res.data;
    } catch (error) {
      console.error("Error en registerDrawnNumbers:", error);
      setErrors(error.response?.data?.message || ["Error al registrar números"]);
      throw error;
    }
  };

  const getTopBingoCards = async (drawId) => {
  try {
    const res = await getTopBingoCardsRequest(drawId);
    return res.data;
  } catch (error) {
    console.error("Error en getTopBingoCards:", error);
    setErrors(error.response?.data?.message || ["Error al obtener top cartones"]);
    throw error;
  }
};

const addDrawnNumber = async (data) => {
  try {
    const res = await addDrawnNumberRequest(data);
    setDraws(draws.map((d) => (d._id === res.data._id ? res.data : d)));
    return res.data;
  } catch (error) {
    console.error("Error en addDrawnNumber:", error);
    setErrors(error.response?.data?.message || ["Error al agregar número"]);
    throw error;
  }
};

const removeLastDrawnNumber = async (data) => {
  try {
    const res = await removeLastDrawnNumberRequest(data);
    setDraws(draws.map((d) => (d._id === res.data._id ? res.data : d)));
    return res.data;
  } catch (error) {
    console.error("Error en removeLastDrawnNumber:", error);
    setErrors(error.response?.data?.message || ["Error al eliminar número"]);
    throw error;
  }
};

  return (
    <DrawContext.Provider
      value={{
        draws,
        errors,
        getDraws,
        getDraw,
        getDrawsByEdition,
        createDraw,
        updateDraw,
        deleteDraw,
        registerWinner,
        registerDrawnNumbers,
        getTopBingoCards,
        addDrawnNumber,
        removeLastDrawnNumber 
      }}
    >
      {children}
    </DrawContext.Provider>
  );
}