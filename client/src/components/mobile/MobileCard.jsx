export const MobileCard = ({
    children,
    className = '',
    onClick,
    variant = 'default', // 'default' | 'highlight' | 'danger'
}) => {
    const variantStyles = {
        default: 'bg-slate-800/90 border-slate-700/70 text-slate-100',
        highlight: 'bg-gradient-to-br from-slate-800 to-slate-900 border-red-500/40 text-white',
        danger: 'bg-red-950/30 border-red-800/40 text-slate-100',
    };

    return (
        <div
            onClick={onClick}
            className={`rounded-2xl border p-4 shadow-sm backdrop-blur-sm transition-all ${
                onClick ? 'cursor-pointer active:scale-[0.98]' : ''
            } ${variantStyles[variant] || variantStyles.default} ${className}`}
        >
            {children}
        </div>
    );
};
