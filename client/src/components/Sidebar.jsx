import React, { useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLayout } from "../context/LayoutContext";
import { Link, useLocation } from "react-router-dom";
import {
  Layout,
  Package,
  ShoppingCart,
  Calendar,
  Users,
  Settings,
  LogOut,
  FileText,
  CheckCircle,
  Briefcase,
  Wallet,
  TrendingUp
} from "lucide-react";

const SidebarLink = ({ to, icon: Icon, children, active, isVisuallyExpanded, isSidebarCollapsed, isSidebarHovered, onNavigate }) => (
  <Link
    to={to}
    onClick={onNavigate}
    title={isSidebarCollapsed && !isSidebarHovered ? children : ""}
    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 group ${active
      ? 'bg-blue-50 text-blue-900 shadow-sm shadow-blue-900/5'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
  >
    <div className={`p-1 rounded-lg transition-colors shrink-0 ${active ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-900'}`}>
      <Icon size={16} />
    </div>
    {isVisuallyExpanded && (
      <div className="flex-1 flex items-center justify-between min-w-0">
        <span className={`text-[13px] font-bold truncate ${active ? 'text-blue-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{children}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-900 rounded-full shrink-0" />}
      </div>
    )}
  </Link>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isSidebarCollapsed, isSidebarHovered, setSidebarHovered } = useLayout();
  const location = useLocation();
  const hoverTimeout = useRef(null);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (isSidebarCollapsed) {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      hoverTimeout.current = setTimeout(() => {
        setSidebarHovered(true);
      }, 200);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setSidebarHovered(false);
  };

  const handleNavigate = () => setSidebarHovered(false);

  const isVisuallyExpanded = !isSidebarCollapsed || isSidebarHovered;

  const linkSharedProps = {
    isVisuallyExpanded,
    isSidebarCollapsed,
    isSidebarHovered,
    onNavigate: handleNavigate,
  };

  return (
    <div
      className="flex flex-col h-screen bg-white transition-all duration-300 ease-in-out select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`px-4 py-4 flex items-center transition-all duration-300 ${!isVisuallyExpanded ? 'justify-center border-b border-slate-50 mb-2' : 'gap-3 px-6'}`}>
        <div className="w-10 h-10 bg-blue-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 transform rotate-3 shrink-0">
          <Layout size={24} />
        </div>
        {isVisuallyExpanded && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-lg font-extrabold text-blue-900 leading-none tracking-tight font-manrope">Tómbola</h1>
            <p className="text-[11px] font-bold text-slate-400 mt-1 tracking-tighter uppercase font-inter">Portal Admin</p>
          </div>
        )}
      </div>

      <nav className={`flex-1 space-y-0.5 overflow-y-auto pt-2 pb-10 transition-all duration-300 ${!isVisuallyExpanded ? 'px-2' : 'px-4'}`}>
        <SidebarLink to="/dashboard" icon={Layout} active={isActive("/dashboard")} {...linkSharedProps}>Dashboard</SidebarLink>
        <SidebarLink to="/editions" icon={Package} active={isActive("/editions")} {...linkSharedProps}>Ediciones</SidebarLink>
        <SidebarLink to="/bingoCards" icon={FileText} active={isActive("/bingoCards")} {...linkSharedProps}>Cartones</SidebarLink>
        <SidebarLink to="/sales" icon={ShoppingCart} active={isActive("/sales")} {...linkSharedProps}>Ventas</SidebarLink>
        <SidebarLink to="/salesTarjetaUnica" icon={ShoppingCart} active={isActive("/salesTarjetaUnica")} {...linkSharedProps}>Tarjeta Única</SidebarLink>
        <SidebarLink to="/allQuotas" icon={FileText} active={isActive("/allQuotas")} {...linkSharedProps}>Historial</SidebarLink>
        <SidebarLink to="/quotas" icon={Wallet} active={isActive("/quotas")} {...linkSharedProps}>Cuotas Vencidas</SidebarLink>
        <SidebarLink to="/clients" icon={CheckCircle} active={isActive("/clients")} {...linkSharedProps}>Asociados</SidebarLink>
        <SidebarLink to="/sellers" icon={Briefcase} active={isActive("/sellers")} {...linkSharedProps}>Vendedores</SidebarLink>
        <SidebarLink to="/sellerPayments" icon={Wallet} active={isActive("/sellerPayments")} {...linkSharedProps}>Pagos</SidebarLink>
        <SidebarLink to="/balance" icon={TrendingUp} active={isActive("/balance")} {...linkSharedProps}>Balance</SidebarLink>
        <SidebarLink to="/bingoCardStatus" icon={Wallet} active={isActive("/bingoCardStatus")} {...linkSharedProps}>Estado Bingo</SidebarLink>
        <SidebarLink to="/draws" icon={Calendar} active={isActive("/draws")} {...linkSharedProps}>Sorteos</SidebarLink>

        {user?.roles === 'Administrador' && (
          <div className={`pt-2 mt-2 border-t border-slate-50 ${!isVisuallyExpanded ? 'px-0' : ''}`}>
            <SidebarLink to="/users" icon={Users} active={isActive("/users")} {...linkSharedProps}>Usuarios</SidebarLink>
          </div>
        )}
      </nav>

      <div className={`p-3 bg-slate-50/50 mt-auto border-t border-slate-100 transition-all duration-300 ${!isVisuallyExpanded ? 'px-2' : 'px-4'}`}>
        {isVisuallyExpanded ? (
          <SidebarLink to="/profile" icon={Settings} active={isActive("/profile")} {...linkSharedProps}>Ajustes</SidebarLink>
        ) : (
          <Link to="/profile" title="Ajustes" className="flex items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 mb-1">
            <Settings size={18} />
          </Link>
        )}
        <button
          type="button"
          onClick={logout}
          title={!isVisuallyExpanded ? "Cerrar Sesión" : ""}
          className={`flex items-center gap-2.5 py-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all group w-full text-left ${!isVisuallyExpanded ? 'px-2 items-center justify-center' : 'px-4'}`}
        >
          <div className="p-1 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-red-100 group-hover:text-red-600 shrink-0">
            <LogOut size={16} />
          </div>
          {isVisuallyExpanded && (
            <span className="text-[13px] font-bold">Cerrar Sesión</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
