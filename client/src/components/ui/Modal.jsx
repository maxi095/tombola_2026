import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../libs/cn";

/**
 * Modal - Diálogo Accesible 2026 (Radix UI Dialog / shadcn pattern)
 * Portal nativo, focus trap, cierre por Escape, scroll-lock y soporte Light/Dark.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  variant = "default",
  theme = "light",
  children,
  footer,
  maxWidth = "max-w-lg",
}) {
  const isDark = theme === "dark";

  const getHeaderStyles = () => {
    if (isDark) {
      if (variant === "primary") return "bg-red-600 text-white";
      if (variant === "warning") return "bg-amber-600 text-white";
      return "bg-slate-900 text-white border-b border-slate-800";
    }
    switch (variant) {
      case "primary":
        return "bg-primary text-white";
      case "warning":
        return "bg-amber-500 text-white shadow-lg shadow-amber-500/10";
      case "default":
        return "bg-slate-50/50 text-slate-800 border-b border-slate-100";
      default:
        return "bg-white text-slate-800 border-b border-slate-100";
    }
  };

  const getIconStyles = () => {
    if (isDark) {
      return variant === "default"
        ? "bg-red-600/20 text-red-400 border border-red-500/30"
        : "bg-white/10 text-white";
    }
    switch (variant) {
      case "primary":
        return "bg-white/10";
      case "warning":
        return "bg-white/10";
      case "default":
        return "bg-primary text-white shadow-lg shadow-primary/10";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  const getCloseBtnStyles = () => {
    if (isDark) {
      return "bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700";
    }
    return variant === "default"
      ? "bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100"
      : "bg-white/10 hover:bg-white/20 text-white";
  };

  return (
    <Dialog.Root open={Boolean(isOpen)} onOpenChange={(open) => !open && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-[100] backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            isDark ? "bg-slate-950/80" : "bg-slate-900/40"
          )}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed left-1/2 top-1/2 z-[100] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[32px] shadow-2xl overflow-hidden outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200",
            maxWidth,
            isDark
              ? "bg-slate-900 border border-slate-800 text-slate-100"
              : "bg-white text-slate-800"
          )}
        >
          <div className={cn("relative px-6 sm:px-8 py-6 sm:py-7", getHeaderStyles())}>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Cerrar"
                className={cn(
                  "absolute top-5 right-5 p-2 rounded-xl transition-all",
                  getCloseBtnStyles()
                )}
              >
                <X size={20} />
              </button>
            </Dialog.Close>

            <div className="flex items-center gap-4 pr-10">
              {Icon && (
                <div className={cn("p-3 rounded-2xl", getIconStyles())}>
                  <Icon size={24} />
                </div>
              )}
              <div>
                <Dialog.Title
                  className={cn(
                    "text-xl font-black tracking-tight font-manrope leading-none",
                    !isDark && variant === "default" ? "text-primary" : "text-white"
                  )}
                >
                  {title}
                </Dialog.Title>
                {subtitle && (
                  <Dialog.Description
                    className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] mt-1.5",
                      isDark
                        ? "text-slate-400"
                        : variant === "default"
                        ? "text-slate-400"
                        : "text-white/70"
                    )}
                  >
                    {subtitle}
                  </Dialog.Description>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6 sm:py-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            {children}
          </div>

          {footer && (
            <div
              className={cn(
                "px-6 sm:px-8 py-5 flex items-center justify-end gap-3 border-t",
                isDark
                  ? "bg-slate-950/60 border-slate-800"
                  : "bg-slate-50/50 border-slate-100"
              )}
            >
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
