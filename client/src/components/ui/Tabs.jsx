import React from 'react';

/**
 * Tabs Component - Elite 2026 📑✨
 * Unifica la navegación por pestañas en todo el sistema con un diseño premium de alta densidad.
 * 
 * @param {Array} tabs - Lista de objetos { id, label, icon }
 * @param {string} activeTab - ID de la pestaña activa
 * @param {function} onChange - Callback al cambiar de pestaña
 * @param {boolean} showIcons - Si se deben mostrar los iconos (por defecto true)
 * @param {string} className - Clases adicionales para el contenedor
 */
export default function Tabs({ 
  tabs = [], 
  activeTab, 
  onChange, 
  showIcons = true,
  className = ""
}) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 bg-slate-100/60 backdrop-blur-md p-1 rounded-2xl w-fit border border-slate-200/50 shadow-sm ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 
              text-[10px] font-black uppercase tracking-[0.15em]
              ${isActive 
                ? 'bg-white text-primary shadow-sm border border-slate-200/50 scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/20'
              }
            `}
          >
            {showIcons && Icon && (
              <Icon 
                size={14} 
                className={`transition-colors duration-300 ${isActive ? 'text-primary' : 'text-slate-400 opacity-70'}`} 
              />
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
