import { X } from "lucide-react";
import ReactModal from "react-modal";
import { cn } from "../../libs/cn";

if (typeof window !== "undefined") {
  ReactModal.setAppElement("#root");
}

/**
 * Modal - Componente Maestro de Diálogos Standard 2026
 * Soporta variantes semánticas y temas claro/oscuro ('light' | 'dark').
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  icon: Icon,
  variant = "default",
  theme = "light",
  children, 
  footer,
  maxWidth = "max-w-lg" 
}) {
  const isDark = theme === "dark";

  const getHeaderStyles = () => {
    if (isDark) {
      if (variant === "primary") return "bg-red-600 text-white";
      if (variant === "warning") return "bg-amber-600 text-white";
      return "bg-slate-900 text-white border-b border-slate-800";
    }
    switch (variant) {
      case "primary": return "bg-primary text-white";
      case "warning": return "bg-amber-500 text-white shadow-lg shadow-amber-500/10";
      case "default": return "bg-slate-50/50 text-slate-800 border-b border-slate-100";
      default: return "bg-white text-slate-800 border-b border-slate-100";
    }
  };

  const getIconStyles = () => {
    if (isDark) {
      return variant === "default"
        ? "bg-red-600/20 text-red-400 border border-red-500/30"
        : "bg-white/10 text-white";
    }
    switch (variant) {
      case "primary": return "bg-white/10";
      case "warning": return "bg-white/10";
      case "default": return "bg-primary text-white shadow-lg shadow-primary/10";
      default: return "bg-slate-100 text-slate-500";
    }
  };

  const getCloseBtnStyles = () => {
    if (isDark) {
      return "bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700";
    }
    return variant === "default"
      ? "bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100"
      : "bg-white/10 hover:bg-white/20 text-white";
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      closeTimeoutMS={200}
      className={cn(
        "relative w-full rounded-[32px] shadow-2xl overflow-hidden outline-none animate-in zoom-in-95 duration-200",
        maxWidth,
        isDark ? "bg-slate-900 border border-slate-800 text-slate-100" : "bg-white text-slate-800"
      )}
      overlayClassName={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md",
        isDark ? "bg-slate-950/80" : "bg-slate-900/40"
      )}
    >
      <div className={cn("relative px-6 sm:px-8 py-6 sm:py-7", getHeaderStyles())}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className={cn("absolute top-5 right-5 p-2 rounded-xl transition-all", getCloseBtnStyles())}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 pr-10">
          {Icon && (
            <div className={cn("p-3 rounded-2xl", getIconStyles())}>
              <Icon size={24} />
            </div>
          )}
          <div>
            <h2 className={cn("text-xl font-black tracking-tight font-manrope leading-none", !isDark && variant === "default" ? "text-primary" : "text-white")}>
              {title}
            </h2>
            {subtitle && (
              <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mt-1.5", isDark ? "text-slate-400" : variant === "default" ? "text-slate-400" : "text-white/70")}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6 sm:py-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
        {children}
      </div>

      {footer && (
        <div className={cn("px-6 sm:px-8 py-5 flex items-center justify-end gap-3 border-t", isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50/50 border-slate-100")}>
          {footer}
        </div>
      )}
    </ReactModal>
  );
}
