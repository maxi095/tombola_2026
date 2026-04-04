import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  Layout,
  Package,
  ShoppingCart,
  User,
  Calendar,
  Users,
  Settings,
  LogOut,
  FileText,
  CheckCircle,
  Briefcase,
  Wallet
} from "lucide-react";

/**
 * Sidebar V2 - Versión Ultra-Compatible
 */
const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const SidebarLink = ({ to, icon: Icon, children }) => {
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(to)
          ? 'bg-blue-50 text-blue-900 shadow-sm shadow-blue-900/5'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
      >
        <div className={`p-1.5 rounded-lg transition-colors ${isActive(to) ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-900'}`}>
          <Icon size={18} />
        </div>
        <span className={`text-[13px] font-bold ${isActive(to) ? 'text-blue-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{children}</span>
        {isActive(to) && <div className="ml-auto w-1.5 h-1.5 bg-blue-900 rounded-full"></div>}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 transform rotate-3">
          <Layout size={24} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-blue-900 leading-none tracking-tight font-manrope">Tómbola</h1>
          <p className="text-[11px] font-bold text-slate-400 mt-1 tracking-tighter uppercase font-inter">ADMIN PORTAL</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto pt-2 pb-10">
        <SidebarLink to="/dashboard" icon={Layout}>Dashboard</SidebarLink>
        <SidebarLink to="/editions" icon={Package}>Ediciones</SidebarLink>
        <SidebarLink to="/bingoCards" icon={FileText}>Cartones</SidebarLink>
        <SidebarLink to="/sales" icon={ShoppingCart}>Ventas</SidebarLink>
        <SidebarLink to="/salesTarjetaUnica" icon={ShoppingCart}>Tarjeta Única</SidebarLink>
        <SidebarLink to="/allQuotas" icon={FileText}>Historial</SidebarLink>
        <SidebarLink to="/quotas" icon={Wallet}>Cuotas</SidebarLink>
        <SidebarLink to="/clients" icon={CheckCircle}>Asociados</SidebarLink>
        <SidebarLink to="/sellers" icon={Briefcase}>Vendedores</SidebarLink>
        <SidebarLink to="/sellerPayments" icon={Wallet}>Pagos</SidebarLink>
        <SidebarLink to="/bingoCardStatus" icon={Wallet}>Estado Bingo</SidebarLink>
        <SidebarLink to="/draws" icon={Calendar}>Sorteos</SidebarLink>

        {user?.roles === 'Administrador' && (
          <div className="pt-4 mt-4 border-t border-slate-50">
            <SidebarLink to="/users" icon={Users}>Usuarios</SidebarLink>
          </div>
        )}
      </nav>

      <div className="p-4 bg-slate-50/50 mt-auto border-t border-slate-100">
        <SidebarLink to="/profile" icon={Settings}>Ajustes</SidebarLink>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all group w-full text-left"
        >
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-red-100 group-hover:text-red-600">
            <LogOut size={18} />
          </div>
          <span className="text-[13px] font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


