import React from "react";
import { ChevronDown, Filter, Search } from "lucide-react";
import { useLayout } from "../../context/LayoutContext";

/**
 * FilterBar V2 - Elite 2026 (Operational Fluidity)
 * Ahora es un componente adaptativo que permite colapsar los filtros
 * para recuperar hasta 180px de espacio vertical en tablas.
 */
const FilterBar = ({ children, className = "", title = "Panel de Filtros Avanzado" }) => {
  const { isFilterExpanded, toggleFilters } = useLayout();

  return (
    <div className={`bg-white rounded-[24px] lg:rounded-[32px] border border-slate-100 shadow-sm mb-6 transition-all duration-500 overflow-hidden ${isFilterExpanded ? 'hover:shadow-md hover:border-indigo-100 pb-8' : 'pb-0 mb-4'}`}>
      
      {/* Header del Acordeón ✨🚀 */}
      <div 
        onClick={toggleFilters}
        className={`flex items-center justify-between px-8 py-4 cursor-pointer transition-all ${!isFilterExpanded ? 'hover:bg-slate-50' : 'border-b border-slate-50 mb-6'}`}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Filter size={16} className={!isFilterExpanded ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">
              {title}
            </h3>
            {!isFilterExpanded && (
               <p className="text-[11px] font-bold text-indigo-500 mt-1 leading-none animate-in fade-in slide-in-from-left-1 duration-500">
                 Filtros activos • Clic para expandir
               </p>
            )}
          </div>
        </div>

        <button className={`p-2 rounded-xl text-slate-400 hover:text-indigo-600 transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Contenido Colapsable 🏹⚖️ */}
      <div className={`transition-all duration-500 ease-in-out px-8 ${isFilterExpanded ? 'opacity-100 max-h-[500px] visible' : 'opacity-0 max-h-0 invisible'}`}>
        <div className={`flex flex-wrap items-end gap-6 ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
