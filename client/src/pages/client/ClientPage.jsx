import { useEffect, useState, useMemo, useCallback } from "react";
import { useClients } from "../../context/ClientContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Plus,
  Search,
  MapPin,
  Phone,
  CreditCard,
  Edit3,
  FileSpreadsheet,
  Settings2,
  ChevronDown,
  Users,
  Eye,
  Loader2
} from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  UserCell,
  OperationCell
} from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import ColumnPicker from "../../components/ui/ColumnPicker";
import { formatDocument } from "../../libs/formatters";
import { exportToExcel } from "../../libs/excelExport";
import { useFeedback } from "../../context/FeedbackContext";

// INFRAESTRUCTURA PREMIUM 2026 ⚓ 🛡️
import { useTableColumns } from "../../hooks/useTableColumns";

/**
 * ClientPage V10.0 - Elite Audit 2026 ✨💎🚀
 * Gestión centralizada de asociados con filtros slim y personalización de grilla.
 */
function ClientPage() {
  const { getClients, clients, loading } = useClients();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useFeedback();

  const [omniSearch, setOmniSearch] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // CONFIGURACIÓN DE COLUMNAS v10.5 🛡️
  const initialColumns = [
    { id: 'clientNumber', label: 'Nro Asociado', isMandatory: true },
    { id: 'identity', label: 'Nombre', isMandatory: true },
    { id: 'document', label: 'Documento' },
    { id: 'location', label: 'Localidad' },
    { id: 'contact', label: 'Contacto' },
    { id: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }
  ];

  const columnManager = useTableColumns("ClientsPage", initialColumns);
  const { visibleColumns } = columnManager;

  useEffect(() => {
    if (user) {
      getClients().catch(err => console.error("Error al sincronizar asociados:", err));
    }
  }, [user]);

  const filteredClients = useMemo(() => {
    const list = Array.isArray(clients) ? clients : [];
    if (!omniSearch) return list;

    const search = omniSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return list.filter(client => {
      const name = `${client.person?.firstName} ${client.person?.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const doc = String(client.person?.document || "").toLowerCase();
      const city = (client.person?.city || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const num = String(client.clientNumber || "").toLowerCase();
      return name.includes(search) || doc.includes(search) || city.includes(search) || num.includes(search);
    });
  }, [clients, omniSearch]);

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
    const columnMap = {
      "clientNumber": "N° Asociado",
      "person.lastName": "Apellido",
      "person.firstName": "Nombre",
      "person.document": "Documento",
      "person.city": "Localidad",
      "person.phone": "Teléfono"
    };
    exportToExcel(filteredClients, "Listado_Asociados_Elite", columnMap);
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Gestión de Asociados"
        //subtitle={`Panel administrativo de ${clients.length} integrantes del sistema.`}
        compact={true}
        icon={Users}
        actions={[
          {
            label: "Exportar",
            icon: FileSpreadsheet,
            variant: "ghost",
            onClick: handleExport
          },
          {
            label: "Crear Asociado",
            icon: Plus,
            onClick: () => navigate("/client/new")
          }
        ]}
      />

      <div className="pb-10 flex-1 flex flex-col min-h-0">
        <Card padding="p-0" className="flex-1 flex flex-col min-h-0 shadow-sm border-slate-200/60 overflow-visible bg-white">

          <div className="flex items-center justify-between border-b border-slate-100/60 elite-audit-bar px-6">
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
                    placeholder="Buscar asociado por nombre, DNI, localidad..."
                    icon={Search}
                    value={omniSearch}
                    onChange={(e) => setOmniSearch(e.target.value)}
                    className="!space-y-0 shadow-none border-transparent focus-within:border-primary/20"
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
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Personalizar Columnas</span>
                <ChevronDown size={11} className={`opacity-40 transition-transform ${isPickerOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
              </button>

              <div className="absolute right-0 top-11 z-[100]">
                <ColumnPicker
                  {...columnManager}
                  isOpen={isPickerOpen}
                  onClose={() => setIsPickerOpen(false)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-auto custom-scrollbar min-h-0 flex-1 bg-white">
            {loading ? (
              <div className="py-24 flex flex-col items-center gap-6">
                <Loader2 className="animate-spin text-primary opacity-20" size={64} />
                <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Sincronizando Base de Datos...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="py-20">
                <EmptyState
                  title="Sin resultados"
                  description="No se encontraron asociados bajo este criterio de búsqueda."
                  icon={User}
                />
              </div>
            ) : (
              <Table className="overflow-hidden">
                <THead>
                  {visibleColumns.map(col => (
                    <TH key={col.id} className={col.id === 'actions' ? 'text-right px-10' : ''}>{col.label}</TH>
                  ))}
                </THead>
                <TBody>
                  {filteredClients.map((client) => (
                    <TR key={client._id} className="group transition-all duration-300">
                      {visibleColumns.map(col => {
                        if (col.id === 'clientNumber') return <OperationCell key={col.id} number={client.clientNumber} />;

                        if (col.id === 'identity') return (
                          <UserCell
                            key={col.id}
                            name={`${client.person?.lastName}, ${client.person?.firstName}`}
                            variant="primary"
                          />
                        );

                        if (col.id === 'document') return (
                          <TD key={col.id}>
                            <div className="flex items-center gap-2 text-slate-500">
                              <CreditCard size={12} className="opacity-40" />
                              <span className="text-xs font-black tracking-tight">{formatDocument(client.person?.document) || "---"}</span>
                            </div>
                          </TD>
                        );

                        if (col.id === 'location') return (
                          <TD key={col.id}>
                            <div className="flex items-center gap-2 text-slate-400">
                              <MapPin size={12} className="opacity-40 text-primary" />
                              <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{client.person?.city || "S/L"}</span>
                            </div>
                          </TD>
                        );

                        if (col.id === 'contact') return (
                          <TD key={col.id}>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2 text-primary font-black text-[11px] tracking-tight">
                                <Phone size={11} className="opacity-50" />
                                {client.person?.phone || "S/T"}
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold truncate max-w-[150px] lowercase pl-4">{client.person?.email || "Sin email"}</div>
                            </div>
                          </TD>
                        );

                        if (col.id === 'actions') return (
                          <TD key={col.id} className="text-right px-10 bg-slate-50/10">
                            <div className="flex justify-end gap-3 transition-all">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/client/edit/${client._id}`)}
                                icon={Edit3}
                              >
                                Editar
                              </Button>
                            </div>
                          </TD>
                        );
                        return <TD key={col.id}>—</TD>;
                      })}
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ClientPage;
