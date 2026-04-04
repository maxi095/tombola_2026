import React from 'react';

/**
 * Card Component - Premium 2026 v3.2 (High Fidelity)
 * Ahora soporta cabeceras institucionales automáticas (Title, Icon, Description).
 */
export default function Card({ 
  children, 
  title,
  icon: Icon,
  description,
  hover = true, 
  variant = 'default',
  className = '', 
  padding = 'p-8 md:p-10',
  ...props 
}) {
  const baseStyles = "bg-white rounded-premium-card transition-all duration-700 overflow-hidden";
  
  const variants = {
    default: "border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.012)]",
    elevated: "shadow-premium border-b border-r border-slate-200/40",
    outline: "border-2 border-slate-50 bg-transparent"
  };

  const hoverStyles = hover ? "hover:border-primary/5 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1" : "";

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${padding} ${className}`}
      {...props}
    >
      {(title || Icon) && (
        <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-8">
          {Icon && (
            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary shadow-inner border border-primary/5">
              <Icon size={24} />
            </div>
          )}
          <div>
            {title && <h3 className="text-xl font-black text-primary font-manrope">{title}</h3>}
            {description && <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{description}</p>}
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
}