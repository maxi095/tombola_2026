import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useFeedback } from "../../context/FeedbackContext";
import { cn } from "../../libs/cn";

/**
 * Toast - Componente de Notificación Standard 2026
 * Accesible (role="status", aria-live), z-[150] sobre Modales y barra de progreso real.
 */
export default function Toast() {
  const { toast, hideToast } = useFeedback();

  if (!toast) return null;

  const variants = {
    success: {
      bg: "bg-emerald-50/95 border-emerald-200",
      text: "text-emerald-900",
      icon: <CheckCircle2 className="text-emerald-500" size={18} />,
      label: "Éxito"
    },
    error: {
      bg: "bg-rose-50/95 border-rose-200",
      text: "text-rose-900",
      icon: <AlertCircle className="text-rose-500" size={18} />,
      label: "Atención"
    },
    info: {
      bg: "bg-blue-50/95 border-blue-200",
      text: "text-blue-900",
      icon: <Info className="text-blue-500" size={18} />,
      label: "Información"
    }
  };

  const { bg, text, icon, label } = variants[toast.type] || variants.info;

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      className="fixed top-6 sm:top-24 right-4 sm:right-8 z-[150] max-w-[calc(100vw-2rem)] animate-in slide-in-from-right fade-in duration-300"
    >
      <div className={cn("relative overflow-hidden flex items-center gap-4 min-w-[280px] sm:min-w-[320px] p-4 rounded-2xl border shadow-2xl backdrop-blur-md", bg, text)}>
        <div className="p-2 bg-white/60 rounded-xl shadow-sm shrink-0">
          {icon}
        </div>

        <div className="flex-1 pr-4">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">
            {label}
          </p>
          <p className="text-sm font-bold leading-tight">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={hideToast}
          aria-label="Cerrar notificación"
          className="p-1.5 hover:bg-black/5 rounded-lg transition-colors opacity-50 hover:opacity-100 shrink-0"
        >
          <X size={14} />
        </button>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-current opacity-20 animate-progress origin-left" />
      </div>
    </div>
  );
}
