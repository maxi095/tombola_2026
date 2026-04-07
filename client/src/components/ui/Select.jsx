import React, { forwardRef } from "react";
import RSelect from "react-select";

/**
 * Premium Select Styles - Elite 2026 v6.0
 * Unificación de visualización institucional.
 */
export const premiumSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#ffffff',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '1rem',
    padding: '0.45rem 0.8rem',
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#1e293b',
    boxShadow: state.isFocused ? '0 0 0 8px rgba(79, 70, 229, 0.05)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    borderColor: state.isFocused ? 'rgba(79, 70, 229, 0.1)' : 'rgba(226, 232, 240, 0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#ffffff',
      borderColor: 'rgba(79, 70, 229, 0.2)',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#cbd5e1',
    fontWeight: '600',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#1e293b',
    fontWeight: '700',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#ffffff',
    borderRadius: '1.25rem',
    padding: '0.5rem',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    zIndex: 9999,
    animation: 'in 0.2s ease-out',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f1f5f9' : 'transparent',
    color: state.isSelected ? '#ffffff' : '#475569',
    padding: '0.75rem 1.25rem',
    borderRadius: '0.8rem',
    fontSize: '0.875rem',
    fontWeight: state.isSelected ? '800' : '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:active': {
      backgroundColor: '#6366f1',
      color: '#ffffff',
    },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#cbd5e1',
    '&:hover': { color: '#6366f1' },
  }),
};

/**
 * Select Component - Elite 2026 v6.1 (ForwardRef Support)
 */
const Select = forwardRef(({ 
  label, 
  error, 
  className = "",
  options = [],
  placeholder = "Seleccionar...",
  menuPortalTarget = (typeof document !== 'undefined' ? document.body : null),
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-[11px] font-black text-muted uppercase tracking-[0.2em] ml-1">
          {label}
        </label>
      )}
      
      <RSelect
        ref={ref}
        options={options}
        styles={premiumSelectStyles}
        placeholder={placeholder}
        menuPortalTarget={menuPortalTarget}
        noOptionsMessage={() => "No se encontraron resultados"}
        {...props}
      />

      {error && (
        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
