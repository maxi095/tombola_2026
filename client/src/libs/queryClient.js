import { QueryClient } from "@tanstack/react-query";

/**
 * Configuración global de TanStack Query v5 (Standard 2026)
 * Optimizada para conexiones móviles 4G (PWA Vendedor) y tableros ejecutivos.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos de frescura en caché
      gcTime: 1000 * 60 * 10,   // 10 minutos en memoria antes de limpiar
      retry: 1,                 // 1 reintento automático ante microcortes 4G
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
