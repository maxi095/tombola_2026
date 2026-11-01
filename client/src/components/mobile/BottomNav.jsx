import { NavLink } from 'react-router-dom';
import { Home, Ticket, PlusCircle, CreditCard } from 'lucide-react';

export const BottomNav = () => {
    const navItems = [
        {
            to: '/vendedor',
            end: true,
            label: 'Inicio',
            icon: Home,
        },
        {
            to: '/vendedor/cartones',
            end: false,
            label: 'Cartones',
            icon: Ticket,
        },
        {
            to: '/vendedor/vender',
            end: false,
            label: 'Vender',
            icon: PlusCircle,
            isPrimary: true,
        },
        {
            to: '/vendedor/cuotas',
            end: false,
            label: 'Cuotas',
            icon: CreditCard,
        },
    ];

    return (
        <nav
            aria-label="Navegación móvil"
            className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-300 pb-safe"
        >
            <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    if (item.isPrimary) {
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95 ${
                                        isActive ? 'text-red-500' : 'text-white'
                                    }`
                                }
                            >
                                <div className="w-12 h-12 rounded-full bg-red-600 shadow-lg shadow-red-900/50 flex items-center justify-center text-white border-2 border-slate-900">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-[11px] font-semibold mt-1 text-slate-200">
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    }

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center py-1 px-3 min-w-[64px] min-h-[44px] rounded-lg transition-colors text-xs ${
                                    isActive
                                        ? 'text-red-500 font-semibold'
                                        : 'text-slate-400 hover:text-slate-200 active:text-white'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 mb-0.5" />
                            <span className="text-[11px]">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};
