import React from 'react';

/**
 * FormGrid - Componente de grilla para Alta Densidad Slim 2026.
 * Implementa el canon de 4 columnas responsivas.
 */
export default function FormGrid({ 
  children, 
  gap = "gap-6", 
  className = "" 
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${gap} ${className}`}>
      {children}
    </div>
  );
}
