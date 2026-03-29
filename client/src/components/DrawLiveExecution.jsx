import { useState, useEffect } from "react";
import { useDraws } from "../context/DrawContext";

function DrawLiveExecution({ draw, onDrawUpdate }) {
  const { addDrawnNumber, removeLastDrawnNumber, getTopBingoCards } = useDraws();
  
  const [currentNumber, setCurrentNumber] = useState("");
  const [topCards, setTopCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

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
      console.error("Error cargando top cards:", error);
    }
  };

  const handleAddNumber = async (e) => {
    e.preventDefault();
    
    const num = parseInt(currentNumber);
    
    if (!num || num < 1 || num > 90) {
      alert("Ingresá un número válido entre 1 y 90");
      return;
    }

    if (draw.drawnNumbers?.includes(num)) {
      alert(`El número ${num} ya fue sorteado`);
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
      
      if (autoRefresh) {
        await loadTopCards();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error al agregar número");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLastNumber = async () => {
    if (!draw.drawnNumbers || draw.drawnNumbers.length === 0) {
      alert("No hay números para eliminar");
      return;
    }

    if (!window.confirm(`¿Eliminar el último número (${draw.drawnNumbers[draw.drawnNumbers.length - 1]})?`)) {
      return;
    }

    setLoading(true);
    try {
      const updatedDraw = await removeLastDrawnNumber({
        drawId: draw._id
      });
      
      onDrawUpdate(updatedDraw);
      
      if (autoRefresh) {
        await loadTopCards();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error al eliminar número");
    } finally {
      setLoading(false);
    }
  };

  const lastNumber = draw.drawnNumbers && draw.drawnNumbers.length > 0 
    ? draw.drawnNumbers[draw.drawnNumbers.length - 1] 
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* COLUMNA IZQUIERDA: Control y números */}
      <div className="space-y-4">
        {/* Panel de control */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Control de Sorteo en Vivo
          </h3>

          {/* Formulario para agregar número */}
          <form onSubmit={handleAddNumber} className="flex gap-2 mb-3">
            <input
              type="number"
              value={currentNumber}
              onChange={(e) => setCurrentNumber(e.target.value)}
              className="form-input flex-1"
              placeholder="Número (1-90)"
              min="1"
              max="90"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="btn-primary whitespace-nowrap"
              disabled={loading || !currentNumber}
            >
              {loading ? "..." : "Agregar"}
            </button>
          </form>

          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={handleRemoveLastNumber}
              className="btn-cancel flex-1"
              disabled={loading || !draw.drawnNumbers || draw.drawnNumbers.length === 0}
            >
              Eliminar Último
            </button>
            {!autoRefresh && (
              <button
                onClick={loadTopCards}
                className="btn-secondary flex-1"
              >
                Actualizar Ranking
              </button>
            )}
          </div>

          {/* Toggle auto-refresh */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-700">
              Actualizar ranking automáticamente
            </label>
          </div>
        </div>

        {/* Último número sorteado */}
        {lastNumber && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Último número sorteado:</p>
            <div className="text-6xl font-bold text-blue-600">
              {lastNumber.toString().padStart(2, '0')}
            </div>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">{draw.drawnNumbers?.length || 0}</span> números sorteados
            </p>
          </div>
        )}

        {/* Números sorteados */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Números Sorteados
          </h3>
          
          {draw.drawnNumbers && draw.drawnNumbers.length > 0 ? (
            <div className="grid grid-cols-9 gap-2 max-h-64 overflow-y-auto">
              {draw.drawnNumbers.map((num, index) => (
                <div
                  key={index}
                  className="bg-gray-100 border border-gray-300 rounded p-2 text-center font-semibold text-sm"
                >
                  {num.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4 text-sm">
              Aún no se han sorteado números
            </p>
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: Top 10 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🏆 Top 10 Cartones con Más Aciertos
        </h3>

        {topCards.length > 0 ? (
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left">Pos</th>
                  <th className="px-2 py-2 text-left">N° Cartón</th>
                  <th className="px-2 py-2 text-center">Aciertos</th>
                  {/*
                  <th className="px-2 py-2 text-center">%</th>
                  */}
                  <th className="px-2 py-2 text-left">Asociado</th>
                  <th className="px-2 py-2 text-left">Vendedor</th>
                </tr>
              </thead>
              <tbody>
                {topCards.map((card, index) => {
                  const percentage = card.totalNumbers > 0 
                    ? ((card.matches / card.totalNumbers) * 100).toFixed(1) 
                    : 0;
                  
                  const isWinner = card.matches === card.totalNumbers;

                  return (
                    <tr 
                      key={card.bingoCardId} 
                      className={`border-b ${
                        isWinner ? 'bg-green-100 font-bold' : 
                        index === 0 ? 'bg-yellow-50' : 
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-2 py-2 text-center">
                        {<span className="text-gray-600">{index + 1}°</span>}
                      </td>
                      <td className="px-2 py-2 font-semibold">
                        {card.bingoCardNumber}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className={`font-bold ${
                          isWinner ? 'text-green-600 text-lg' : 'text-blue-600'
                        }`}>
                          {card.matches}/{card.totalNumbers}
                        </span>
                      </td>
                      {/*
                      <td className="px-2 py-2 text-center">
                        <span className={`font-semibold text-xs ${
                          isWinner ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                      */}
                      <td className="px-2 py-2 text-xs">
                        {card.client?.lastName}, {card.client?.firstName}
                      </td>
                      <td className="px-2 py-2 text-xs">
                        {card.seller?.lastName}, {card.seller?.firstName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm">
            {draw.drawnNumbers?.length > 0 
              ? "Cargando ranking..." 
              : "El ranking se mostrará cuando comiences a sortear números"}
          </p>
        )}
      </div>
    </div>
  );
}

export default DrawLiveExecution;