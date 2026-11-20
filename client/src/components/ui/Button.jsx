import React, { forwardRef } from 'react';
import { cn } from '../../libs/cn';

/**
 * Button Component - Standard 2026
 * Soporta forwardRef, tailwind-merge (cn), protección contra doble envío y variantes seguras.
 */
const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest leading-none";
  
  const variants = {
    primary: "bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:bg-primary-dark hover:-translate-y-px",
    ghost: "text-slate-700 bg-transparent hover:text-primary hover:bg-primary/5 hover:border-primary/20 border border-transparent rounded-xl",
    outline: "border-2 border-slate-200 text-slate-800 hover:border-primary hover:text-primary bg-white shadow-sm",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white"
  };

  const sizes = {
    icon: "p-0 w-8 h-8 rounded-xl flex-shrink-0",
    sm: "px-3.5 py-2 text-[9.5px] rounded-xl",
    md: "px-9 py-4 text-[11px] rounded-premium-btn",
    lg: "px-12 py-5 text-[12px] rounded-premium-btn"
  };

  const iconSize = size === 'icon' ? 15 : size === 'sm' ? 13 : 18;
  const isDisabled = Boolean(loading || disabled);

  return (
    <button 
      ref={ref}
      type={type}
      className={cn(baseStyles, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon && <Icon size={iconSize} className="transition-transform group-hover:scale-110 flex-shrink-0" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
