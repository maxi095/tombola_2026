import { Toaster } from "sonner";
import { useLocation } from "react-router-dom";

/**
 * Toast - Host de Notificaciones 2026 (Sonner)
 * Apilable, deslizable en móvil y con adaptación automática de tema según portal.
 */
export default function Toast() {
  const location = useLocation();
  const isDarkRoute =
    location.pathname === "/" ||
    location.pathname.startsWith("/vendedor") ||
    location.pathname.startsWith("/directiva");

  return (
    <Toaster
      position="top-right"
      theme={isDarkRoute ? "dark" : "light"}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          zIndex: 150,
          borderRadius: "16px",
          fontFamily: "Inter, sans-serif",
        },
      }}
    />
  );
}
