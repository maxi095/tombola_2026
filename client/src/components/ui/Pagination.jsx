import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination Component - Premium 2026 v3 (Navy Alignment)
 * Control de navegación estandarizado para listados de datos.
 */
const Pagination = ({ 
  currentPage = 1, 
  totalItems = 0, 
  onPageChange = () => {},
  className = "" 
}) => {
  return (
    <div className={`px-10 py-8 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center ${className}`}>
      <p className="text-[11px] font-black text-muted uppercase tracking-[0.3em]">
        Mostrando <span className="text-primary">{totalItems}</span> registros encontrados
      </p>
      <div className="flex items-center gap-3">
        <button 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm"
          disabled={currentPage === 1}
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-primary text-white font-black text-[12px] shadow-lg shadow-primary/20 scale-110">
            {currentPage}
          </button>
        </div>

        <button 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm" 
          disabled={true} // Por ahora estático hasta implementar lógica real de páginas
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
