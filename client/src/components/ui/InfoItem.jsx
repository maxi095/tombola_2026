/**
 * InfoItem - Elite Technical Information Molecule
 * Estándar 2026: Icono en caja suave + Etiqueta superior + Valor resaltado.
 * 
 * @param {Object} props
 * @param {React.ElementType} props.icon - Lucide Icon component
 * @param {string} props.label - Tiny uppercase label
 * @param {React.ReactNode} props.children - Component value (string, badge, etc.)
 * @param {string} props.className - Additional classes
 */
function InfoItem({ icon: Icon, label, children, className = "" }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100/50 shadow-sm transition-all hover:text-primary hover:bg-white hover:shadow-md">
        {Icon && <Icon size={14} />}
      </div>
      <div className="flex flex-col overflow-hidden">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 whitespace-nowrap">
          {label}
        </p>
        <div className="text-xs font-bold text-primary truncate">
          {children}
        </div>
      </div>
    </div>
  );
}

export default InfoItem;
