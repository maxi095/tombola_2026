import { Ticket, User as UserIcon, MapPin } from "lucide-react";
import { formatCurrency } from "../../libs/formatters";

/**
 * Table Components - Premium 2026 v3.5 (Atomic Framework)
 * Unidades atómicas para la construcción de grillas de datos profesionales.
 */

export const Table = ({ children, className = "" }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full text-left border-collapse min-w-[800px]">
      {children}
    </table>
  </div>
);

export const THead = ({ children }) => (
  <thead>
    <tr className="bg-slate-50/50 border-b border-slate-100">
      {children}
    </tr>
  </thead>
);

export const TBody = ({ children, striped = true }) => (
  <tbody className={`divide-y divide-slate-50 ${striped ? "[&_tr:nth-child(even)]:bg-slate-50/30" : ""}`}>
    {children}
  </tbody>
);

export const TR = ({ children, className = "" }) => (
  <tr className={`hover:bg-slate-50/50 transition-colors duration-200 group/row ${className}`}>
    {children}
  </tr>
);

export const TH = ({ children, className = "", align = "left" }) => (
  <th className={`px-4 py-4 text-[11px] font-black text-muted uppercase tracking-[0.15em] bg-slate-50/50 text-${align} ${className}`}>
    {children}
  </th>
);

export const TD = ({ children, className = "", align = "left" }) => (
  <td className={`px-4 py-4 text-sm text-${align} ${className}`}>
    {children}
  </td>
);

/**
 * ÁTOMOS DE CELDA ESPECIALIZADOS ✨💎
 */

// 📋 Celda de Operación (Nro de Venta, Balance, etc.) ✨
export const OperationCell = ({ number, main, sub, icon: Icon }) => (
  <TD>
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
          <Icon size={14} />
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-black text-slate-700 leading-none mb-0.5">
          {main || (number ? `#${number}` : "S/N")}
        </span>
        {sub && (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            {sub}
          </span>
        )}
      </div>
    </div>
  </TD>
);

// 🎫 Celda de Stock/Cartón (Indigo Style)
export const StockCell = ({ main, sub }) => (
  <TD>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
        <Ticket size={14} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-black text-slate-700 leading-none mb-0.5">{main}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{sub}</span>
      </div>
    </div>
  </TD>
);

// 👤 Celda de Usuario (Vendedor / Asociado)
export const UserCell = ({ name, sub, variant = "primary" }) => (
  <TD>
    <div className="flex flex-col gap-0.5 max-w-[200px]">
      <div className="flex items-start gap-2">
        <UserIcon size={12} className={`${variant === 'primary' ? 'text-primary' : 'text-slate-300'} mt-0.5 shrink-0 opacity-40`} />
        <span className={`text-xs font-black leading-tight uppercase ${variant === 'primary' ? 'text-primary' : 'text-slate-600'}`}>
          {name}
        </span>
      </div>
      {sub && (
        <div className="flex items-center gap-2 pl-4">
          <MapPin size={10} className="text-slate-300 shrink-0" />
          <span className="text-[10px] font-bold text-slate-400 truncate">{sub}</span>
        </div>
      )}
    </div>
  </TD>
);

// 💸 Celda de Dinero v19.5 (Premium Audit) ✨🏹
export const AmountCell = ({ amount, value, status = "success", bold = false }) => {
  const amountValue = amount !== undefined ? amount : value;
  
  const variants = {
    success: "text-emerald-600 bg-emerald-50/10",
    danger: "text-rose-600 bg-rose-50/10",
    warning: "text-amber-600 bg-amber-50/10",
    info: "text-blue-600 bg-blue-50/10",
    secondary: "text-slate-500 bg-slate-50/10",
    primary: "text-primary bg-primary/10"
  };

  return (
    <TD className={`text-right ${bold ? 'font-black' : 'font-bold'} text-xs ${variants[status] || variants.success}`}>
      {formatCurrency(amountValue)}
    </TD>
  );
};
