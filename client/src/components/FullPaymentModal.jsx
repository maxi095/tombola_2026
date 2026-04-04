import ReactModal from "react-modal";
import { useState, useEffect } from "react";
import { 
  Zap, 
  Calendar, 
  X, 
  CheckCircle2, 
  Banknote,
  CreditCard,
  User as UserIcon,
  ShieldCheck,
  Hash
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
  { value: "Cheque", label: "Cheque" },
  { value: "Otro", label: "Otro" }
];

/**
 * FullPaymentModal V4.5 - Premium Volume Action
 * Gestión de pagos de contado con soporte dinámico para datos bancarios/tarjeta.
 */
const FullPaymentModal = ({ 
  isOpen, 
  onClose, 
  quotas = [], 
  saleId, 
  bingoCardId, 
  onSave 
}) => {
  const [method, setMethod] = useState("Efectivo");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));

  // Campos específicos para tarjeta
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardPlan, setPlan] = useState("");
  const [authCode, setAuthNumber] = useState("");

  const totalAmount = quotas.reduce((sum, q) => sum + q.amount, 0);

  useEffect(() => {
    if (isOpen) {
      setMethod("Efectivo");
      setDate(dayjs().format("YYYY-MM-DD"));
      setCardHolder("");
      setCardNumber("");
      setPlan("");
      setAuthNumber("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullPaymentData = {
      saleId,
      bingoCardId,
      method,
      date,
      cardDetails: method === "Tarjeta"
        ? { cardHolder, cardNumber, cardPlan, cardAmount: totalAmount, authCode }
        : null,
    };
    onSave(fullPaymentData);
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="outline-none"
      overlayClassName="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-md z-[100] p-4"
    >
      <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header de Alto Impacto */}
        <div className="bg-primary p-10 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-5 mb-3">
            <div className="p-4 bg-white/10 rounded-[1.5rem] shadow-inner">
              <Zap size={32} className="text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight font-manrope">
                Pago de Contado
              </h2>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
                LiquidaciÃ³n Institucional de Venta
              </p>
            </div>
          </div>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Resumen de LiquidaciÃ³n */}
            <div className="flex items-center justify-between p-8 bg-primary/5 rounded-[2rem] border border-primary/10 shadow-sm">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total a Liquidar</p>
                <h3 className="text-4xl font-black text-primary font-manrope">
                  ${totalAmount.toFixed(2)}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cuotas Incluidas</p>
                <div className="flex items-center justify-end gap-2">
                  <Hash size={14} className="text-primary/40" />
                  <span className="text-xl font-black text-primary">{quotas.length}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Banknote size={14} /> MÃ©todo Principal
                </label>
                <EliteSelect
                  options={PAYMENT_METHODS}
                  value={PAYMENT_METHODS.find(m => m.value === method)}
                  onChange={(option) => setMethod(option.value)}
                />
              </div>

              <InputField
                label="Fecha Contable"
                type="date"
                icon={Calendar}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* SECCIÃ“N DINÃMICA: TARJETA */}
            {method === "Tarjeta" && (
              <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-6 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="text-primary" size={18} />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">InformaciÃ³n de PlÃ¡stico</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Titular"
                    placeholder="Como figura en la tarjeta"
                    icon={UserIcon}
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                  />
                  <InputField
                    label="NÃºmero de Tarjeta"
                    placeholder="0000 0000 0000 0000"
                    icon={CreditCard}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                  />
                  <InputField
                    label="Plan / Cuotas"
                    placeholder="Ej: Plan 3 Cuotas"
                    icon={Zap}
                    value={cardPlan}
                    onChange={(e) => setPlan(e.target.value)}
                    required
                  />
                  <InputField
                    label="Cod. AutorizaciÃ³n"
                    placeholder="NÂ° de ticket"
                    icon={ShieldCheck}
                    value={authCode}
                    onChange={(e) => setAuthNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Botones de Control */}
            <div className="flex items-center gap-6 pt-6">
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
                className="flex-[2] py-4"
                icon={CheckCircle2}
              >
                Confirmar LiquidaciÃ³n
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ReactModal>
  );
};

export default FullPaymentModal;
