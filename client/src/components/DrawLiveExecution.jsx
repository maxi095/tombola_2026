import { useState, useEffect } from "react";
import { useDraws } from "../context/DrawContext";
import { useFeedback } from "../context/FeedbackContext";
import Card from "./ui/Card";
import Button from "./ui/Button";
import ConfirmModal from "./ui/ConfirmModal";
import { Trophy, Plus, Trash2, RefreshCw } from "lucide-react";

export default function DrawLiveExecution({ draw, onDrawUpdate }) {
  const { addDrawnNumber, removeLastDrawnNumber, getTopBingoCards } = useDraws();
  const { showToast } = useFeedback();

  const [currentNumber, setCurrentNumber] = useState("");
  const [topCards, setTopCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (autoRefresh && draw.drawnNumbers?.length > 0) {
      loadTopCards();
    }
  }, [draw.drawnNumbers?.length, autoRefresh]);

  const loadTopCards = async () => {
    try {
      const top = await getTopBingoCards(draw._id);
      setTopCards(top);
    } catch (error) {
      console.error("Error cargando ranking de cartones:", error);
    }
  };

  const handleAddNumber = async (e) => {
    e.preventDefault();

    const num = parseInt(currentNumber, 10);

    if (!num || num < 1 || num > 90) {
      showToast("Ingresá un número válido entre 1 y 90", "warning");
      return;
    }

    if (draw.drawnNumbers?.includes(num)) {
      showToast(`El número ${num} ya fue sorteado`, "warning");
      return;
    }

    setLoading(true);
    try {
      const updatedDraw = await addDrawnNumber({
        drawId: draw._id,
        number: num
      });

      onDrawUpdate(updatedDraw);
      setCurrentNumber("");
      showToast(`Número ${num} ingresado`, "success");

      if (autoRefresh) {
        await loadTopCards();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Error al agregar número", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteRemove = async () => {
    setIsConfirmDeleteOpen(false);
    setLoading(true);
    try {
      const updatedDraw = await removeLastDrawnNumber({
        drawId: draw._id
      });

      onDrawUpdate(updatedDraw);
      showToast("Último número eliminado correctamente", "success");

      if (autoRefresh) {
        await loadTopCards();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Error al eliminar número", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmDelete = () => {
    if (!draw.drawnNumbers || draw.drawnNumbers.length === 0) {
      showToast("No hay números para eliminar", "warning");
      return;
    }
    setIsConfirmDeleteOpen(true);
  };

  const lastNumber =
    draw.drawnNumbers && draw.drawnNumbers.length > 0
      ? draw.drawnNumbers[draw.drawnNumbers.length - 1]
      : null;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA IZQUIERDA: Control y números */}
        <div className="space-y-6">
          {/* Panel de control */}
          <Card className="p-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
              Control de Sorteo en Vivo
            </h3>

            {/* Formulario para agregar número */}
            <form onSubmit={handleAddNumber} className="flex gap-3 mb-4">
              <input
                type="number"
                value={currentNumber}
                onChange={(e) => setCurrentNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Número (1-90)"
                min="1"
                max="90"
                disabled={loading}
                autoFocus
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Plus}
                loading={loading}
                disabled={loading || !currentNumber}
                className="whitespace-nowrap px-5"
              >
                Agregar
              </Button>
            </form>

            <div className="flex gap-3 mb-4">
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={handleOpenConfirmDelete}
                className="flex-1"
                disabled={loading || !draw.drawnNumbers || draw.drawnNumbers.length === 0}
              >
                Eliminar Último
              </Button>
              {!autoRefresh && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={loadTopCards}
                  className="flex-1"
                >
                  Actualizar Ranking
                </Button>
              )}
            </div>

            {/* Toggle auto-refresh */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-600">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
              />
              Actualizar ranking automáticamente
            </label>
          </Card>

          {/* Último número sorteado */}
          {lastNumber && (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl p-6 text-center shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-primary/70 mb-2">
                Último número sorteado
              </p>
              <div className="text-6xl font-black text-primary tracking-tight">
                {lastNumber.toString().padStart(2, "0")}
              </div>
              <p className="text-xs font-bold text-slate-600 mt-2">
                <span className="font-black text-slate-900">{draw.drawnNumbers?.length || 0}</span> números sorteados
              </p>
            </div>
          )}

          {/* Números sorteados */}
          <Card className="p-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
              Números Sorteados ({draw.drawnNumbers?.length || 0})
            </h3>

            {draw.drawnNumbers && draw.drawnNumbers.length > 0 ? (
              <div className="grid grid-cols-9 gap-1.5 max-h-64 overflow-y-auto pr-1">
                {draw.drawnNumbers.map((num, index) => (
                  <div
                    key={index}
                    className="bg-slate-100/80 border border-slate-200 rounded-lg p-2 text-center font-black text-xs text-slate-800"
                  >
                    {num.toString().padStart(2, "0")}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-6 text-xs font-medium">
                Aún no se han sorteado números
              </p>
            )}
          </Card>
        </div>

        {/* COLUMNA DERECHA: Top 10 */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-amber-500" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Top 10 Cartones con Más Aciertos
            </h3>
          </div>

          {topCards.length > 0 ? (
            <div className="overflow-y-auto max-h-[580px] flex-1">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 sticky top-0 border-b border-slate-100">
                  <tr>
                    <th className="px-3 py-2.5 text-center">Pos</th>
                    <th className="px-3 py-2.5 text-left">N° Cartón</th>
                    <th className="px-3 py-2.5 text-center">Aciertos</th>
                    <th className="px-3 py-2.5 text-left">Asociado</th>
                    <th className="px-3 py-2.5 text-left">Vendedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topCards.map((card, index) => {
                    const isWinner = card.matches === card.totalNumbers;

                    return (
                      <tr
                        key={card.bingoCardId}
                        className={`transition-colors ${
                          isWinner
                            ? "bg-emerald-50/80 font-black"
                            : index === 0
                            ? "bg-amber-50/50"
                            : "hover:bg-slate-50/60"
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center font-bold text-slate-500">
                          {index + 1}°
                        </td>
                        <td className="px-3 py-2.5 font-black text-slate-800">
                          {card.bingoCardNumber}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`font-black ${
                              isWinner
                                ? "text-emerald-600 text-sm"
                                : "text-primary"
                            }`}
                          >
                            {card.matches}/{card.totalNumbers}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 font-medium">
                          {card.client?.lastName}, {card.client?.firstName}
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 font-medium">
                          {card.seller?.lastName}, {card.seller?.firstName}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-12 text-xs font-medium">
              {draw.drawnNumbers?.length > 0
                ? "Cargando ranking..."
                : "El ranking se mostrará automáticamente cuando comiences a ingresar números sorteados."}
            </p>
          )}
        </Card>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleExecuteRemove}
        title="¿Eliminar último número?"
        message={`¿Estás seguro de que deseas eliminar el número ${lastNumber}? Esta acción actualizará los aciertos en todos los cartones.`}
        confirmText="Eliminar Número"
        cancelText="Volver"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
