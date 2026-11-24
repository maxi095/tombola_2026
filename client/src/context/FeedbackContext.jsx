import { createContext, useContext, useCallback, useMemo } from "react";
import { toast as sonnerToast } from "sonner";

const FeedbackContext = createContext();

/**
 * FeedbackProvider - Motor de notificaciones 2026 (Sonner)
 * Mantiene 100% retrocompatibilidad con useFeedback().showToast(msg, type).
 */
export const FeedbackProvider = ({ children }) => {
  const showToast = useCallback((message, type = "success") => {
    if (!message) return;

    if (type === "error" || type === "danger") {
      sonnerToast.error(message);
    } else if (type === "info") {
      sonnerToast.info(message);
    } else if (type === "warning") {
      sonnerToast.warning(message);
    } else {
      sonnerToast.success(message);
    }
  }, []);

  const hideToast = useCallback(() => {
    sonnerToast.dismiss();
  }, []);

  const value = useMemo(
    () => ({ showToast, hideToast, toast: null }),
    [showToast, hideToast]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback debe usarse dentro de FeedbackProvider");
  return context;
};
