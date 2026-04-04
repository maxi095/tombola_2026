import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useEditionFilter } from "../context/EditionFilterContext";
import { useEditions } from "../context/EditionContext";
import { Search, Bell, ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";
// Se renombra a EliteSelect para evitar conflictos de identificación con Babel/Vite
import EliteSelect from "./ui/Select";

/**
 * BarraTareas - Premium 2026 v4.3 (Atomic Integration)
 * Incluye el Filtro Maestro de Ediciones y gestión de perfil institucional.
 */
export default function BarraTareas() {
  const { user, logout, isAuthenticated } = useAuth();
  const { selectedEdition, setSelectedEdition } = useEditionFilter();
  const { editions, getEditions } = useEditions();

  // 1) Cargar ediciones al detectar autenticación
  useEffect(() => {
    if (isAuthenticated) {
      getEditions();
    }
  }, [isAuthenticated, getEditions]);

  // 2) Lógica de Negocio: Autoseleccionar la última edición disponible
  useEffect(() => {
    if (isAuthenticated && editions.length > 0 && !selectedEdition) {
      const ultima = editions[editions.length - 1];
      setSelectedEdition(ultima._id);
    }
  }, [isAuthenticated, editions, selectedEdition, setSelectedEdition]);

  return (
    <div className="h-full px-8 flex items-center justify-between animate-in fade-in duration-500">

      {/* SECTOR IZQUIERDO: Búsqueda Global y Selector de Edición */}
      <div className="flex items-center gap-8 flex-1 max-w-3xl">

        {/* Selector de Edición Maestro */}
        <div className="flex items-center gap-3 border-r border-slate-100 pr-8">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
            Contexto:
          </label>
          <EliteSelect
            variant="minimal"
            className="min-w-[180px]"
            value={selectedEdition 
              ? { value: selectedEdition, label: editions.find(e => e._id === selectedEdition)?.name || "Edición..." } 
              : { value: "", label: "Seleccionar..." }
            }
            onChange={(selected) => setSelectedEdition(selected.value)}
            options={editions.map(ed => ({ value: ed._id, label: `Edición ${ed.name}` }))}
            isSearchable={false}
          />
        </div>

        {/* Buscador Global */}
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar en el sistema..."
            className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-8 focus:ring-primary/5 transition-all font-medium placeholder:text-slate-400 focus:bg-white"
          />
        </div>
      </div>

      {/* SECTOR DERECHO: Notificaciones y Perfil */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full group-hover:scale-125 transition-transform"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-100"></div>

        {/* Menú de Usuario Premium */}
        <div className="flex items-center gap-4 cursor-pointer group hover:bg-slate-50 p-1.5 pr-3 rounded-2xl transition-all relative">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-primary leading-tight font-manrope">
              {user?.person?.firstName || user?.username} {user?.person?.lastName || ''}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              {user?.roles === 'Administrador' ? 'Administrador' : 'Vendedor'}
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-xl shadow-primary/20 transition-transform group-hover:scale-105 uppercase">
            {user?.person?.firstName?.charAt(0) || user?.username?.charAt(0)}
          </div>

        </div>
      </div>
    </div>
  );
}
