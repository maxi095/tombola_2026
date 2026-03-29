import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Función mejorada para marcar como activo según coincidencia exacta
  const isActive = (path) => location.pathname === path;

  // Componente auxiliar con clase activa solo en coincidencia exacta
  const SidebarLink = ({ to, children }) => (
    <Link to={to} className={`sidebar-link ${isActive(to) ? 'active' : ''}`}>
      {children}
    </Link>
  );

  return (
    <div className="sidebar">
      {/*<div className="sidebar-header">
        <img src={logo} alt="Logo del Sistema" className="sidebar-logo" />
      </div>*/}

      <nav className="sidebar-nav">
        {/*<SidebarLink to="/profile">Perfil</SidebarLink>*/}

        {['Administrador', 'Vendedor'].includes(user.roles) && (
          <>
            <SidebarLink to="/dashboard">Dashboard</SidebarLink>
            <SidebarLink to="/editions">Ediciones</SidebarLink>
            <SidebarLink to="/bingoCards">Cartones</SidebarLink>
            <SidebarLink to="/sales">Ventas</SidebarLink>
            <SidebarLink to="/salesTarjetaUnica">Ventas Tarjeta única</SidebarLink>
            <SidebarLink to="/allQuotas">Historial de actividad</SidebarLink>
            <SidebarLink to="/quotas">Cuotas vencidas</SidebarLink>
            <SidebarLink to="/clients">Asociados</SidebarLink>
            <SidebarLink to="/sellers">Vendedores</SidebarLink>
            <SidebarLink to="/sellerPayments">Pagos de vendedores</SidebarLink>
            <SidebarLink to="/draws">Sorteos</SidebarLink>
            <a
              href="/bingoCardStatus"
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-link"
            >
              Estado de cartón
            </a>
          </>
        )}

        {user.roles === 'Administrador' && (
          <SidebarLink to="/users">Usuarios</SidebarLink>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
