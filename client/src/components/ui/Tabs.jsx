import React from 'react';
import { cn } from '../../libs/cn';

/**
 * Tabs Component - Standard 2026
 * Navegación por pestañas accesible con roles ARIA.
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
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 bg-slate-100/60 backdrop-blur-md p-1 rounded-2xl w-fit border border-slate-200/50 shadow-sm",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-200 text-[10px] font-black uppercase tracking-[0.15em]",
              isActive
                ? "bg-white text-primary shadow-sm border border-slate-200/50 scale-[1.02]"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/20"
            )}
          >
            {showIcons && Icon && (
              <Icon 
                size={14} 
                className={cn("transition-colors duration-200", isActive ? "text-primary" : "text-slate-400 opacity-70")} 
              />
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
