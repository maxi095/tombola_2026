import { createContext, useContext, useState, useCallback } from "react";

const FeedbackContext = createContext();

/**
 * FeedbackProvider - Motor de notificaciones Premium 2026
 * Gestiona estados de Toasts y Diálogos de forma centralizada.
 */
export const FeedbackProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  /**
   * showToast - Lanza una notificación flotante
   * @param {string} message - Texto a mostrar
   * @param {'success' | 'error' | 'info'} type - Estética del mensaje
   */
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    // Auto-cierre tras 4 segundos
    setTimeout(() => setToast(null), 4000);
  }, []);

  const hideToast = () => setToast(null);

  return (
    <FeedbackContext.Provider value={{ showToast, hideToast, toast }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback debe usarse dentro de FeedbackProvider");
  return context;
};
