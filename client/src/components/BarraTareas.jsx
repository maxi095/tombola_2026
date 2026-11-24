import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEditionFilter } from "../context/EditionFilterContext";
import { useEditions } from "../context/EditionContext";
import { useLayout } from "../context/LayoutContext";
import { PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import EliteSelect from "./ui/Select";
import CommandPalette from "./ui/CommandPalette";

/**
 * BarraTareas - Standard 2026
 * Filtro maestro de ediciones, Command Palette (Ctrl+K), control de sidebar e info de sesión.
 */
export default function BarraTareas() {
  const { user, isAuthenticated } = useAuth();
  const { selectedEdition, setSelectedEdition } = useEditionFilter();
  const { editions, getEditions } = useEditions();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      getEditions();
    }
  }, [isAuthenticated, getEditions]);

  useEffect(() => {
    if (isAuthenticated && editions.length > 0 && !selectedEdition) {
      const ultima = editions[editions.length - 1];
      setSelectedEdition(ultima._id);
    }
  }, [isAuthenticated, editions, selectedEdition, setSelectedEdition]);

  const roleLabel = user?.roles || "Usuario";

  return (
    <>
      <div className="h-full px-8 flex items-center justify-between gap-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-6 flex-1 max-w-3xl">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-primary hover:bg-primary/5 transition-all active:scale-95"
            title={isSidebarCollapsed ? "Expandir Menú" : "Colapsar Menú"}
            aria-label={isSidebarCollapsed ? "Expandir Menú" : "Colapsar Menú"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>

          <div className="flex items-center gap-3 border-r border-slate-100 pr-6">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Contexto:
            </span>
            <EliteSelect
              className="min-w-[190px]"
              value={
                selectedEdition
                  ? {
                      value: selectedEdition,
                      label: editions.find((e) => e._id === selectedEdition)?.name || "Edición...",
                    }
                  : { value: "", label: "Seleccionar..." }
              }
              onChange={(selected) => setSelectedEdition(selected.value)}
              options={editions.map((ed) => ({ value: ed._id, label: `Edición ${ed.name}` }))}
              isSearchable={false}
            />
          </div>

          {/* Disparador real de Command Palette (Ctrl + K) */}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center justify-between gap-4 flex-1 max-w-xs px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 text-slate-400 hover:text-slate-600 transition-all text-xs font-semibold"
          >
            <span className="flex items-center gap-2.5 truncate">
              <Search size={15} className="text-slate-400 shrink-0" />
              <span>Ir rápido a...</span>
            </span>
            <kbd className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-500 shadow-sm shrink-0">
              Ctrl K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-primary leading-tight font-manrope">
              {user?.person?.firstName || user?.username} {user?.person?.lastName || ""}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              {roleLabel}
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-xl shadow-primary/20 uppercase">
            {user?.person?.firstName?.charAt(0) || user?.username?.charAt(0)}
          </div>
        </div>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
