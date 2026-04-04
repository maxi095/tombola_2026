import ReactModal from "react-modal";
import { 
  Gift, 
  Calendar, 
  X, 
  CheckCircle2,
  Info
} from "lucide-react";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

// Componentes Elite UI
import InputField from "./ui/InputField";
import Button from "./ui/Button";

ReactModal.setAppElement("#root");

/**
 * NoChargeModal V4.2 - Premium Special Action
 * Gestión de entregas de cortesía/sin cargo con trazabilidad de fecha.
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

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="outline-none"
      overlayClassName="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-md z-[100] p-4"
    >
      <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/50 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header de DistinciÃ³n */}
        <div className="bg-amber-500 p-8 text-white relative shadow-lg">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Gift size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tight font-manrope">
              Entrega Sin Cargo
            </h2>
          </div>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
            AcciÃ³n de CortesÃa Institucional
          </p>
        </div>

        <div className="p-8">
          <div className="mb-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
            <Info className="text-amber-500 shrink-0" size={20} />
            <p className="text-xs font-medium text-amber-900 leading-relaxed">
              Esta operaciÃ³n marcarÃ¡ todas las cuotas como bonificadas. Se requiere registro de fecha para auditorÃa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <InputField
              label="Fecha de Entrega"
              type="date"
              icon={Calendar}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            {/* Acciones */}
            <div className="flex items-center gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-[1.5] bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20"
                icon={CheckCircle2}
              >
                Confirmar Especial
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ReactModal>
  );
};

export default NoChargeModal;
