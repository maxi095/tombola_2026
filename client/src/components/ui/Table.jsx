import { Ticket, User as UserIcon, MapPin } from "lucide-react";
import { formatCurrency } from "../../libs/formatters";
import { cn } from "../../libs/cn";

/**
 * Table Components - Standard 2026 (Atomic Framework)
 * Unidades atómicas para grillas de datos con soporte JIT-safe, tailwind-merge (cn) y propagación de props.
 */

const ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export const Table = ({ children, className = "", minWidth = "min-w-[800px]", ...props }) => (
  <div className={cn("overflow-x-auto", className)} {...props}>
    <table className={cn("w-full text-left border-collapse", minWidth)}>
      {children}
    </table>
  </div>
);

export const THead = ({ children, ...props }) => (
  <thead {...props}>
    <tr className="bg-slate-50/50 border-b border-slate-100">
      {children}
    </tr>
  </thead>
);

export const TBody = ({ children, striped = true, ...props }) => (
  <tbody className={cn("divide-y divide-slate-50", striped && "[&_tr:nth-child(even)]:bg-slate-50/30")} {...props}>
    {children}
  </tbody>
);

export const TR = ({ children, className = "", ...props }) => (
  <tr className={cn("hover:bg-slate-50/50 transition-colors duration-200 group/row", className)} {...props}>
    {children}
  </tr>
);

export const TH = ({ children, className = "", align = "left", ...props }) => (
  <th
    className={cn(
      "px-4 py-4 text-[11px] font-black text-muted uppercase tracking-[0.15em] bg-slate-50/50",
      ALIGN_CLASSES[align] || ALIGN_CLASSES.left,
      className
    )}
    {...props}
  >
    {children}
  </th>
);

export const TD = ({ children, className = "", align = "left", ...props }) => (
  <td
    className={cn("px-4 py-4 text-sm", ALIGN_CLASSES[align] || ALIGN_CLASSES.left, className)}
    {...props}
  >
    {children}
  </td>
);

export const OperationCell = ({ number, main, sub, icon: Icon, className = "", ...props }) => (
  <TD className={className} {...props}>
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
          <Icon size={14} />
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-black text-slate-700 leading-none mb-0.5 tabular-nums">
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

export const StockCell = ({ main, sub, className = "", ...props }) => (
  <TD className={className} {...props}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
        <Ticket size={14} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-black text-slate-700 leading-none mb-0.5 tabular-nums">{main}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{sub}</span>
      </div>
    </div>
  </TD>
);

export const UserCell = ({ name, sub, variant = "primary", className = "", ...props }) => (
  <TD className={className} {...props}>
    <div className="flex flex-col gap-0.5 max-w-[200px]">
      <div className="flex items-start gap-2">
        <UserIcon size={12} className={cn("mt-0.5 shrink-0 opacity-40", variant === "primary" ? "text-primary" : "text-slate-300")} />
        <span className={cn("text-xs font-black leading-tight uppercase", variant === "primary" ? "text-primary" : "text-slate-600")}>
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

export const AmountCell = ({ amount, value, status = "success", bold = false, className = "", ...props }) => {
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
    <TD
      align="right"
      className={cn(
        bold ? "font-black" : "font-bold",
        "text-xs tabular-nums",
        variants[status] || variants.success,
        className
      )}
      {...props}
    >
      {formatCurrency(amountValue)}
    </TD>
  );
};
