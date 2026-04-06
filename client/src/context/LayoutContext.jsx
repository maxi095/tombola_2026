import React, { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  // Estado persistente del Sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('isSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Estado persistente de los filtros
  const [isFilterExpanded, setIsFilterExpanded] = useState(() => {
    const saved = localStorage.getItem('isFilterExpanded');
    return saved ? JSON.parse(saved) : true;
  });

  // Nuevo estado volátil para el efecto Fly-out (Hover Expansion)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  useEffect(() => {
    localStorage.setItem('isSidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('isFilterExpanded', JSON.stringify(isFilterExpanded));
  }, [isFilterExpanded]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleFilters = () => setIsFilterExpanded(!isFilterExpanded);
  
  // Setter para el hover fly-out
  const setSidebarHovered = (value) => setIsSidebarHovered(value);

  return (
    <LayoutContext.Provider value={{ 
      isSidebarCollapsed, 
      toggleSidebar, 
      isFilterExpanded, 
      toggleFilters,
      isSidebarHovered,
      setSidebarHovered
    }}>
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
