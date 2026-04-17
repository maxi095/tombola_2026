import { useState } from "react";

/**
 * Tooltip Elite 2026 — Componente reutilizable de baja fricción.
 *
 * @param {ReactNode} children — Elemento que dispara el tooltip al hacer hover.
 * @param {string} text — Texto del tooltip.
 * @param {"top"|"bottom"|"left"|"right"} position — Posición del tooltip (default: "top").
 * @param {string} className — Clases extra para el contenedor raíz.
 *
 * @example
 * <Tooltip text="Descargar Recibo">
 *   <Button icon={FileDown} variant="ghost" size="sm" />
 * </Tooltip>
 */
function Tooltip({ children, text, position = "top", className = "" }) {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-slate-800",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-800",
    left: "left-full top-1/2 -translate-y-1/2 border-l-slate-800",
    right: "right-full top-1/2 -translate-y-1/2 border-r-slate-800",
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && text && (
        <div
          className={`
            absolute ${positionClasses[position]} z-[200]
            pointer-events-none
            animate-in fade-in zoom-in-95 duration-150
          `}
        >
          <div className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.12em] whitespace-nowrap px-2.5 py-1.5 rounded-lg shadow-xl">
            {text}
          </div>
          <div
            className={`absolute border-4 border-transparent ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
