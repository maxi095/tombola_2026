import { useEffect, useState } from "react";
import { useDraws } from "../../context/DrawContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../context/FeedbackContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { useEditionFilter } from "../../context/EditionFilterContext";
import ReactDOMServer from "react-dom/server";
import DrawActa from "../../components/DrawActa";
import DrawPrizeDelivery from "../../components/DrawPrizeDelivery";

// Componentes Estándar 2026 🔱
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import FilterBar from "../../components/ui/FilterBar";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  OperationCell
} from "../../components/ui/Table";
import {
  Trophy,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  Calendar,
  Layers
} from "lucide-react";

dayjs.extend(utc);

export default function DrawPage() {
  const { getDraws, draws, deleteDraw } = useDraws();
  const { user } = useAuth();
  const { selectedEdition } = useEditionFilter();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    type: "",
    status: "",
  });

  const [filteredDraws, setFilteredDraws] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [drawToDelete, setDrawToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      getDraws().catch((error) => {
        console.error("Error fetching draws:", error);
      });
    }
  }, [user, getDraws]);

  useEffect(() => {
    let temp = draws || [];

    if (selectedEdition) {
      temp = temp.filter(
        (draw) => draw.edition?._id === selectedEdition
      );
    }

    if (filters.type) {
      temp = temp.filter((draw) => draw.type === filters.type);
    }

    if (filters.status) {
      temp = temp.filter((draw) => draw.status === filters.status);
    }

    setFilteredDraws(temp);
  }, [draws, filters, selectedEdition]);

  const handleClearFilters = () => {
    setFilters({
      type: "",
      status: "",
    });
  };

  const confirmDelete = (draw) => {
    setDrawToDelete(draw);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!drawToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDraw(drawToDelete._id);
      await getDraws();
      showToast("Sorteo eliminado exitosamente", "success");
      setDeleteModalOpen(false);
      setDrawToDelete(null);
    } catch (error) {
      console.error("Error eliminando sorteo:", error);
      showToast("Error al eliminar el sorteo", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadActa = async (draw) => {
    try {
      showToast("Generando acta de sorteo en PDF...", "info");
      const html2pdf = (await import("html2pdf.js")).default;

      const actaHtml = ReactDOMServer.renderToString(
        <DrawActa draw={draw} />
      );

      const prizesWithWinners = draw.prizes?.filter((p) => p.bingoCard) || [];
      const deliveryPages = prizesWithWinners
        .map((prize) =>
          ReactDOMServer.renderToString(
            <DrawPrizeDelivery draw={draw} prize={prize} />
          )
        )
        .join("");

      const fullHtml = actaHtml + deliveryPages;

      const opt = {
        margin: 0.5,
        filename: `Acta_Sorteo_${draw.edition?.name || "sin-edicion"}_${draw.type}_${dayjs.utc(draw.drawDate).format("YYYY-MM-DD")}.pdf`,
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
        title="Gestión de Sorteos"
        compact={true}
        breadcrumbs={[
          { label: "Sorteos", href: "/draws" },
          { label: "Listado" },
        ]}
        actions={[
          {
            label: "Crear Sorteo",
            icon: Plus,
            onClick: () => navigate("/draw/new"),
          },
        ]}
      />

      <FilterBar
        variant="slim"
        onClear={handleClearFilters}
        hasActiveFilters={Boolean(filters.type || filters.status)}
      >
        <select
          className="bg-white border border-slate-200/60 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary/40 transition-all shadow-sm"
          value={filters.type}
          onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
        >
          <option value="">Todos los tipos</option>
          <option value="Mensual">Mensual</option>
          <option value="Final">Final</option>
        </select>

        <select
          className="bg-white border border-slate-200/60 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary/40 transition-all shadow-sm"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="">Todos los estados</option>
          <option value="Programado">Programado</option>
          <option value="En curso">En curso</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </FilterBar>

      <Card padding="p-0" className="shadow-premium border-slate-200/60 bg-white overflow-hidden mt-4">
        {filteredDraws.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No se encontraron sorteos"
            description="No hay sorteos registrados que coincidan con los filtros seleccionados."
            actionLabel="Crear Sorteo"
            onAction={() => navigate("/draw/new")}
          />
        ) : (
          <Table minWidth="min-w-full">
            <THead>
              <TH>Edición</TH>
              <TH>Tipo</TH>
              <TH>Fecha de Sorteo</TH>
              <TH>Descripción</TH>
              <TH>Premios</TH>
              <TH>Estado</TH>
              <TH className="text-right">Acciones</TH>
            </THead>
            <TBody>
              {filteredDraws.map((draw) => (
                <TR key={draw._id}>
                  <TD className="text-xs font-black text-primary uppercase">
                    {draw.edition?.name || "Sin edición"}
                  </TD>
                  <TD className="text-xs font-bold text-slate-600">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-[11px]">
                      <Layers size={12} className="text-primary opacity-60" />
                      {draw.type}
                    </span>
                  </TD>
                  <TD className="text-xs font-bold text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      {dayjs.utc(draw.drawDate).format("DD/MM/YYYY")}
                    </span>
                  </TD>
                  <TD className="text-xs font-semibold text-slate-600 max-w-xs truncate">
                    {draw.description || "Sin descripción"}
                  </TD>
                  <TD className="text-xs font-black text-slate-700">
                    {draw.prizes?.length || 0} premios
                  </TD>
                  <TD>
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
                  </TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Download}
                        title="Descargar Acta"
                        className="h-8 px-2 text-[10px]"
                        onClick={() => handleDownloadActa(draw)}
                      >
                        Acta
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        title="Ver Detalle"
                        className="h-8 w-8 p-0"
                        onClick={() => navigate(`/draw/view/${draw._id}`)}
                      />
                      {draw.status === "Programado" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit2}
                            title="Editar Sorteo"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-primary"
                            onClick={() => navigate(`/draw/edit/${draw._id}`)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            title="Eliminar Sorteo"
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() => confirmDelete(draw)}
                          />
                        </>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Eliminar Sorteo"
        description={`¿Estás seguro de que deseas eliminar el sorteo "${drawToDelete?.description || drawToDelete?.type}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}
