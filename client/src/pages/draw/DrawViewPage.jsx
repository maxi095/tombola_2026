import { useEffect, useState } from "react";
import { useDraws } from "../../context/DrawContext";
import { useParams, useNavigate } from "react-router-dom";
import { useFeedback } from "../../context/FeedbackContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import WinnerModal from "../../components/WinnerModal";

import ReactDOMServer from "react-dom/server";
import DrawActa from "../../components/DrawActa";
import DrawPrizeDelivery from "../../components/DrawPrizeDelivery";
import DrawLiveExecution from "../../components/DrawLiveExecution";

// Componentes Estándar 2026 🔱
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  Trophy,
  Gift,
  Tv,
  Download,
  X,
  Play,
  CheckCircle,
  UserCheck,
  Trash2,
  Calendar,
  Layers,
  ClipboardList
} from "lucide-react";

dayjs.extend(utc);

export default function DrawViewPage() {
  const { getDraw, updateDraw, registerWinner } = useDraws();
  const [draw, setDraw] = useState(null);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [confirmRemovePrize, setConfirmRemovePrize] = useState(null);
  const [isRemovingWinner, setIsRemovingWinner] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const params = useParams();
  const navigate = useNavigate();
  const { showToast } = useFeedback();

  useEffect(() => {
    const loadDraw = async () => {
      if (!params.id) return;
      try {
        const drawData = await getDraw(params.id);
        setDraw(drawData);
      } catch (error) {
        console.error("Error obteniendo sorteo:", error);
        showToast("Error al cargar la información del sorteo", "error");
      }
    };

    loadDraw();
  }, [params.id, getDraw, showToast]);

  if (!draw) {
    return (
      <div className="py-40 flex flex-col items-center gap-6 bg-slate-50/50 min-h-screen">
        <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">
          Cargando detalle del sorteo...
        </p>
      </div>
    );
  }

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
      showToast("Ganador registrado exitosamente", "success");
    } catch (error) {
      console.error("Error registrando ganador:", error);
      showToast(
        error.response?.data?.message ||
          "Error al registrar ganador. Verificá el número de cartón.",
        "error"
      );
    }
    closeWinnerModal();
  };

  const handleRemoveWinner = async () => {
    if (!confirmRemovePrize) return;

    try {
      setIsRemovingWinner(true);
      const prizeIndex = draw.prizes.findIndex(
        (p) => p.position === confirmRemovePrize.position
      );

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
      showToast("Ganador quitado correctamente", "success");
      setConfirmRemovePrize(null);
    } catch (error) {
      console.error("Error eliminando ganador:", error);
      showToast("Error al quitar ganador", "error");
    } finally {
      setIsRemovingWinner(false);
    }
  };

  const requestStatusChange = (newStatus) => {
    setTargetStatus(newStatus);
    setStatusModalOpen(true);
  };

  const executeStatusChange = async () => {
    try {
      setIsUpdatingStatus(true);
      const updatedDraw = await updateDraw(draw._id, { status: targetStatus });
      setDraw(updatedDraw);
      showToast(`Estado del sorteo actualizado a: ${targetStatus}`, "success");
      setStatusModalOpen(false);
    } catch (error) {
      console.error("Error actualizando estado:", error);
      showToast("Error al actualizar el estado del sorteo", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const allPrizesHaveWinners = draw.prizes?.every((p) => p.bingoCard);
  const canFinalize =
    draw.status !== "Finalizado" &&
    allPrizesHaveWinners &&
    draw.prizes?.length > 0;

  const handleDownloadActa = async (drawToDownload) => {
    try {
      showToast("Generando acta de sorteo en PDF...", "info");
      const html2pdf = (await import("html2pdf.js")).default;

      const actaHtml = ReactDOMServer.renderToString(
        <DrawActa draw={drawToDownload} />
      );

      const prizesWithWinners =
        drawToDownload.prizes?.filter((p) => p.bingoCard) || [];
      const deliveryPages = prizesWithWinners
        .map((prize) =>
          ReactDOMServer.renderToString(
            <DrawPrizeDelivery draw={drawToDownload} prize={prize} />
          )
        )
        .join("");

      const fullHtml = actaHtml + deliveryPages;

      const opt = {
        margin: 0.5,
        filename: `Acta_Sorteo_${drawToDownload.edition?.name || "sin-edicion"}_${drawToDownload.type}_${dayjs.utc(drawToDownload.drawDate).format("YYYY-MM-DD")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().from(fullHtml).set(opt).save();
      showToast("Acta descargada correctamente", "success");
    } catch (error) {
      console.error("Error al descargar acta:", error);
      showToast("Error al generar el PDF del acta", "error");
    }
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen pb-12">
      <PageHeader
        title={`Detalle de Sorteo ${draw.type}`}
        compact={true}
        breadcrumbs={[
          { label: "Sorteos", href: "/draws" },
          { label: "Detalle" },
        ]}
        actions={[
          {
            label: "Volver",
            icon: X,
            variant: "ghost",
            onClick: () => navigate("/draws"),
          },
          {
            label: "Pantalla Ganadores (TV)",
            icon: Tv,
            variant: "ghost",
            onClick: () => window.open(`/draw/display/${draw._id}`, "_blank"),
          },
          {
            label: "Descargar Acta",
            icon: Download,
            onClick: () => handleDownloadActa(draw),
          },
        ]}
      />

      <div className="flex flex-col gap-6">
        {/* CARD 1: INFORMACIÓN GENERAL Y CONTROLES */}
        <Card
          size="slim"
          title="Información del Sorteo"
          icon={Trophy}
          description="Datos generales, modalidad y control de estado"
          className="shadow-premium border-slate-200/60 bg-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-2">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Edición
              </span>
              <span className="text-sm font-black text-primary uppercase">
                {draw.edition?.name || "Global"}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Tipo y Modalidad
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">
                  {draw.type}
                </span>
                {draw.type === "Final" && draw.cardSetNumber && (
                  <Badge variant="info">Conjunto {draw.cardSetNumber}</Badge>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Fecha de Sorteo
              </span>
              <span className="text-sm font-bold text-slate-700">
                {dayjs.utc(draw.drawDate).format("DD/MM/YYYY")}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Estado
              </span>
              <Badge
                variant={
                  draw.status === "Finalizado"
                    ? "success"
                    : draw.status === "En curso"
                    ? "warning"
                    : "info"
                }
              >
                {draw.status}
              </Badge>
            </div>
          </div>

          {/* BOTONES DE TRANSICIÓN DE ESTADO */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {draw.description || "Sin descripción adicional"}
            </span>

            <div className="flex items-center gap-3">
              {draw.status === "Programado" && (
                <Button
                  icon={Play}
                  onClick={() => requestStatusChange("En curso")}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Iniciar Sorteo
                </Button>
              )}

              {canFinalize && (
                <Button
                  icon={CheckCircle}
                  onClick={() => requestStatusChange("Finalizado")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Finalizar Sorteo
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* EJECUCIÓN EN VIVO DEL SORTEO (Solo para Sorteo Final en curso) */}
        {draw.type === "Final" && draw.status === "En curso" && (
          <Card
            size="slim"
            title="Bolillero y Extracción en Vivo"
            icon={Play}
            description="Control en tiempo real de números sorteados"
            className="shadow-premium border-amber-200/60 bg-amber-50/20"
          >
            <DrawLiveExecution
              draw={draw}
              onDrawUpdate={(updatedDraw) => setDraw(updatedDraw)}
            />
          </Card>
        )}

        {/* CARD 2: LISTA DE PREMIOS */}
        <Card
          size="slim"
          title={`Premios del Sorteo (${draw.prizes?.length || 0})`}
          icon={Gift}
          description="Asignación y registro de ganadores por posición"
          className="shadow-premium border-slate-200/60 bg-white"
        >
          {draw.prizes && draw.prizes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
              {draw.prizes.map((prize) => {
                const hasWinner = Boolean(prize.bingoCard);

                return (
                  <div
                    key={prize._id || prize.position}
                    className={`rounded-2xl p-4 border transition-all ${
                      hasWinner
                        ? "border-emerald-200 bg-emerald-50/30"
                        : "border-slate-200/70 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black text-primary uppercase tracking-wide">
                        {prize.position}° Premio
                      </span>
                      {hasWinner ? (
                        <Badge variant="success">Ganador Asignado</Badge>
                      ) : (
                        <Badge variant="default">Pendiente</Badge>
                      )}
                    </div>

                    <p className="text-sm font-bold text-slate-800 mb-3">
                      {prize.description || "Sin descripción"}
                    </p>

                    {hasWinner ? (
                      <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1.5 shadow-sm text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold uppercase text-[10px]">
                            Cartón:
                          </span>
                          <span className="font-black text-primary">
                            #{prize.bingoCard?.number || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold uppercase text-[10px]">
                            Asociado:
                          </span>
                          <span className="font-bold text-slate-700">
                            {prize.sale?.client?.person
                              ? `${prize.sale.client.person.lastName}, ${prize.sale.client.person.firstName}`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold uppercase text-[10px]">
                            Vendedor:
                          </span>
                          <span className="font-bold text-slate-600">
                            {prize.sale?.seller?.person
                              ? `${prize.sale.seller.person.lastName}, ${prize.sale.seller.person.firstName}`
                              : "N/A"}
                          </span>
                        </div>

                        {draw.status !== "Finalizado" && (
                          <div className="pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => setConfirmRemovePrize(prize)}
                              className="w-full h-8 text-[11px] text-red-500 hover:bg-red-50 hover:text-red-700"
                            >
                              Quitar Ganador
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      draw.status !== "Finalizado" && (
                        <Button
                          size="sm"
                          icon={UserCheck}
                          onClick={() => openWinnerModal(prize)}
                          className="w-full text-xs font-bold"
                        >
                          Registrar Ganador
                        </Button>
                      )
                    )}

                    {prize.notes && (
                      <p className="mt-2 text-[11px] text-slate-400 italic">
                        Nota: {prize.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 p-4 italic">
              No hay premios definidos para este sorteo.
            </p>
          )}
        </Card>

        {/* NÚMEROS SORTEADOS HISTÓRICOS */}
        {draw.type === "Final" &&
          draw.drawnNumbers &&
          draw.drawnNumbers.length > 0 && (
            <Card
              size="slim"
              title={`Números Sorteados (${draw.drawnNumbers.length})`}
              icon={ClipboardList}
              description="Historial de bolillas extraídas"
              className="shadow-premium border-slate-200/60 bg-white"
            >
              <div className="flex flex-wrap gap-2 p-2">
                {draw.drawnNumbers.map((num, i) => (
                  <span
                    key={i}
                    className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 font-black text-xs text-primary flex items-center justify-center shadow-sm"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </Card>
          )}
      </div>

      <WinnerModal
        isOpen={isWinnerModalOpen}
        onClose={closeWinnerModal}
        prize={selectedPrize}
        onSave={handleSaveWinner}
      />

      <ConfirmModal
        isOpen={Boolean(confirmRemovePrize)}
        onClose={() => setConfirmRemovePrize(null)}
        onConfirm={handleRemoveWinner}
        loading={isRemovingWinner}
        title="Quitar Ganador"
        description={`¿Estás seguro de que deseas quitar el ganador asignado al ${confirmRemovePrize?.position}° premio?`}
        confirmText="Quitar Ganador"
        variant="warning"
      />

      <ConfirmModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={executeStatusChange}
        loading={isUpdatingStatus}
        title="Cambiar Estado del Sorteo"
        description={`¿Estás seguro de que deseas cambiar el estado del sorteo a "${targetStatus}"?`}
        confirmText="Confirmar Cambio"
      />
    </div>
  );
}
