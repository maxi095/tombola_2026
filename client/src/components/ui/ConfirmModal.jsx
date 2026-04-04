import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

/**
 * ConfirmModal - Diálogo Estándar de Confirmación Premium 2026
 * Simplifica la implementación de preguntas de "Sí/No" con estética institucional.
 */
export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "¿Confirmar acción?", 
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger", // 'danger' | 'primary'
  loading = false
}) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      footer={
        <>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-5">
        <div className={`p-4 rounded-2xl ${variant === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-primary/5 text-primary'}`}>
          <AlertTriangle size={32} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Verificación de Seguridad
          </p>
          <p className="text-slate-600 font-medium leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}
