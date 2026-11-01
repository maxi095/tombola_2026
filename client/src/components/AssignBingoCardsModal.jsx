import { useState, useEffect, useMemo } from "react";
import { useBingoCards } from "../context/BingoCardContext";
import { useFeedback } from "../context/FeedbackContext";
import Modal from "./ui/Modal";
import InputField from "./ui/InputField";
import Button from "./ui/Button";
import { Layers, CheckCircle2 } from "lucide-react";

export default function AssignBingoCardsModal({ isOpen, onClose, sellerId }) {
  const { assignSellerToBingoCard, getBingoCards } = useBingoCards();
  const { showToast } = useFeedback();

  const [selectedCards, setSelectedCards] = useState([]);
  const [unassignedCards, setUnassignedCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnassignedCards = async () => {
      if (!isOpen) return;
      try {
        const cards = await getBingoCards();
        if (Array.isArray(cards)) {
          const cardsWithoutSeller = cards.filter(
            (card) => !card.seller || Object.keys(card.seller).length === 0
          );
          setUnassignedCards(cardsWithoutSeller);
        }
      } catch (err) {
        console.error("Error al obtener cartones sin asignar:", err);
      }
    };

    fetchUnassignedCards();
  }, [isOpen, getBingoCards]);

  const filteredCards = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return unassignedCards.filter((card) => {
      const numberMatch = card.number?.toString().includes(search);
      const editionMatch = card.edition?.name?.toLowerCase().includes(search);
      return numberMatch || editionMatch;
    });
  }, [unassignedCards, searchTerm]);

  const handleCheckboxChange = (cardId) => {
    setSelectedCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCards.length === 0) {
      showToast("Seleccioná al menos un cartón para asignar", "warning");
      return;
    }

    setLoading(true);
    try {
      for (const cardId of selectedCards) {
        await assignSellerToBingoCard(cardId, sellerId);
      }
      showToast(`${selectedCards.length} cartones asignados correctamente`, "success");
      onClose();
      setSelectedCards([]);
    } catch (err) {
      showToast("Error al asignar los cartones", "error");
    } finally {
      setLoading(false);
    }
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
        form="assign-bingo-form"
        variant="primary"
        className="px-8 h-12 shadow-lg shadow-primary/20 min-w-[140px]"
        loading={loading}
        disabled={loading || selectedCards.length === 0}
        icon={CheckCircle2}
      >
        Asignar ({selectedCards.length})
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignar Cartones"
      subtitle="Vincular cartones disponibles al vendedor"
      icon={Layers}
      variant="default"
      maxWidth="max-w-2xl"
      footer={footer}
    >
      <form id="assign-bingo-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputField
          label="Buscar Cartón o Edición"
          placeholder="Escribí un número o nombre de edición..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
              Cartones Disponibles ({filteredCards.length})
            </label>
            <span className="text-[11px] font-bold text-primary">
              {selectedCards.length} seleccionados
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 divide-y divide-slate-100">
            {filteredCards.length === 0 ? (
              <p className="text-slate-400 text-center py-6 text-xs font-medium">
                No hay cartones disponibles para asignar
              </p>
            ) : (
              filteredCards.map((card) => (
                <label
                  key={card._id}
                  className="flex items-center gap-3 py-2 px-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCards.includes(card._id)}
                    onChange={() => handleCheckboxChange(card._id)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                  />
                  <div className="flex items-center justify-between w-full text-xs font-bold text-slate-700">
                    <span>Cartón N° <strong className="text-slate-900 font-black">{card.number}</strong></span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      Edición: {card.edition?.name || "Sin edición"}
                    </span>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
