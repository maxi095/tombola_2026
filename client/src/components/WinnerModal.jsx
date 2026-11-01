import { useState, useEffect } from "react";
import { useFeedback } from "../context/FeedbackContext";
import Modal from "./ui/Modal";
import InputField from "./ui/InputField";
import Button from "./ui/Button";
import { Trophy, Save } from "lucide-react";

export default function WinnerModal({ isOpen, onClose, prize, onSave }) {
  const [bingoCardNumber, setBingoCardNumber] = useState("");
  const { showToast } = useFeedback();

  useEffect(() => {
    if (isOpen) {
      setBingoCardNumber("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(bingoCardNumber, 10);
    if (!num || num <= 0) {
      showToast("Ingresá un número de cartón válido", "warning");
      return;
    }
    onSave(num);
    setBingoCardNumber("");
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="ghost"
        className="px-6 font-black text-[10px] uppercase tracking-widest"
        onClick={onClose}
      >
        Volver
      </Button>
      <Button
        type="submit"
        form="winner-form"
        variant="primary"
        className="px-8 h-12 shadow-lg shadow-primary/20 min-w-[140px]"
        icon={Save}
      >
        Registrar
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Registrar Ganador - ${prize?.position || 1}° Premio`}
      subtitle={prize?.description || "Premio en sorteo"}
      icon={Trophy}
      variant="default"
      maxWidth="max-w-md"
      footer={footer}
    >
      <form id="winner-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">
            Descripción del Premio
          </label>
          <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700">
            {prize?.description || "Sin descripción"}
          </div>
        </div>

        <InputField
          label="Número de Cartón Ganador"
          type="number"
          value={bingoCardNumber}
          onChange={(e) => setBingoCardNumber(e.target.value)}
          placeholder="Ej: 1234"
          min="1"
          required
          autoFocus
        />
      </form>
    </Modal>
  );
}
