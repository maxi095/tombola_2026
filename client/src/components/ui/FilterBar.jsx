import React, { useRef, useEffect, useState } from "react";
import { ChevronDown, Filter, SlidersHorizontal, X, FilterX } from "lucide-react";
import { useLayout } from "../../context/LayoutContext";

/**
 * FilterBar V8.5 - Elite 2026 (Institutional Standard v19.1) ✨💎🚀
 * Nomenclatura oficial pre-configurada por defecto.
 */
const FilterBar = ({ 
  children, 
  className = "", 
  title = "Panel de filtros", // ESTÁNDAR v19.0 🏹⚖️
  variant = "default", 
  isCollapsible = true,
  activeFilters = [],
  onRemoveFilter,
  onClearFilters
}) => {
  const { isFilterExpanded, setIsFilterExpanded, toggleFilters } = useLayout();
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const [isFading, setIsFading] = useState(false);
  
  const hasActiveFilters = activeFilters.length > 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterExpanded && containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFilterExpanded(false);
        setIsFading(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterExpanded, setIsFilterExpanded]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsFading(false);
  };

  const handleMouseLeave = () => {
    if (isFilterExpanded) {
      setTimeout(() => {
        if (timerRef.current) setIsFading(true);
      }, 500);

      timerRef.current = setTimeout(() => {
        setIsFilterExpanded(false);
        setIsFading(false);
      }, 1500);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (variant === "slim") {
    return (
      <div 
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative z-20 transition-all duration-500 ease-in-out group ${!isFilterExpanded ? 'min-h-[32px] cursor-default' : 'min-h-[72px]'} ${isFading ? 'opacity-50' : 'opacity-100'}`}
      >
        
        {!isFilterExpanded && (
          <div className="absolute inset-y-0 left-0 h-full flex items-center gap-3 py-1">
            
            <button 
              onClick={toggleFilters}
              className="flex items-center gap-2 hover:bg-slate-200/40 px-2 py-1 rounded-lg transition-all shrink-0 active:scale-95 text-slate-400 hover:text-slate-600"
              title="Expandir herramientas de filtrado"
            >
              <SlidersHorizontal size={12} className="text-primary/60" />
              <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                {title}
              </span>
              <ChevronDown size={11} className="opacity-40 group-hover:translate-y-0.5 transition-transform" />
            </button>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 border-l border-slate-200/60 pl-3 ml-1 shrink-0">
                {activeFilters.map((filter, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-slate-200/60 rounded-full text-slate-600 shadow-sm animate-in fade-in zoom-in duration-300"
                  >
                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-30">{filter.label}:</span>
                    <span className="text-[10px] font-bold tracking-tight">{filter.value}</span>
                    {onRemoveFilter && (
                      <button 
                        onClick={() => onRemoveFilter(filter.key)}
                        className="hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}

                {onClearFilters && (
                  <button 
                    onClick={onClearFilters}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 border border-transparent hover:border-red-100 px-2.5 py-0.5 rounded-full transition-all text-[9.5px] font-black uppercase tracking-widest ml-1 animate-pulse"
                  >
                    <FilterX size={12} />
                    Limpiar
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div 
          className={`transition-all duration-500 ease-in-out ${isFilterExpanded ? 'py-4 opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden'}`}
        >
          <div className="flex flex-wrap items-center gap-4 relative">
             {children}
             
             {isFilterExpanded && (
               <button 
                onClick={() => setIsFilterExpanded(false)}
                className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
               >
                 Ocultar
                 <X size={14} />
               </button>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`bg-white rounded-[24px] lg:rounded-[32px] border border-slate-100 shadow-sm mb-6 transition-all duration-500 overflow-hidden ${isFilterExpanded ? 'hover:shadow-md hover:border-indigo-100 pb-8' : 'pb-0 mb-4'} ${isFading ? 'opacity-60' : 'opacity-100'}`}
    >
      {isCollapsible && (
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
      )}

      <div className={`transition-all duration-500 ease-in-out px-8 ${isFilterExpanded || !isCollapsible ? 'opacity-100 max-h-[500px] visible' : 'opacity-0 max-h-0 invisible'}`}>
        <div className={`flex flex-wrap items-end gap-6 ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
