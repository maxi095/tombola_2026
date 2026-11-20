import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";
import { cn } from "../../libs/cn";

/**
 * ConfirmModal - Diálogo Estándar de Confirmación Standard 2026
 * Soporta tema 'light' (Admin) y 'dark' (PWA Vendedor / Directiva).
 */
export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "¿Confirmar acción?", 
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Volver",
  variant = "danger", // 'danger' | 'primary'
  theme = "light",    // 'light' | 'dark'
  loading = false
}) {
  const isDark = theme === "dark";

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      theme={theme}
      footer={
        <>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
            className={isDark ? "text-slate-300 hover:text-white hover:bg-slate-800" : ""}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === "danger" ? "danger" : "primary"} 
            onClick={onConfirm}
            loading={loading}
            className={isDark && variant === "danger" ? "bg-red-600 text-white border-red-500 hover:bg-red-700" : ""}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-5">
        <div
          className={cn(
            "p-4 rounded-2xl shrink-0",
            isDark
              ? variant === "danger"
                ? "bg-red-950/60 text-red-400 border border-red-800/40"
                : "bg-slate-800 text-slate-200"
              : variant === "danger"
                ? "bg-rose-50 text-rose-500"
                : "bg-primary/5 text-primary"
          )}
        >
          <AlertTriangle size={32} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className={cn("text-[11px] font-black uppercase tracking-widest mb-2", isDark ? "text-slate-400" : "text-slate-400")}>
            Verificación de Seguridad
          </p>
          <p className={cn("font-medium leading-relaxed", isDark ? "text-slate-200" : "text-slate-600")}>
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}
