import React from 'react';

/**
 * Button Component - Premium 2026 v4 (High Contrast Edition) ✨💎🚀
 * Diseñado para visibilidad máxima en áreas de alta densidad operativa.
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  className = '',
  icon: Icon,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center gap-3 font-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest leading-none";
  
  const variants = {
    // Énfasis total: Navy Solid
    primary: "bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:bg-primary-dark hover:-translate-y-px",
    
    // Contraste Técnico: Gris Profundo -> Navy en Hover
    ghost: "text-slate-700 bg-transparent hover:text-primary hover:bg-primary/5 hover:border-primary/20 border border-transparent rounded-xl",
    
    // Definición Estructural: Borde Navy suave -> Navy Intenso
    outline: "border-2 border-slate-200 text-slate-800 hover:border-primary hover:text-primary bg-white shadow-sm",
    
    // Alerta de Negocio: Rojo corporativo
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white"
  };

  const sizes = {
    sm: "px-5 py-2.5 text-[9.5px] rounded-xl",
    md: "px-9 py-4 text-[11px] rounded-premium-btn",
    lg: "px-12 py-5 text-[12px] rounded-premium-btn"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon && <Icon size={size === 'sm' ? 12 : 18} className="transition-transform group-hover:scale-110 opacity-70" />}
      {children}
    </button>
  );
}
