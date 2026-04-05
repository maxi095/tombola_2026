import {
  Gift,
  Calendar,
  CheckCircle2,
  Info
} from "lucide-react";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

// Estímulo Elite UI
import Modal from "./ui/Modal";
import InputField from "./ui/InputField";
import Button from "./ui/Button";

/**
 * NoChargeModal V8.1 - Premium Special Action
 * Gestión de entregas de cortesía/sin cargo bajo estándar Elite 2026.
 */
const NoChargeModal = ({ isOpen, onClose, onSave }) => {
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));

  useEffect(() => {
    if (isOpen) {
      setDate(dayjs().format("YYYY-MM-DD"));
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ date });
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="ghost"
        className="px-6 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600"
        onClick={onClose}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form="no-charge-form"
        className="flex-[1.5] h-12 bg-amber-500 hover:bg-amber-600 text-white font-black shadow-lg shadow-amber-500/20"
        icon={CheckCircle2}
      >
        Confirmar Bonificación
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Entrega Sin Cargo"
      subtitle="Acción de Cortesía Institucional"
      icon={Gift}
      variant="warning"
      footer={footer}
    >
      <form id="no-charge-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4 animate-in slide-in-from-top-2">
          <Info className="text-amber-500 shrink-0" size={20} />
          <p className="text-xs font-bold text-amber-900 leading-relaxed">
            Esta operación marcará todas las cuotas como bonificadas. Se requiere registro de fecha para auditoría.
          </p>
        </div>

        <InputField
          label="Fecha de Entrega"
          type="date"
          icon={Calendar}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </form>
    </Modal>
  );
};

export default NoChargeModal;
