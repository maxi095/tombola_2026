import React from 'react';

/**
 * Button Component - Premium 2026 v3 (Navy Alignment)
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
  const baseStyles = "inline-flex items-center justify-center gap-3 font-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest";
  
  const variants = {
    primary: "bg-primary text-inverse shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:bg-primary-dark hover:-translate-y-px",
    ghost: "text-slate-500 hover:text-primary hover:bg-white rounded-xl border border-transparent hover:border-slate-200",
    outline: "border-2 border-slate-200 text-muted hover:border-primary hover:text-primary",
    danger: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
  };

  const sizes = {
    sm: "px-5 py-2.5 text-[10px] rounded-xl",
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
      ) : Icon && <Icon size={size === 'sm' ? 14 : 20} className="transition-transform group-hover:scale-110" />}
      {children}
    </button>
  );
}
