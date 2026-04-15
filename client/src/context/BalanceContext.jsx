import { createContext, useContext, useState } from 'react';
import {
  getBalancesRequest,
  getBalancesByEditionRequest,
  getBalanceSummaryRequest,
  getBalanceByIdRequest,
  createBalanceRequest,
  cancelBalanceRequest,
} from '../api/balance';

const BalanceContext = createContext();

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) throw new Error('useBalance debe usarse dentro de un BalanceProvider');
  return context;
};

export const BalanceProvider = ({ children }) => {
  const [balances, setBalances] = useState([]);
  const [summary, setSummary]   = useState({ totalIngresos: 0, totalEgresos: 0, netBalance: 0 });

  const getBalances = async () => {
    const res = await getBalancesRequest();
    setBalances(res.data);
    return res.data;
  };

  const getBalancesByEdition = async (editionId) => {
    const res = await getBalancesByEditionRequest(editionId);
    setBalances(res.data);
    return res.data;
  };

  const getBalanceSummary = async (editionId) => {
    const res = await getBalanceSummaryRequest(editionId);
    setSummary(res.data);
    return res.data;
  };

  const getBalanceById = async (id) => {
    const res = await getBalanceByIdRequest(id);
    return res.data;
  };

  const createBalance = async (data) => {
    const res = await createBalanceRequest(data);
    setBalances((prev) => [res.data, ...prev]);
    return res.data;
  };

  const cancelBalance = async (id) => {
    const res = await cancelBalanceRequest(id);
    setBalances((prev) =>
      prev.map((b) => (b._id === id ? res.data : b))
    );
    return res.data;
  };

  return (
    <BalanceContext.Provider
      value={{
        balances,
        summary,
        getBalances,
        getBalancesByEdition,
        getBalanceSummary,
        getBalanceById,
        createBalance,
        cancelBalance,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};
