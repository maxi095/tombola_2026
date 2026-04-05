import { X } from "lucide-react";
import ReactModal from "react-modal";

// Sincronizar AppElement con el root de React
if (typeof window !== "undefined") {
  ReactModal.setAppElement("#root");
}

/**
 * Modal - Componente Maestro de Diálogos Elite 2026
 * Soporta variantes semánticas y arquitectura de alta densidad.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Control de visibilidad
 * @param {Function} props.onClose - Handler de cierre
 * @param {string} props.title - Título principal
 * @param {string} props.subtitle - Subtítulo de contexto (opcional)
 * @param {React.ElementType} props.icon - Icono Lucide
 * @param {string} props.variant - 'primary' | 'warning' | 'default'
 * @param {string} props.maxWidth - Clase Tailwind para el ancho (default: max-w-lg)
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  icon: Icon,
  variant = "default",
  children, 
  footer,
  maxWidth = "max-w-lg" 
}) {

  const getHeaderStyles = () => {
    switch (variant) {
      case 'primary': return 'bg-primary text-white';
      case 'warning': return 'bg-amber-500 text-white shadow-lg shadow-amber-500/10';
      case 'default': return 'bg-slate-50/50 text-slate-800 border-b border-slate-100';
      default: return 'bg-white text-slate-800 border-b border-slate-100';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'primary': return 'bg-white/10';
      case 'warning': return 'bg-white/10';
      case 'default': return 'bg-primary text-white shadow-lg shadow-primary/10';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getCloseBtnStyles = () => {
    return variant === 'default' 
      ? 'bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100'
      : 'bg-white/10 hover:bg-white/20 text-white';
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      closeTimeoutMS={300}
      className={`
        relative w-full ${maxWidth} bg-white rounded-[32px] shadow-2xl overflow-hidden 
        outline-none animate-in zoom-in-95 duration-300
      `}
      overlayClassName="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
    >
      {/* CABECERA DINÁMICA ✨🚀 */}
      <div className={`relative px-8 py-7 ${getHeaderStyles()}`}>
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-xl transition-all ${getCloseBtnStyles()}`}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`p-3 rounded-2xl ${getIconStyles()}`}>
              <Icon size={24} />
            </div>
          )}
          <div>
            <h2 className={`text-xl font-black tracking-tight font-manrope leading-none ${variant === 'default' ? 'text-primary' : 'text-white'}`}>
              {title}
            </h2>
            {subtitle && (
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 ${variant === 'default' ? 'text-slate-400' : 'text-white/70'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CUERPO OPERATIVO 🏹⚖️ */}
      <div className="px-8 py-8 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-slate-200">
        {children}
      </div>

      {/* PIE (FOOTER) ✨💎 */}
      {footer && (
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-end gap-3">
          {footer}
        </div>
      )}
    </ReactModal>
  );
}
