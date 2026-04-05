import React from 'react';

/**
 * ModalSummary - Componente de Resumen Táctico para Modales
 * Estándar 2026: Caja de alta visibilidad para montos y datos clave.
 * 
 * @param {Object} props
 * @param {Array} props.items - Array de { label, value, icon: Icon }
 */
export default function ModalSummary({ items = [] }) {
  return (
    <div className="flex items-center justify-between p-6 bg-primary/5 rounded-[2rem] border border-primary/10 shadow-sm mb-8 animate-in slide-in-from-top-2">
      {items.map((item, index) => (
        <div key={index} className={index === items.length - 1 ? 'text-right' : 'text-left'}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 justify-end md:justify-start">
            {item.icon && <item.icon size={12} className="opacity-60" />}
            {item.label}
          </p>
          <div className="flex items-center gap-2 justify-end md:justify-start">
            <h3 className="text-2xl font-black text-primary font-manrope tracking-tight leading-none">
              {item.value}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}
