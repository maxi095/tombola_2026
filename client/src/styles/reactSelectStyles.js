// src/styles/reactSelectStyles.js

export const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state.isDisabled ? '#F3F4F6' : 'white', // gris claro si deshabilitado
    borderColor: state.isDisabled
      ? '#D1D5DB'
      : state.isFocused
      ? '#2563EB'
      : '#D1D5DB',
    color: state.isDisabled ? '#9CA3AF' : '#111827',
    borderRadius: '0.375rem',
    minHeight: '40px',
    boxShadow: state.isFocused && !state.isDisabled ? '0 0 0 1px #2563EB' : 'none',
    cursor: state.isDisabled ? 'not-allowed' : 'default',
    opacity: state.isDisabled ? 0.7 : 1,
    '&:hover': {
      borderColor: state.isDisabled ? '#D1D5DB' : '#2563EB',
    },
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? '#4B5563' : '#111827', // más oscuro: gray-600 si disabled
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'white',
    borderRadius: '0.375rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginTop: '2px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#2563EB'
      : state.isFocused
      ? '#EFF6FF'
      : 'white',
    color: state.isSelected ? 'white' : '#111827',
    padding: '10px 12px',
    cursor: 'pointer',
  }),
  placeholder: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? '#D1D5DB' : '#6B7280', // gris más claro si disabled
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? '#D1D5DB' : '#9CA3AF',
    '&:hover': {
      color: state.isDisabled ? '#D1D5DB' : '#6B7280',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  input: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? '#4B5563' : '#111827', // también gray-600
  }),
};

