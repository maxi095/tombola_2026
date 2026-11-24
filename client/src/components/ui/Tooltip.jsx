import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../libs/cn";

/**
 * Tooltip 2026 (Radix UI Tooltip / shadcn pattern)
 * Renderiza en Portal (jamás se recorta dentro de tablas o tarjetas overflow-hidden).
 */
function Tooltip({ children, text, position = "top", className = "" }) {
  if (!text) return children;

  return (
    <TooltipPrimitive.Provider delayDuration={180}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span className={cn("inline-flex items-center", className)}>
            {children}
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={position}
            sideOffset={6}
            className="z-[200] rounded-lg bg-slate-800 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-xl animate-in fade-in-0 zoom-in-95 duration-150"
          >
            {text}
            <TooltipPrimitive.Arrow className="fill-slate-800" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export default Tooltip;
