import { useEffect, useState, useMemo } from "react";
import { useUsers } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  Search,
  UserPlus,
  Mail,
  ShieldCheck,
  MoreVertical,
  Edit2,
  Trash2,
  Loader2,
  Hash,
  FileSpreadsheet,
  AlertTriangle,
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
import { useNavigate } from "react-router-dom";
// Se renombra a EliteSelect para evitar conflictos de identificación con Babel/Vite
import EliteSelect from "../../components/ui/Select";

/**
 * UserPage V4.9 - Unificación de Interfaz
 * Gestión de usuarios con barra de filtros institucional.
 */
export default function UserPage() {
  const { getUsers, users, deleteUser, loading } = useUsers();
  const { user } = useAuth();
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (user) {
      getUsers();
    }
  }, [getUsers, user]);

  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return list.filter(u => {
      const matchesSearch =
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${u.person?.firstName} ${u.person?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || u.roles === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleExport = () => {
    const columnMap = {
      "person.firstName": "Nombre",
      "person.lastName": "Apellido",
      "username": "Usuario",
      "email": "Email",
      "roles": "Rol"
    };
    exportToExcel(filteredUsers, "Usuarios_Tombola_2026", columnMap);
    showToast("Exportando usuarios filtrados...", "info");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    showToast("Filtros restablecidos", "info");
  };

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(userToDelete);
      showToast("Usuario eliminado correctamente", "success");
      setIsDeleteModalOpen(false);
    } catch (error) {
      showToast("Error al eliminar usuario", "error");
    }
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700">

      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Monitoreo de accesos y administración inteligente del equipo."
        breadcrumbs={[{ label: "Usuarios", href: "/users" }]}
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

      <div className="pb-24">

        <FilterBar>
          <div className="flex-1 min-w-[300px]">
            <InputField
              label="Búsqueda de Personal"
              placeholder="Buscar nombre, apellido, usuario o mail..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-[240px]">
            <EliteSelect
              label="Filtrar por Rol"
              options={[
                { value: "all", label: "Todos los Roles" },
                { value: "Administrador", label: "Administrador" },
                { value: "Vendedor", label: "Vendedor" }
              ]}
              value={{ 
                value: roleFilter, 
                label: roleFilter === "all" ? "Todos los Roles" : roleFilter 
              }}
              onChange={(selected) => setRoleFilter(selected.value)}
              isSearchable={false}
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
              <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Sincronizando Usuarios...</p>
            </div>
          ) : (
            <>
              <Table>
                <THead>
                  <TH>Nombre y Apellido</TH>
                  <TH>Contacto</TH>
                  <TH>Rol</TH>
                  <TH className="text-right px-8">ACCIONES</TH>
                </THead>
                <TBody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-20 text-center text-slate-300 font-medium italic">Sin usuarios para esta selección</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u._id} className="group hover:bg-slate-50/40 transition-all duration-300">
                        <TD>
                          <div className="flex items-center gap-5">
                            <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-black text-xs shadow-inner group-hover:scale-110 transition-transform">
                              {u.person?.firstName?.charAt(0)}{u.person?.lastName?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-black text-primary text-sm tracking-tight font-manrope leading-none mb-1">
                                {u.person?.firstName} {u.person?.lastName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-bold tracking-tight">
                                @{u.username?.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </TD>
                        <TD>
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
                        <TD>
                          <Badge variant={u.roles === "Administrador" ? "primary" : "secondary"} className="gap-2">
                            <ShieldCheck size={10} />
                            {u.roles}
                          </Badge>
                        </TD>
                        <TD className="text-right px-8">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-slate-50 hover:bg-primary hover:text-white"
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
                      </tr>
                    ))
                  )}
                </TBody>
              </Table>
            </>
          )}
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
