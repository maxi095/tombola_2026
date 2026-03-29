import ReactModal from "react-modal";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

ReactModal.setAppElement("#root");

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
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl overflow-y-auto max-h-[90vh]"
      overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div className="form-card">
        <h2 className="title">Registrar como entregado sin cargo</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Fecha de entrega */}
          <div className="form-section col-span-2">
            <label className="label">Fecha de entrega</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Botones */}
          <div className="col-span-2 flex justify-end mt-4 space-x-2">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </ReactModal>
  );
};

export default NoChargeModal;
