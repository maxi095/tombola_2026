import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const LayoutContext = createContext();

const readStoredBoolean = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;
    const parsed = JSON.parse(saved);
    return typeof parsed === 'boolean' ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const LayoutProvider = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() =>
    readStoredBoolean('isSidebarCollapsed', false)
  );

  const [isFilterExpanded, setIsFilterExpanded] = useState(() =>
    readStoredBoolean('isFilterExpanded', true)
  );

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('isSidebarCollapsed', JSON.stringify(isSidebarCollapsed));
    } catch {
      // Ignorar errores de cuota o modo privado
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem('isFilterExpanded', JSON.stringify(isFilterExpanded));
    } catch {
      // Ignorar errores de cuota o modo privado
    }
  }, [isFilterExpanded]);

  const toggleSidebar = useCallback(() => setIsSidebarCollapsed((prev) => !prev), []);
  const toggleFilters = useCallback(() => setIsFilterExpanded((prev) => !prev), []);
  const setSidebarHovered = useCallback((value) => setIsSidebarHovered(value), []);

  const value = useMemo(
    () => ({
      isSidebarCollapsed,
      toggleSidebar,
      isFilterExpanded,
      setIsFilterExpanded,
      toggleFilters,
      isSidebarHovered,
      setSidebarHovered,
    }),
    [isSidebarCollapsed, toggleSidebar, isFilterExpanded, toggleFilters, isSidebarHovered, setSidebarHovered]
  );

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
