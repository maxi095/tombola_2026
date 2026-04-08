import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingOverlay - Componente de carga estandarizado Premium 2026.
 * Puede usarse como pantalla completa o dentro de un contenedor relativo.
 */
export default function LoadingOverlay({ 
  message = "Cargando...", 
  fullScreen = true,
  className = "" 
}) {
  const containerStyles = fullScreen 
    ? "h-[60vh] w-full flex flex-col items-center justify-center gap-6 text-center animate-in fade-in duration-700" 
    : "w-full py-12 flex flex-col items-center justify-center gap-4 text-center";

  return (
    <div className={`${containerStyles} ${className}`}>
      <div className="relative flex items-center justify-center">
        <Loader2 className="animate-spin text-primary opacity-20" size={fullScreen ? 64 : 40} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}
