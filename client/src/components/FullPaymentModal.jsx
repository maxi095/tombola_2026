import { useState, useEffect } from "react";
import {
  Zap,
  Calendar,
  CheckCircle2,
  CreditCard,
  User as UserIcon,
  ShieldCheck,
  Hash
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
  { value: "Cheque", label: "Cheque" },
  { value: "Otro", label: "Otro" }
];

/**
 * FullPaymentModal V8.1 - Premium Volume Action
 * Gestión de pagos de contado (Liquidación Completa) bajo estándar Elite 2026.
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
        form="full-payment-form"
        variant="primary"
        className="flex-[1.5] h-12 shadow-lg shadow-primary/10"
        icon={CheckCircle2}
      >
        Confirmar pago de contado
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pago de Contado"
      subtitle="Liquidación de Venta"
      icon={Zap}
      variant="primary"
      footer={footer}
      maxWidth="max-w-2xl"
    >
      <form id="full-payment-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Resumen Táctico de Pago Contado 🏹⚖️ */}
        <ModalSummary
          items={[
            { label: "Total a Liquidar", value: formatCurrency(totalAmount) },
            { label: "Cuotas Incluidas", value: quotas.length, icon: Hash }
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-primary/40" /> Método Principal
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

        {/* SECCIÓN DINÁMICA: TARJETA 🚀 */}
        {method === "Tarjeta" && (
          <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="text-primary" size={18} />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información de Plástico</h4>
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
                label="Número de Tarjeta"
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
                label="Cod. Autorización"
                placeholder="N° de ticket"
                icon={ShieldCheck}
                value={authCode}
                onChange={(e) => setAuthNumber(e.target.value)}
                required
              />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default FullPaymentModal;
