import { useEffect, useState, useMemo, useCallback } from "react";
import { useEditions } from "../../context/EditionContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  CreditCard,
  Hash,
  FileSpreadsheet,
  AlertTriangle,
  Search,
  FilterX
} from "lucide-react";

// Infraestructura Premium 2026
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import InputField from "../../components/ui/InputField";
import FilterBar from "../../components/ui/FilterBar";
import { Table, THead, TBody, TH, TD } from "../../components/ui/Table";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { exportToExcel } from "../../libs/excelExport";
import { useFeedback } from "../../context/FeedbackContext";
import { formatCurrency } from "../../libs/formatters";

/**
 * EditionPage V4.9 - Unificación de Interfaz
 * Gestión de ciclos temporales con barra de filtros institucional.
 */
export default function EditionPage() {
  const { getEditions, editions, deleteEdition, loading } = useEditions();
  const { user } = useAuth();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editionToDelete, setEditionToDelete] = useState(null);

  useEffect(() => {
    if (user) {
      getEditions();
    }
  }, [getEditions, user]);

  const filteredEditions = useMemo(() => {
    const list = Array.isArray(editions) ? editions : [];
    return list.filter(edition =>
      edition.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [editions, searchTerm]);

  const handleExport = () => {
    const columnMap = {
      "name": "Nombre Edición",
      "quantityCartons": "Emisión Cartones",
      "cost": "Costo Total",
      "maxQuotas": "Cuotas Máximas"
    };
    exportToExcel(filteredEditions, "Ediciones_Tombola_2026", columnMap);
    showToast("Exportando ediciones filtradas...", "info");
  };

  const clearFilters = () => {
    setSearchTerm("");
    showToast("Búsqueda restablecida", "info");
  };

  const handleDeleteClick = (id) => {
    setEditionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteEdition(editionToDelete);
      showToast("Edición eliminada correctamente", "success");
      setIsDeleteModalOpen(false);
    } catch (error) {
      showToast("Error al eliminar edición", "error");
    }
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700">

      <PageHeader
        title="Gestión de Ediciones"
        subtitle="Administración de ciclos temporales, costos y emisión de cartones."
        breadcrumbs={[{ label: "Ediciones", href: "/editions" }]}
        actions={[
          {
            label: "Exportar",
            icon: FileSpreadsheet,
            variant: "ghost",
            onClick: handleExport
          },
          {
            label: "Crear Edición",
            icon: Plus,
            variant: "primary",
            onClick: () => navigate("/edition/new")
          }
        ]}
      />

      <div className="pb-24">

        <FilterBar>
          <div className="flex-1 min-w-[300px]">
            <InputField
              label="Filtrar por Nombre"
              placeholder="Buscar por nombre de edición..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="ghost"
            className="h-12 px-5 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-black text-[10px] uppercase tracking-widest gap-2"
            onClick={clearFilters}
          >
            <FilterX size={16} />
            Limpiar
          </Button>
        </FilterBar>

        <Card padding="p-0 overflow-hidden">
          {loading ? (
            <div className="py-40 flex flex-col items-center gap-6">
              <Loader2 className="animate-spin text-primary opacity-20" size={64} />
              <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Consultando Ediciones...</p>
            </div>
          ) : (
            <Table>
              <THead>
                <TH>Identidad de Edición</TH>
                <TH>Emisión y Costos</TH>
                <TH>Configuración</TH>
                <TH className="text-right px-8">ACCIONES</TH>
              </THead>
              <TBody>
                {filteredEditions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center text-slate-300 font-medium italic">Sin ediciones registradas</td>
                  </tr>
                ) : (
                  filteredEditions.map((unit) => (
                    <tr key={unit._id} className="group hover:bg-slate-50/40 transition-all duration-300">
                      <TD>
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-inner group-hover:rotate-6 transition-transform">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <div className="font-black text-primary text-sm tracking-tight font-manrope">
                              {unit.name}
                            </div>
                          </div>
                        </div>
                      </TD>
                      <TD>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tighter">
                            <Hash size={12} className="text-slate-300" />
                            {unit.quantityCartons} Cartones
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600 font-black text-[11px] tracking-widest">
                            <CreditCard size={12} className="text-emerald-300" />
                            {formatCurrency(unit.cost)}
                          </div>
                        </div>
                      </TD>
                      <TD>
                        <Badge variant="secondary" className="gap-2">
                          Plan de {unit.maxQuotas} cuotas
                        </Badge>
                      </TD>
                      <TD className="text-right px-8">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-slate-50 hover:bg-primary hover:text-white"
                            onClick={() => navigate(`/edition/edit/${unit._id}`)}
                            icon={Edit2}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(unit._id)}
                            icon={Trash2}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TD>
                    </tr>
                  ))
                )}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Acción de alto impacto?"
        message="Estás por eliminar una edición completa. Esta acción eliminará en cascada todos los cartones y ventas asociados. ¿Estás absolutamente seguro?"
        confirmLabel="Sí, eliminar todo"
        icon={AlertTriangle}
        variant="danger"
      />
    </div>
  );
}
