import React from "react";

/**
 * FilterBar Component - Design System 2026
 * Envoltorio estético para las barras de filtrado en listados.
 * Proporciona el contenedor tipo 'Card' con sombra y bordes suaves.
 */
const FilterBar = ({ children, className = "" }) => {
  return (
    <div className={`flex flex-wrap items-end gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm mb-10 transition-all duration-500 hover:shadow-md hover:border-indigo-100 ${className}`}>
      {children}
    </div>
  );
};

export default FilterBar;
