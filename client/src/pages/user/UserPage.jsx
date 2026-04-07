import { useEffect, useState, useMemo, useCallback } from "react";
import { useUsers } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  Search,
  Mail,
  ShieldCheck,
  Edit2,
  Trash2,
  Loader2,
  FileSpreadsheet,
  AlertTriangle,
  FilterX,
  UserCheck,
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
import { useNavigate } from "react-router-dom";
import EliteSelect from "../../components/ui/Select";

// HOOK DE LAYOUT DINÁMICO v17.1 ✨💎🚀
import { useTableColumns } from "../../hooks/useTableColumns";

/**
 * UserPage V19.5 - Atomic Consolidation 🏹⚖️✨💎🚀
 * Sincronizado con componentes base mejorados.
 */
export default function UserPage() {
  const { getUsers, users, deleteUser, loading } = useUsers();
  const { user } = useAuth();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [omniSearch, setOmniSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // CONFIGURACIÓN DE COLUMNAS v19.5 (ORDEN INSTITUCIONAL) 🛡️
  const initialColumns = [
    { id: 'identity', label: 'Nombre y Apellido', isMandatory: true },
    { id: 'contact', label: 'Contacto' },
    { id: 'role', label: 'Rol' },
    { id: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }
  ];

  const columnManager = useTableColumns("UsersPage", initialColumns);
  const { visibleColumns } = columnManager;

  useEffect(() => {
    if (user) {
      getUsers();
    }
  }, [getUsers, user]);

  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];

    return list.filter(u => {
      const search = omniSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const matchesSearch = !omniSearch || (
        u.username?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search) ||
        u.email?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search) ||
        `${u.person?.firstName} ${u.person?.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search)
      );
      const matchesRole = roleFilter === "all" || u.roles === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, omniSearch, roleFilter]);

  const activeFilters = useMemo(() => {
    const caps = [];
    if (omniSearch) caps.push({ key: 'search', label: 'Búsqueda', value: omniSearch });
    if (roleFilter !== 'all') caps.push({ key: 'role', label: 'Rol', value: roleFilter });
    return caps;
  }, [omniSearch, roleFilter]);

  const handleRemoveFilter = useCallback((key) => {
    if (key === 'search') setOmniSearch("");
    if (key === 'role') setRoleFilter("all");
  }, []);

  const handleClearFilters = useCallback(() => {
    setOmniSearch("");
    setRoleFilter("all");
    showToast("Filtros de personal restablecidos", "info");
  }, [showToast]);

  const handleExport = () => {
    const columnMap = { "person.firstName": "Nombre", "person.lastName": "Apellido", "username": "Usuario", "email": "Email", "roles": "Rol" };
    exportToExcel(filteredUsers, "Usuarios_Tombola_2026", columnMap);
  };

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(userToDelete);
      showToast("Acceso de usuario revocado correctamente", "success");
      setIsDeleteModalOpen(false);
    } catch (error) {
      showToast("Error al revocar acceso", "error");
    }
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Monitoreo de accesos y administración inteligente del equipo."
        breadcrumbs={[{ label: "Usuarios", href: "/users" }]}
        compact={true}
        actions={[
          {
            label: "Exportar",
            icon: FileSpreadsheet,
            variant: "ghost",
            onClick: handleExport
          },
          {
            label: "Crear Usuario",
            icon: Plus,
            variant: "primary",
            onClick: () => navigate("/users/new")
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
                    placeholder="Buscar por nombre, usuario o email..."
                    icon={Search}
                    value={omniSearch}
                    onChange={(e) => setOmniSearch(e.target.value)}
                    className="!space-y-0"
                  />
                </div>
                <div className="w-[220px]">
                  <EliteSelect
                    options={[
                      { value: "all", label: "Todos los Roles" },
                      { value: "Administrador", label: "Administrador" },
                      { value: "Vendedor", label: "Vendedor" }
                    ]}
                    value={{ value: roleFilter, label: roleFilter === "all" ? "Filtro de Rol: Todos" : `Rol: ${roleFilter}` }}
                    onChange={(selected) => setRoleFilter(selected.value)}
                    isSearchable={false}
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
                <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Sincronizando Usuarios...</p>
              </div>
            ) : (
              <Table>
                <THead>
                  {visibleColumns.map(col => (
                    <TH key={col.id} className={col.id === 'actions' ? 'text-right px-10 font-black' : ''}>{col.label}</TH>
                  ))}
                </THead>
                <TBody>
                  {filteredUsers.length === 0 ? (
                    <TR><TD colSpan={visibleColumns.length} className="py-20 text-center text-slate-300 font-medium italic animate-in fade-in slide-in-from-top-2 duration-500">Sin usuarios para esta selección</TD></TR>
                  ) : (
                    filteredUsers.map((u) => (
                      <TR key={u._id} className="group transition-all duration-300">
                        {visibleColumns.map(col => {
                          if (col.id === 'identity') return (
                            <TD key={col.id}>
                              <div className="flex items-center gap-5">
                                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-black text-xs shadow-inner group-hover:scale-110 transition-transform">
                                  {u.person?.firstName?.charAt(0)}{u.person?.lastName?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-black text-primary text-sm tracking-tight font-manrope leading-none mb-1">
                                    {u.person?.firstName} {u.person?.lastName}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-bold tracking-tight uppercase">
                                    @{u.username}
                                  </div>
                                </div>
                              </div>
                            </TD>
                          );
                          if (col.id === 'contact') return (
                            <TD key={col.id}>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                  <Mail size={12} className="text-slate-300" />
                                  {u.email}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold px-5">
                                  {u.phone || "Sin teléfono registrado"}
                                </div>
                              </div>
                            </TD>
                          );
                          if (col.id === 'role') return (
                            <TD key={col.id}>
                              <Badge variant={u.roles === "Administrador" ? "primary" : "secondary"} className="gap-2 px-3 h-6">
                                <ShieldCheck size={10} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{u.roles}</span>
                              </Badge>
                            </TD>
                          );
                          if (col.id === 'actions') return (
                            <TD key={col.id} className="text-right px-10 bg-slate-50/10">
                              <div className="flex justify-end gap-3 transition-all">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/users/edit/${u._id}`)}
                                  icon={Edit2}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteClick(u._id)}
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
        title="¿Eliminar usuario?"
        message="Esta acción no se puede deshacer. Se perderá el acceso para este integrante del equipo."
        confirmLabel="Eliminar Definitivamente"
        variant="danger"
        icon={Trash2}
      />
    </div>
  );
}
