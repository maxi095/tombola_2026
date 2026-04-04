import Card from "./Card";

/**
 * KPICard - Elite Dashboard Metric Atom
 * Estándar 2026: Barra lateral de color + Icono en caja + Valor Manrope.
 * 
 * @param {Object} props
 * @param {React.ElementType} props.icon - Lucide Icon component
 * @param {string} props.label - Tiny uppercase label
 * @param {string} props.value - Main metric value
 * @param {string} props.variant - 'primary' | 'success' | 'danger' | 'slate'
 * @param {string} props.className - Additional classes
 */
function KPICard({ icon: Icon, label, value, variant = 'primary', className = "" }) {

  const variants = {
    primary: {
      border: 'border-l-primary',
      bg: 'bg-primary/10',
      text: 'text-primary'
    },
    success: {
      border: 'border-l-green-500',
      bg: 'bg-green-500/10',
      text: 'text-green-600'
    },
    danger: {
      border: 'border-l-red-500',
      bg: 'bg-red-500/10',
      text: 'text-red-600'
    },
    slate: {
      border: 'border-l-slate-300',
      bg: 'bg-slate-100',
      text: 'text-slate-400'
    }
  };

  const style = variants[variant] || variants.primary;

  return (
    <Card
      variant="glass"
      className={`border-l-4 ${style.border} py-4 hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center ${style.text} shadow-inner shrink-0`}>
          {Icon && <Icon size={20} />}
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 truncate whitespace-nowrap">
            {label}
          </p>
          <h3 className={`text-xl font-black font-manrope leading-none truncate ${style.text}`}>
            {value}
          </h3>
        </div>
      </div>
    </Card>
  );
}

export default KPICard;
