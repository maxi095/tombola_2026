import React, { forwardRef } from 'react';

/**
 * Card Component - Standard 2026
 * Soporta cabeceras institucionales automáticas (Title, Icon, Description) y variantes seguras.
 */
const Card = forwardRef(({ 
  children, 
  title,
  icon: Icon,
  description,
  hover = true, 
  variant = 'default',
  size = 'default',
  className = '', 
  padding,
  ...props 
}, ref) => {
  const isSlim = size === 'slim';
  const baseStyles = "bg-white rounded-premium-card transition-all duration-300 overflow-hidden";
  
  const variants = {
    default: "border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.012)]",
    elevated: "shadow-premium border-b border-r border-slate-200/40",
    outline: "border-2 border-slate-100 bg-transparent",
    glass: "bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm"
  };

  const variantClasses = variants[variant] || variants.default;
  const hoverStyles = hover ? "hover:border-primary/10 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5" : "";
  const finalPadding = padding || (isSlim ? 'p-5 md:p-6' : 'p-8 md:p-10');

  return (
    <div 
      ref={ref}
      className={`${baseStyles} ${variantClasses} ${hoverStyles} ${finalPadding} ${className}`}
      {...props}
    >
      {(title || Icon) && (
        <div className={`flex items-center gap-4 border-b border-slate-50 ${isSlim ? 'mb-5 pb-4' : 'mb-10 pb-8'}`}>
          {Icon && (
            <div className={`${isSlim ? 'w-10 h-10' : 'w-12 h-12'} bg-primary/5 rounded-xl flex items-center justify-center text-primary shadow-inner border border-primary/5`}>
              <Icon size={isSlim ? 18 : 24} />
            </div>
          )}
          <div>
            {title && <h3 className={`${isSlim ? 'text-lg' : 'text-xl'} font-black text-primary font-manrope`}>{title}</h3>}
            {description && <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{description}</p>}
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;
