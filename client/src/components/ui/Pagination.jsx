import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../libs/cn";

/**
 * Pagination - Componente de Paginación Real Standard 2026
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange = () => {},
  className = "",
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < safeTotalPages;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100",
        className
      )}
    >
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest tabular-nums">
        Página <span className="text-primary">{currentPage}</span> de{" "}
        <span className="text-primary">{safeTotalPages}</span>
        {totalItems > 0 && (
          <span className="ml-2 text-slate-400">({totalItems} registros)</span>
        )}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => canGoPrev && onPageChange(currentPage - 1)}
          aria-label="Página anterior"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          aria-label="Página siguiente"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
