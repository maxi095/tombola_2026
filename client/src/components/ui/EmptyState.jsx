import React from 'react';
import { Info } from 'lucide-react';

/**
 * EmptyState - Componente para estados vacíos estandarizado Slim 2026.
 */
export default function EmptyState({ 
  icon: Icon = Info, 
  title = "No hay datos disponibles", 
  message = "",
  className = "" 
}) {
  return (
    <div className={`py-12 px-6 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 transition-all ${className}`}>
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-5 shadow-sm border border-slate-100/50">
        <Icon size={32} className="opacity-20 text-primary" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">
        {title}
      </p>
      {message && (
        <p className="text-[11px] font-bold text-slate-400/80 text-center max-w-[250px] leading-relaxed">
          {message}
        </p>
      )}
    </div>
  );
}
