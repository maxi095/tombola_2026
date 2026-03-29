import ReactModal from "react-modal";
import { useState, useEffect } from "react";

ReactModal.setAppElement("#root");

function WinnerModal({ isOpen, onClose, prize, onSave }) {
  const [bingoCardNumber, setBingoCardNumber] = useState("");

  useEffect(() => {
    if (isOpen) {
      setBingoCardNumber("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bingoCardNumber || bingoCardNumber <= 0) {
      alert("Ingresá un número de cartón válido");
      return;
    }
    onSave(bingoCardNumber);
    setBingoCardNumber("");
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl overflow-y-auto max-h-[90vh]"
      overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl overflow-y-auto max-h-[90vh]">
        <div className="form-card">
          <h2 className="title">
            Registrar Ganador - {prize?.position}° Premio
          </h2>

          {prize ? (
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-section col-span-2">
                <label className="label">Premio:</label>
                <input
                  value={prize.description || "Sin descripción"}
                  disabled
                  className="form-input bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="form-section col-span-2">
                <label className="label">Número de Cartón Ganador</label>
                <input
                  type="number"
                  value={bingoCardNumber}
                  onChange={(e) => setBingoCardNumber(e.target.value)}
                  className="form-input"
                  placeholder="Ej: 1234"
                  min="1"
                  required
                  autoFocus
                />
              </div>

              <div className="col-span-2 flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-500 mt-4">No hay datos disponibles</p>
          )}
        </div>
      </div>
    </ReactModal>
  );
}

export default WinnerModal;