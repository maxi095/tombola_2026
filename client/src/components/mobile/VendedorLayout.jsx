import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVendedor } from '../../context/VendedorContext';
import { BottomNav } from './BottomNav';
import ConfirmModal from '../ui/ConfirmModal';
import { LogOut, User as UserIcon, Calendar } from 'lucide-react';
import logoNob from '../../assets/images/logo_nob.png';

export const VendedorLayout = () => {
    const { user, logout } = useAuth();
    const { editions, selectedEditionId, changeEdition, summary } = useVendedor();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleConfirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-red-500 selection:text-white">
            {/* Header móvil superior */}
            <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between safe-area-inset-top">
                <div className="flex items-center space-x-2.5">
                    <img
                        src={logoNob}
                        alt="Club Atlético Newell's Old Boys"
                        className="w-8 h-8 object-contain"
                    />
                    <div>
                        <h1 className="text-sm font-bold text-white leading-tight">
                            Tómbola <span className="text-red-500">NOB</span>
                        </h1>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <UserIcon className="w-3 h-3 text-red-400" />
                            <span className="truncate max-w-[130px] font-medium">
                                {summary?.seller?.name || user?.username || 'Vendedor'}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Selector global de Edición para el vendedor */}
                    {editions && editions.length > 0 ? (
                        <div className="relative">
                            <select
                                value={selectedEditionId}
                                onChange={(e) => changeEdition(e.target.value)}
                                className="bg-slate-800/90 border border-slate-700 text-[11px] font-bold text-red-400 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-red-500 shadow-sm cursor-pointer"
                                title="Cambiar edición de consulta"
                            >
                                {editions.map((ed) => (
                                    <option key={ed._id || ed.id} value={ed._id || ed.id}>
                                        {ed.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <span className="text-[11px] font-bold text-red-500 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded-lg">
                            {summary?.edition?.name || '2026'}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(true)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 active:bg-slate-700 transition-colors"
                        title="Cerrar sesión"
                        aria-label="Cerrar sesión"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Contenido principal móvil */}
            <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-24 overflow-x-hidden">
                <Outlet />
            </main>

            {/* Barra de navegación inferior */}
            <BottomNav />

            {/* Modal de confirmación para cerrar sesión */}
            <ConfirmModal
                isOpen={showLogoutConfirm}
                title="Cerrar sesión"
                message="¿Estás seguro de que deseas salir del portal móvil de vendedor?"
                confirmText="Cerrar sesión"
                cancelText="Volver"
                variant="danger"
                onConfirm={handleConfirmLogout}
                onClose={() => setShowLogoutConfirm(false)}
            />
        </div>
    );
};
