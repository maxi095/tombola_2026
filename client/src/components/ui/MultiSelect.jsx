import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";

/**
 * MultiSelect Component - Premium 2026 v3 (Navy Alignment)
 * Sistema de selección múltiple con visualización de etiquetas dinámicas (Chips).
 */
const MultiSelect = ({ 
  label, 
  options = [], 
  value = [], 
  onChange = () => {},
  error,
  placeholder = "Seleccionar opciones...",
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optValue) => {
    const newValue = value.includes(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange(newValue);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-[11px] font-black text-muted uppercase tracking-[0.2em] ml-1">
          {label}
        </label>
      )}

      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full min-h-[58px] bg-slate-50 border-2 border-transparent 
            rounded-premium-input px-6 py-3 flex flex-wrap gap-2 items-center
            cursor-pointer group hover:bg-white hover:border-primary/5 transition-all
            ${isOpen ? "bg-white ring-8 ring-primary/5 border-primary/10 shadow-sm" : ""}
            ${error ? "border-red-500/50 bg-red-50/10" : ""}
          `}
        >
          {value.length > 0 ? (
            value.map((v) => {
              const opt = options.find(o => o.value === v);
              return (
                <span key={v} className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-primary/10 flex items-center gap-2 group-hover:bg-primary group-hover:text-white transition-all cursor-default">
                  {opt?.label || v}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(v);
                    }}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })
          ) : (
            <span className="text-slate-300 text-sm font-bold">{placeholder}</span>
          )}

          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary transition-colors">
            <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-[100] w-full mt-3 bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-primary/10 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => toggleOption(opt.value)}
                  className={`
                    px-5 py-3 rounded-2xl text-[12px] font-bold cursor-pointer transition-all
                    ${value.includes(opt.value) 
                      ? "bg-primary text-white" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary"}
                  `}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2">
          {error}
        </p>
      )}
    </div>
  );
};

export default MultiSelect;
