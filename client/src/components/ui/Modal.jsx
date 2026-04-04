import { X } from "lucide-react";
import Button from "./Button";

/**
 * Modal - Componente Base de Diálogo Premium 2026
 * Brinda un contenedor elegante y accesible para interacciones críticas.
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  maxWidth = "max-w-md" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
      
      {/* Backdrop con Desenfoque */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenedor del Modal */}
      <div className={`relative w-full ${maxWidth} bg-white rounded-premium-card shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300`}>
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <h3 className="text-xl font-black text-primary font-manrope uppercase tracking-tight">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="px-8 py-8">
          {children}
        </div>

        {/* Pie (Opcional) */}
        {footer && (
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-end gap-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
