import { Drawer as VaulDrawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "../../libs/cn";

/**
 * MobileDrawer - Bottom Sheet Nativo 2026 (Vaul)
 * Deslizable hacia abajo con el pulgar, safe-area real y focus trap accesible.
 */
export default function MobileDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <VaulDrawer.Root open={Boolean(isOpen)} onOpenChange={(open) => !open && onClose?.()}>
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm" />
        <VaulDrawer.Content
          aria-describedby={undefined}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-[100] mt-24 flex max-h-[92vh] flex-col rounded-t-3xl border-t border-slate-800 bg-slate-900 text-slate-100 shadow-2xl outline-none max-w-md mx-auto",
            className
          )}
        >
          {/* Pill de arrastre táctil */}
          <div className="mx-auto mt-3 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-slate-700" />

          <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-slate-800">
            <div>
              <VaulDrawer.Title className="text-base font-black text-white font-manrope">
                {title}
              </VaulDrawer.Title>
              {subtitle && (
                <VaulDrawer.Description className="text-xs text-slate-400">
                  {subtitle}
                </VaulDrawer.Description>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 pb-safe custom-scrollbar">
            {children}
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
