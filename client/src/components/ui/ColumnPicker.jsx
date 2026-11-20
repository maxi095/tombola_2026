import React, { useEffect, useRef } from "react";
import {
  Settings2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  RotateCcw
} from "lucide-react";

/**
 * ColumnPicker - Standard 2026
 * Gestiona visibilidad y orden de columnas con cierre por click externo y Escape.
 */
const ColumnPicker = ({
  columns,
  toggleVisibility,
  moveColumn,
  resetColumns,
  isOpen,
  onClose
}) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      role="dialog"
      aria-label="Selector de columnas"
      className="absolute right-0 top-12 w-80 bg-white border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] z-[60] p-6 animate-in slide-in-from-top-4 duration-200 ring-4 ring-slate-100/50"
    >
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-primary/60" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Columnas</h4>
        </div>
        <button
          type="button"
          onClick={resetColumns}
          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-primary transition-all"
          title="Restablecer vista"
          aria-label="Restablecer columnas"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="space-y-1.5 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
        {columns.map((col, index) => (
          <div
            key={col.id}
            className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all group border border-transparent ${col.isVisible ? 'hover:bg-slate-50/80 hover:border-slate-100' : 'opacity-40 grayscale-[0.5]'}`}
          >
            <button
              type="button"
              onClick={() => toggleVisibility(col.id)}
              disabled={col.isMandatory}
              aria-label={col.isMandatory ? `${col.label} obligatoria` : `${col.isVisible ? 'Ocultar' : 'Mostrar'} ${col.label}`}
              className={`p-2 rounded-xl transition-all shadow-sm ${col.isVisible ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'} ${col.isMandatory ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 active:scale-95'}`}
              title={col.isMandatory ? "Columna obligatoria" : "Mostrar/Ocultar"}
            >
              {col.isMandatory ? <Lock size={12} /> : (col.isVisible ? <Eye size={12} /> : <EyeOff size={12} />)}
            </button>

            <div className="flex-1 min-w-0">
              <span className={`text-[11px] font-black uppercase tracking-tight truncate block ${col.isVisible ? 'text-slate-600' : 'text-slate-400'}`}>
                {col.label}
              </span>
            </div>

            {!col.isFixed && (
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => moveColumn(col.id, 'up')}
                  aria-label={`Subir columna ${col.label}`}
                  className="p-1 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-lg transition-all disabled:opacity-30"
                  disabled={index === 0}
                >
                  <ChevronUp size={12} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={() => moveColumn(col.id, 'down')}
                  aria-label={`Bajar columna ${col.label}`}
                  className="p-1 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-lg transition-all disabled:opacity-30"
                  disabled={index === columns.length - 1 || columns[index + 1]?.isFixed}
                >
                  <ChevronDown size={12} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center italic border-t border-slate-50 pt-3">
        La vista se guardará automáticamente
      </div>
    </div>
  );
};

export default ColumnPicker;
