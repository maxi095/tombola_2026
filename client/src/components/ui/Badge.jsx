import React from "react";

const variants = {
  primary: "bg-primary/5 text-primary border-primary/10",
  secondary: "bg-slate-100 text-slate-600 border-slate-200",
  success: "bg-emerald-50 text-emerald-600 border-emerald-100",
  warning: "bg-amber-50 text-amber-600 border-amber-100",
  danger: "bg-red-50 text-red-600 border-red-100",
  info: "bg-sky-50 text-sky-600 border-sky-100",
  brand: "bg-primary text-white border-transparent"
};

/**
 * Badge - Premium 2026 Component
 * Utilizado para etiquetas de estado, roles y categorías.
 */
const Badge = ({ children, variant = "primary", className = "" }) => {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 
        rounded-full text-[11px] font-black uppercase tracking-widest 
        border transition-all duration-300
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
