import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import {
  Search,
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  Ticket,
  Users,
  Briefcase,
  Wallet,
  TrendingUp,
  Calendar,
  Package,
  FileText,
  MonitorPlay,
  CreditCard,
  Shield
} from "lucide-react";

const NAV_GROUPS = [
  {
    heading: "Acciones Rápidas",
    items: [
      { label: "Registrar Venta", path: "/sale/new", icon: PlusCircle, keywords: "nueva venta carton vender" },
      { label: "Registrar Pago de Vendedor", path: "/sellerPayment/new", icon: Wallet, keywords: "rendicion pago vendedor" },
      { label: "Registrar Movimiento de Balance", path: "/balance/new", icon: TrendingUp, keywords: "ingreso egreso caja balance" },
      { label: "Registrar Asociado", path: "/client/new", icon: Users, keywords: "cliente nuevo asociado" },
    ],
  },
  {
    heading: "Gestión Operativa",
    items: [
      { label: "Dashboard General", path: "/dashboard", icon: LayoutDashboard, keywords: "estadisticas kpi resumen inicio" },
      { label: "Gestión de Ventas", path: "/sales", icon: ShoppingCart, keywords: "ventas operaciones" },
      { label: "Ventas Tarjeta Única", path: "/salesTarjetaUnica", icon: CreditCard, keywords: "tarjeta unica" },
      { label: "Gestión de Cartones", path: "/bingoCards", icon: Ticket, keywords: "cartones stock asignacion" },
      { label: "Historial de Cuotas", path: "/allQuotas", icon: FileText, keywords: "cuotas pagos" },
      { label: "Cuotas Vencidas", path: "/quotas", icon: Wallet, keywords: "morosidad vencidas deuda" },
    ],
  },
  {
    heading: "Administración & Sorteos",
    items: [
      { label: "Gestión de Asociados", path: "/clients", icon: Users, keywords: "clientes padron" },
      { label: "Gestión de Vendedores", path: "/sellers", icon: Briefcase, keywords: "vendedores comisiones" },
      { label: "Pagos de Vendedores", path: "/sellerPayments", icon: Wallet, keywords: "rendiciones" },
      { label: "Arqueo y Balance", path: "/balance", icon: TrendingUp, keywords: "caja ingresos egresos loteria" },
      { label: "Gestión de Ediciones", path: "/editions", icon: Package, keywords: "edicion 2026 bingo" },
      { label: "Gestión de Sorteos", path: "/draws", icon: Calendar, keywords: "sorteos ganadores" },
      { label: "Estado de Bingo (TV)", path: "/bingoCardStatus", icon: MonitorPlay, keywords: "tv pantalla vivo consulta" },
      { label: "Gestión de Usuarios", path: "/users", icon: Shield, keywords: "usuarios roles permisos" },
    ],
  },
];

export default function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleSelect = (path) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[18%] z-[100] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-3xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-150"
        >
          <Dialog.Title className="sr-only">Navegación rápida del sistema</Dialog.Title>
          <Command className="w-full" label="Navegación rápida">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <Command.Input
                autoFocus
                placeholder="Ir a una sección o acción... (ej. Ventas, Balance, Cuotas)"
                className="w-full bg-transparent text-sm font-semibold text-primary placeholder:text-slate-400 outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black text-slate-500 border border-slate-200">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[360px] overflow-y-auto p-3 custom-scrollbar">
              <Command.Empty className="py-10 text-center text-xs font-bold text-slate-400">
                No se encontraron secciones para esa búsqueda.
              </Command.Empty>

              {NAV_GROUPS.map((group) => (
                <Command.Group
                  key={group.heading}
                  heading={group.heading}
                  className="mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-slate-400"
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Command.Item
                        key={item.path}
                        value={`${item.label} ${item.keywords}`}
                        onSelect={() => handleSelect(item.path)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 cursor-pointer aria-selected:bg-primary/5 aria-selected:text-primary transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
