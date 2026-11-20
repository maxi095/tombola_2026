import React, { forwardRef, useId } from 'react';

/**
 * InputField Component - Standard 2026
 * ForwardRef, accesibilidad (useId + aria-invalid) y soporte seguro para ícono interactivo (onIconClick).
 */
const InputField = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  placeholder = '',
  className = '',
  icon: Icon,
  onIconClick,
  iconAriaLabel = 'Acción de campo',
  prefix,
  bsize = 'md', // md o compact
  id,
  ...props 
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const baseInput = `w-full bg-white border border-slate-200/60 shadow-sm rounded-premium-input font-semibold text-primary focus:ring-8 focus:ring-primary/5 focus:border-primary/20 placeholder:text-slate-400 transition-all outline-none duration-300 ${
    bsize === 'compact' ? 'px-4 py-2 text-xs' : 'px-6 py-4 text-sm'
  }`;
  
  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] ml-2 font-inter block"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        {prefix && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none tracking-wider">
            {prefix}
          </div>
        )}
        <input 
          id={inputId}
          ref={ref}
          type={type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${baseInput} ${error ? 'border-red-300 bg-red-50/20' : ''} ${prefix ? 'pl-11' : ''} ${Icon ? 'pr-12' : ''}`}
          placeholder={placeholder}
          {...props}
        />
        {Icon && (
          onIconClick ? (
            <button
              type="button"
              onClick={onIconClick}
              aria-label={iconAriaLabel}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            >
              <Icon size={bsize === 'compact' ? 16 : 20} />
            </button>
          ) : (
            <div
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-slate-400"
            >
              <Icon size={bsize === 'compact' ? 16 : 20} />
            </div>
          )
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-[10px] font-bold text-red-500 ml-2">
          {error}
        </p>
      )}
    </div>
  );
});

InputField.displayName = "InputField";

export default InputField;
