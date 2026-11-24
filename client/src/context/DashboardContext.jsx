import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardRequest } from "../api/dashboard";

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard debe usarse dentro de un DashboardProvider");
  return context;
};

/**
 * DashboardProvider - Potenciado con TanStack Query v5
 * Cachea las agregaciones pesadas de MongoDB por edición para cambios instantáneos.
 */
export const DashboardProvider = ({ children }) => {
  const qc = useQueryClient();
  const [activeEditionId, setActiveEditionId] = useState(null);

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", activeEditionId],
    queryFn: async () => {
      const res = await getDashboardRequest(activeEditionId);
      return res.data;
    },
    enabled: Boolean(activeEditionId),
  });

  const getDashboard = useCallback(
    async (editionId) => {
      if (!editionId) return;
      if (editionId === activeEditionId) {
        await qc.invalidateQueries({ queryKey: ["dashboard", editionId] });
      } else {
        setActiveEditionId(editionId);
      }
    },
    [activeEditionId, qc]
  );

  const value = useMemo(
    () => ({
      dashboardData: dashboardQuery.data || null,
      loading: dashboardQuery.isLoading || dashboardQuery.isFetching,
      error: dashboardQuery.error ? "Error al obtener estadísticas." : null,
      getDashboard,
    }),
    [dashboardQuery.data, dashboardQuery.isLoading, dashboardQuery.isFetching, dashboardQuery.error, getDashboard]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
