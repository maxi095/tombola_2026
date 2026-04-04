import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useFeedback } from "../../context/FeedbackContext";

/**
 * Toast - Componente de Notificación Premium 2026
 * Brinda feedback no-invasivo de alta fidelidad.
 */
export default function Toast() {
  const { toast, hideToast } = useFeedback();

  if (!toast) return null;

  const variants = {
    success: {
      bg: "bg-emerald-50/95 border-emerald-100",
      text: "text-emerald-900",
      icon: <CheckCircle2 className="text-emerald-500" size={18} />,
      label: "Éxito"
    },
    error: {
      bg: "bg-rose-50/95 border-rose-100",
      text: "text-rose-900",
      icon: <AlertCircle className="text-rose-500" size={18} />,
      label: "Atención"
    },
    info: {
      bg: "bg-blue-50/95 border-blue-100",
      text: "text-blue-900",
      icon: <Info className="text-blue-500" size={18} />,
      label: "Información"
    }
  };

  const { bg, text, icon, label } = variants[toast.type] || variants.info;

  return (
    <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right fade-in duration-500">
      <div className={`flex items-center gap-4 min-w-[320px] p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${bg} ${text}`}>
        
        {/* Icono de Estado */}
        <div className="p-2 bg-white/50 rounded-xl shadow-sm">
          {icon}
        </div>

        {/* Contenido */}
        <div className="flex-1 pr-6">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">
            {label}
          </p>
          <p className="text-sm font-bold leading-tight">
            {toast.message}
          </p>
        </div>

        {/* Botón de Cierre */}
        <button 
          onClick={hideToast}
          className="p-1 hover:bg-black/5 rounded-lg transition-colors opacity-40 hover:opacity-100"
        >
          <X size={14} />
        </button>

        {/* Indicador de Tiempo (Barra de progreso visual) */}
        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-10 animate-progress origin-left"></div>
      </div>
    </div>
  );
}
