import ReactModal from "react-modal";
import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Calendar, 
  X, 
  CheckCircle2, 
  Banknote,
  Info
} from "lucide-react";
import dayjs from "dayjs";

// Componentes Elite UI
import InputField from "./ui/InputField";
import EliteSelect from "./ui/Select";
import Button from "./ui/Button";

ReactModal.setAppElement("#root");

const PAYMENT_METHODS = [
  { value: "Efectivo", label: "Efectivo" },
  { value: "Tarjeta", label: "Tarjeta" },
  { value: "Transferencia", label: "Transferencia" },
  { value: "Otro", label: "Otro" }
];

/**
 * QuotaPaymentModal V4.2 - Premium Action Layer
 * Gestión de cobro de cuotas individuales con controles atómicos.
 */
const QuotaPaymentModal = ({ isOpen, onClose, quota, onSave }) => {
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [paymentDate, setPaymentDate] = useState(dayjs().format("YYYY-MM-DD"));

  useEffect(() => {
    if (quota) {
      setPaymentMethod(quota.paymentMethod || "Efectivo");
      setPaymentDate(quota.paymentDate || (quota.paymentDate ? dayjs(quota.paymentDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")));
    }
  }, [quota, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...quota, paymentMethod, paymentDate });
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="outline-none"
      overlayClassName="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-md z-[100] p-4"
    >
      <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/50 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header Institucional */}
        <div className="bg-primary p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Banknote size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tight font-manrope">
              {quota?.paymentDate ? "GestiÃ³n de Cobro" : "Registrar Pago"}
            </h2>
          </div>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
            Cuota Institucional #{quota?.quotaNumber}
          </p>
        </div>

        <div className="p-8">
          {quota ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Resumen Informativo */}
              <div className="flex items-center justify-between p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Importe a Cobrar</p>
                  <h3 className="text-3xl font-black text-primary font-manrope">
                    ${quota.amount}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencimiento</p>
                  <p className="text-sm font-bold text-slate-600">
                    {dayjs.utc(quota.dueDate).format("DD/MM/YYYY")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={14} /> MÃ©todo de Pago
                  </label>
                  <EliteSelect
                    options={PAYMENT_METHODS}
                    value={PAYMENT_METHODS.find(m => m.value === paymentMethod)}
                    onChange={(option) => setPaymentMethod(option.value)}
                  />
                </div>

                <InputField
                  label="Fecha del Pago"
                  type="date"
                  icon={Calendar}
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

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
                  variant="primary" 
                  className="flex-[1.5]"
                  icon={CheckCircle2}
                >
                  Confirmar Cobro
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center py-12 text-slate-300">
              <Info size={48} className="mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">Sincronizando datos...</p>
            </div>
          )}
        </div>
      </div>
    </ReactModal>
  );
};

export default QuotaPaymentModal;
