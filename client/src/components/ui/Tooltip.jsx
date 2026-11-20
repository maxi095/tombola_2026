import { useState, useId } from "react";
import { cn } from "../../libs/cn";

/**
 * Tooltip Standard 2026 — Accesible por mouse y foco de teclado.
 */
function Tooltip({ children, text, position = "top", className = "" }) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

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
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      aria-describedby={visible && text ? tooltipId : undefined}
    >
      {children}

      {visible && text && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            "absolute z-[200] pointer-events-none animate-in fade-in zoom-in-95 duration-150",
            positionClasses[position] || positionClasses.top
          )}
        >
          <div className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.12em] whitespace-nowrap px-2.5 py-1.5 rounded-lg shadow-xl">
            {text}
          </div>
          <div
            className={cn("absolute border-4 border-transparent", arrowClasses[position] || arrowClasses.top)}
          />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
