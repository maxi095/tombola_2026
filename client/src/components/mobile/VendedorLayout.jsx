import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BottomNav } from './BottomNav';
import ConfirmModal from '../ui/ConfirmModal';
import { LogOut, User as UserIcon } from 'lucide-react';
import logoNob from '../../assets/images/logo_nob.png';

export const VendedorLayout = () => {
    const { user, logout } = useAuth();
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
            <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between safe-area-inset-top">
                <div className="flex items-center space-x-3">
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
                            <span className="truncate max-w-[150px] font-medium">
                                {user?.username || 'Vendedor'}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(true)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 active:bg-slate-700 transition-colors"
                        title="Cerrar sesión"
                        aria-label="Cerrar sesión"
                    >
                        <LogOut className="w-5 h-5" />
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
