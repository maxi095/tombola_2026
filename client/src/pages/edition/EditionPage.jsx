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
  Settings2,
  ChevronDown
} from "lucide-react";

// Infraestructura Premium 2026 ⚓ 🛡️
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import InputField from "../../components/ui/InputField";
import FilterBar from "../../components/ui/FilterBar";
import { Table, THead, TBody, TR, TH, TD } from "../../components/ui/Table";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ColumnPicker from "../../components/ui/ColumnPicker";
import { exportToExcel } from "../../libs/excelExport";
import { useFeedback } from "../../context/FeedbackContext";
import { formatCurrency } from "../../libs/formatters";

// HOOK DE LAYOUT DINÁMICO v17.1 ✨💎🚀
import { useTableColumns } from "../../hooks/useTableColumns";

/**
 * EditionPage V16.5 - High Density Configuration Console ⚓🛡️
 * Sincronizado con Estándar Elite 2026 y Componentes Base v4.0.
 */
export default function EditionPage() {
  const { getEditions, editions, deleteEdition, loading } = useEditions();
  const { user } = useAuth();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [omniSearch, setOmniSearch] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editionToDelete, setEditionToDelete] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // CONFIGURACIÓN DE COLUMNAS v16.5 🛡️
  const initialColumns = [
    { id: 'identity', label: 'Identidad de Edición', isMandatory: true },
    { id: 'financials', label: 'Emisión y Costos' },
    { id: 'config', label: 'Configuración' },
    { id: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }
  ];

  const columnManager = useTableColumns("EditionsPage", initialColumns);
  const { visibleColumns } = columnManager;

  useEffect(() => {
    if (user) {
      getEditions();
    }
  }, [getEditions, user]);

  const filteredEditions = useMemo(() => {
    const list = Array.isArray(editions) ? editions : [];
    if (!omniSearch) return list;

    const search = omniSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return list.filter(edition =>
      edition.name?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search)
    );
  }, [editions, omniSearch]);

  const activeFilters = useMemo(() => {
    const list = [];
    if (omniSearch) list.push({ key: 'search', label: 'Búsqueda', value: omniSearch });
    return list;
  }, [omniSearch]);

  const handleRemoveFilter = useCallback((key) => {
    if (key === 'search') setOmniSearch("");
  }, []);

  const handleClearFilters = useCallback(() => {
    setOmniSearch("");
    showToast("Filtros restablecidos", "info");
  }, [showToast]);

  const handleExport = () => {
    const columnMap = { "name": "Nombre Edición", "quantityCartons": "Emisión Cartones", "cost": "Costo Total", "maxQuotas": "Cuotas Máximas" };
    exportToExcel(filteredEditions, "Ediciones_Tombola_2026", columnMap);
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
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Gestión de Ediciones"
        breadcrumbs={[{ label: "Ediciones", href: "/editions" }]}
        compact={true}
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

      <div className="pb-10 flex-1 flex flex-col min-h-0">
        <Card padding="p-0" className="flex-1 flex flex-col min-h-0 shadow-sm border-slate-200/60 overflow-visible bg-white">

          <div className="flex items-center justify-between elite-audit-bar px-6">
            <div className="flex-1 min-h-[32px]">
              <FilterBar
                variant="slim"
                activeFilters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearFilters={handleClearFilters}
                title="Panel de filtros"
              >
                <div className="flex-1 min-w-[320px]">
                  <InputField
                    placeholder="Buscar por nombre de edición..."
                    icon={Search}
                    value={omniSearch}
                    onChange={(e) => setOmniSearch(e.target.value)}
                    className="!space-y-0"
                  />
                </div>
              </FilterBar>
            </div>

            <div className="relative shrink-0 flex items-center pr-4">
              <button
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all active:scale-95 group ${isPickerOpen ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/40'}`}
              >
                <Settings2 size={13} className={isPickerOpen ? 'animate-spin-slow' : 'opacity-60'} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Personalizar columnas</span>
                <ChevronDown size={11} className={`opacity-40 transition-transform ${isPickerOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
              </button>

              <div className="absolute right-0 top-11 z-[101]">
                <ColumnPicker
                  {...columnManager}
                  isOpen={isPickerOpen}
                  onClose={() => setIsPickerOpen(false)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-auto custom-scrollbar min-h-0 flex-1">
            {loading ? (
              <div className="py-24 flex flex-col items-center gap-6">
                <Loader2 className="animate-spin text-primary opacity-20" size={64} />
                <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Consultando Ediciones...</p>
              </div>
            ) : (
              <Table className="overflow-hidden">
                <THead>
                  {visibleColumns.map(col => (
                    <TH key={col.id} className={col.id === 'actions' ? 'text-right px-10 font-black' : ''}>{col.label}</TH>
                  ))}
                </THead>
                <TBody>
                  {filteredEditions.length === 0 ? (
                    <TR><TD colSpan={visibleColumns.length} className="py-20 text-center text-slate-300 font-medium italic animate-in fade-in slide-in-from-top-2 duration-500">Sin ediciones registradas</TD></TR>
                  ) : (
                    filteredEditions.map((unit) => (
                      <TR key={unit._id} className="group transition-all duration-300">
                        {visibleColumns.map(col => {
                          if (col.id === 'identity') return (
                            <TD key={col.id}>
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-inner group-hover:rotate-6 transition-transform">
                                  <Calendar size={20} />
                                </div>
                                <div className="font-black text-primary text-sm tracking-tight font-manrope">
                                  {unit.name}
                                </div>
                              </div>
                            </TD>
                          );
                          if (col.id === 'financials') return (
                            <TD key={col.id}>
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
                          );
                          if (col.id === 'config') return (
                            <TD key={col.id}>
                              <Badge variant="secondary" className="gap-2 px-3 h-6">
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Plan de {unit.maxQuotas} cuotas</span>
                              </Badge>
                            </TD>
                          );
                          if (col.id === 'actions') return (
                            <TD key={col.id} className="text-right px-10 bg-slate-50/10">
                              <div className="flex justify-end gap-3 transition-all">
                                <Button
                                  variant="ghost"
                                  size="sm"
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
                          );
                          return <TD key={col.id}>—</TD>;
                        })}
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            )}
          </div>
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
