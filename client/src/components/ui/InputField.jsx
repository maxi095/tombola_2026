import React, { forwardRef } from 'react';

/**
 * InputField Component - Premium 2026 v3.1 (ForwardRef Support)
 */
const InputField = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  placeholder = '',
  className = '',
  icon: Icon,
  prefix,
  bsize = 'md', // md o compact 🏹
  ...props 
}, ref) => {
  const baseInput = `w-full bg-white border border-slate-200/60 shadow-sm rounded-premium-input font-semibold text-primary focus:ring-8 focus:ring-primary/5 focus:border-primary/20 placeholder:text-slate-300 transition-all outline-none duration-300 ${
    bsize === 'compact' ? 'px-4 py-2 text-xs' : 'px-6 py-4 text-sm'
  }`;
  
  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] ml-2 font-inter">
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
          ref={ref}
          type={type}
          className={`${baseInput} ${error ? 'border-red-100 bg-red-50/20' : ''} ${prefix ? 'pl-11' : ''}`}
          placeholder={placeholder}
          {...props}
        />
        {Icon && (
          <div
            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-slate-400"
          >
            <Icon size={bsize === 'compact' ? 16 : 20} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-[10px] font-bold text-red-500 ml-2 animate-in fade-in slide-in-from-top-1 duration-500">
          {error}
        </p>
      )}
    </div>
  );
});

InputField.displayName = "InputField";

export default InputField;
