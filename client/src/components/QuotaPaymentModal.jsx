import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Banknote
} from "lucide-react";
import dayjs from "dayjs";

// Estímulo Elite UI
import Modal from "./ui/Modal";
import ModalSummary from "./ui/ModalSummary";
import InputField from "./ui/InputField";
import EliteSelect from "./ui/Select";
import Button from "./ui/Button";
import { formatCurrency } from "../libs/formatters";

const PAYMENT_METHODS = [
  { value: "Efectivo", label: "Efectivo" },
  { value: "Tarjeta", label: "Tarjeta" },
  { value: "Transferencia", label: "Transferencia" },
  { value: "Otro", label: "Otro" }
];

/**
 * QuotaPaymentModal V8.1 - Premium Action Layer
 * Gestión de cobro de cuotas individuales bajo estándar Elite 2026.
 */
const QuotaPaymentModal = ({ isOpen, onClose, quota, onSave }) => {
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [paymentDate, setPaymentDate] = useState(dayjs().format("YYYY-MM-DD"));

  useEffect(() => {
    if (quota) {
      setPaymentMethod(quota.paymentMethod || "Efectivo");
      setPaymentDate(quota.paymentDate ? dayjs(quota.paymentDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"));
    }
  }, [quota, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...quota, paymentMethod, paymentDate });
  };

  const footer = (
    <>
      <Button 
        type="button" 
        variant="ghost" 
        className="px-6 font-black text-[10px] uppercase tracking-widest"
        onClick={onClose}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        form="quota-payment-form"
        variant="primary" 
        className="flex-[1.5] h-12 shadow-lg shadow-primary/10"
        icon={CheckCircle2}
      >
        Confirmar Cobro
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={quota?.paymentDate ? "Gestión de Cobro" : "Registrar Pago"}
      subtitle={`Cuota Institucional #${quota?.quotaNumber || quota?.number}`}
      icon={Banknote}
      variant="primary"
      footer={footer}
    >
      <form id="quota-payment-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Resumen Táctico de Pago 🏹⚖️ */}
        <ModalSummary 
          items={[
            { label: "Importe a Cobrar", value: formatCurrency(quota?.amount || 0) },
            { label: "Vencimiento", value: dayjs.utc(quota?.dueDate).format("DD/MM/YYYY"), icon: Calendar }
          ]}
        />

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CreditCard size={14} /> Método de Pago
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
      </form>
    </Modal>
  );
};

export default QuotaPaymentModal;
