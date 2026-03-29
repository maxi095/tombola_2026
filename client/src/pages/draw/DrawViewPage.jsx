import { useEffect, useState } from "react";
import { useDraws } from "../../context/DrawContext";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import WinnerModal from "../../components/WinnerModal";

import ReactDOMServer from "react-dom/server";
import DrawActa from "../../components/DrawActa";
import DrawPrizeDelivery from "../../components/DrawPrizeDelivery";
import DrawLiveExecution from "../../components/DrawLiveExecution";

dayjs.extend(utc);

function DrawViewPage() {
  const { getDraw, updateDraw, registerWinner } = useDraws();
  const [draw, setDraw] = useState(null);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadDraw = async () => {
      if (!params.id) return;

      try {
        const drawData = await getDraw(params.id);
        setDraw(drawData);
      } catch (error) {
        console.error("Error obteniendo sorteo:", error);
      }
    };

    loadDraw();
  }, [params.id, getDraw]);

  if (!draw) return <p className="text-gray-700 p-4">Cargando...</p>;

  const handleBack = () => {
    navigate(-1);
  };

  const openWinnerModal = (prize) => {
    setSelectedPrize(prize);
    setIsWinnerModalOpen(true);
  };

  const closeWinnerModal = () => {
    setIsWinnerModalOpen(false);
    setSelectedPrize(null);
  };

  const handleSaveWinner = async (bingoCardNumber) => {
    try {
      const updatedDraw = await registerWinner({
        drawId: draw._id,
        prizePosition: selectedPrize.position,
        bingoCardNumber: parseInt(bingoCardNumber),
      });

      setDraw(updatedDraw);
      alert("Ganador registrado exitosamente");
    } catch (error) {
      console.error("Error registrando ganador:", error);
      alert(
        error.response?.data?.message ||
          "Error al registrar ganador. Verificá el número de cartón."
      );
    }
    closeWinnerModal();
  };

  const handleRemoveWinner = async (prize) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas quitar el ganador del ${prize.position}° premio?`
      )
    )
      return;

    try {
      // Encontrar el índice del premio
      const prizeIndex = draw.prizes.findIndex(
        (p) => p.position === prize.position
      );

      // Actualizar el sorteo eliminando los datos del ganador
      const updatedPrizes = [...draw.prizes];
      updatedPrizes[prizeIndex] = {
        ...updatedPrizes[prizeIndex],
        bingoCard: null,
        sale: null,
        winnerRegisteredAt: null,
      };

      const updatedDraw = await updateDraw(draw._id, {
        prizes: updatedPrizes,
      });

      setDraw(updatedDraw);
      alert("Ganador eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando ganador:", error);
      alert("Error al eliminar ganador");
    }
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      const updatedDraw = await updateDraw(draw._id, { status: newStatus });
      setDraw(updatedDraw);
      alert(`Estado actualizado a: ${newStatus}`);
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("Error al actualizar estado");
    }
  };

  const allPrizesHaveWinners = draw.prizes.every((p) => p.bingoCard);
  const canFinalize =
    draw.status !== "Finalizado" &&
    allPrizesHaveWinners &&
    draw.prizes.length > 0;

const handleDownloadActa = async (draw) => {
  const html2pdf = (await import("html2pdf.js")).default;

  // Renderizar el acta principal
  const actaHtml = ReactDOMServer.renderToString(
    <DrawActa draw={draw} />
  );

  // Renderizar las hojas de entrega de premios (solo para premios con ganador)
  const prizesWithWinners = draw.prizes?.filter(p => p.bingoCard) || [];
  const deliveryPages = prizesWithWinners.map(prize => 
    ReactDOMServer.renderToString(
      <DrawPrizeDelivery draw={draw} prize={prize} />
    )
  ).join("");

  // Combinar todo el HTML
  const fullHtml = actaHtml + deliveryPages;

  const opt = {
    margin: 0.5,
    filename: `Acta_Sorteo_${draw.edition?.name || "sin-edicion"}_${draw.type}_${dayjs.utc(draw.drawDate).format("YYYY-MM-DD")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Para respetar los pageBreak
  };

  html2pdf().from(fullHtml).set(opt).save();
};

  return (
    <div className="page-wide">
      <div className="flex justify-between items-center mb-4 gap-2">
        <h1 className="title mb-4">
          Sorteo {draw.type} - {draw.edition?.name || "N/A"}
        </h1>
        <div className="flex gap-2">
          {/* 👇 Aquí faltaba el "<a" al principio */}
          <a 
            href={`/draw/display/${draw._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            📺 Pantalla de Ganadores
          </a>
          
          <button
            onClick={handleDownloadActa} // Nota: asegúrate que pasas 'draw' si la función lo requiere: () => handleDownloadActa(draw)
            className="btn-primary"
          >
            📄 Descargar Acta
          </button>
        </div>
      </div>

      {/* Información del sorteo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 mb-8">
        <div>
          <p>
            <span className="font-semibold">Edición:</span>{" "}
            {draw.edition?.name || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Tipo:</span> {draw.type}
          </p>
        </div>
        <div>
          <p>
            <span className="font-semibold">Fecha del Sorteo:</span>{" "}
            {dayjs.utc(draw.drawDate).format("DD/MM/YYYY")}
          </p>
          {/* 👇 NUEVO */}
          {draw.type === "Final" && draw.cardSetNumber && (
            <p>
              <span className="font-semibold">Conjunto de Cartones:</span>{" "}
              Conjunto {draw.cardSetNumber}
            </p>
          )}
          <p>
            <span className="font-semibold">Estado:</span>{" "}
            <span
              className={`status-label ${
                draw.status === "Finalizado"
                  ? "status-confirmada"
                  : draw.status === "En curso"
                  ? "status-pendiente"
                  : "status-sin-cargo"
              }`}
            >
              {draw.status}
            </span>
          </p>
        </div>
        <div>
          <p>
            <span className="font-semibold">Nombre:</span>{" "}
            {draw.description || "Sin descripción"}
          </p>
          <p>
            <span className="font-semibold">Total de Premios:</span>{" "}
            {draw.prizes?.length || 0}
          </p>
        </div>
      </div>

      {/* Botones de acción para cambiar estado */}
      {draw.status === "Programado" && (
        <div className="mb-4">
          <button
            onClick={() => handleChangeStatus("En curso")}
            className="btn-primary"
          >
            Iniciar Sorteo
          </button>
        </div>
      )}

      {/* Ejecución en vivo del sorteo (solo para sorteo Final) */}
      {draw.type === "Final" && draw.status === "En curso" && (
        <div className="mb-6">
          <DrawLiveExecution 
            draw={draw} 
            onDrawUpdate={(updatedDraw) => setDraw(updatedDraw)}
          />
        </div>
      )}

      {canFinalize && (
        <div className="mb-4">
          <button
            onClick={() => handleChangeStatus("Finalizado")}
            className="btn-primary"
          >
            Finalizar Sorteo
          </button>
        </div>
      )}

      {/* Lista de Premios */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Premios</h2>

      {draw.prizes && draw.prizes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {draw.prizes.map((prize) => {
            const hasWinner = Boolean(prize.bingoCard);

            const cardColor = hasWinner
              ? "border-green-400 bg-green-50"
              : "border-gray-300 bg-white";

            return (
              <div
                key={prize._id}
                className={`rounded-xl shadow-md p-4 border ${cardColor}`}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {prize.position}° Premio
                </h3>
                <p>
                  <span className="font-semibold">Descripción:</span>{" "}
                  {prize.description || "Sin descripción"}
                </p>

                {hasWinner ? (
                  <>
                    <div className="mt-3 p-3 bg-white rounded border border-green-300">
                      <p className="font-semibold text-green-700 mb-2">
                        🏆 Ganador
                      </p>
                      <p>
                        <span className="font-semibold">Cartón:</span>{" "}
                        {prize.bingoCard?.number || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Asociado:</span>{" "}
                        {prize.sale?.client?.person?.firstName}{" "}
                        {prize.sale?.client?.person?.lastName || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Vendedor:</span>{" "}
                        {prize.sale?.seller?.person?.firstName}{" "}
                        {prize.sale?.seller?.person?.lastName || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Fecha venta:</span>{" "}
                        {dayjs
                          .utc(prize.sale?.saleDate)
                          .format("DD/MM/YYYY")}
                      </p>
                    </div>

                    {draw.status !== "Finalizado" && (
                      <button
                        onClick={() => handleRemoveWinner(prize)}
                        className="btn-cancel mt-3 w-full"
                      >
                        Quitar Ganador
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {draw.status !== "Finalizado" && (
                      <button
                        onClick={() => openWinnerModal(prize)}
                        className="btn-registrar mt-3 w-full"
                      >
                        Registrar Ganador
                      </button>
                    )}
                  </>
                )}

                {prize.notes && (
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold">Notas:</span> {prize.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="empty-state">No hay premios definidos para este sorteo.</p>
      )}

      {/* Números sorteados (solo para sorteo final) */}
      {draw.type === "Final" && draw.drawnNumbers && draw.drawnNumbers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Números Sorteados
          </h2>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-700">
              {draw.drawnNumbers.join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button onClick={handleBack} className="btn-view">
          Volver
        </button>
      </div>

      <WinnerModal
        isOpen={isWinnerModalOpen}
        onClose={closeWinnerModal}
        prize={selectedPrize}
        onSave={handleSaveWinner}
      />
    </div>
  );
}

export default DrawViewPage;