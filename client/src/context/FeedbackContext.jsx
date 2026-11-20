import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from "react";

const FeedbackContext = createContext();

/**
 * FeedbackProvider - Motor de notificaciones centralizado
 * Gestiona Toasts con control seguro de timers (sin race conditions ni memory leaks).
 */
export const FeedbackProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const clearPendingTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearPendingTimer();
    setToast(null);
  }, [clearPendingTimer]);

  const showToast = useCallback((message, type = "success") => {
    clearPendingTimer();
    setToast({ message, type });
    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 4000);
  }, [clearPendingTimer]);

  useEffect(() => {
    return () => clearPendingTimer();
  }, [clearPendingTimer]);

  const value = useMemo(
    () => ({ showToast, hideToast, toast }),
    [showToast, hideToast, toast]
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
