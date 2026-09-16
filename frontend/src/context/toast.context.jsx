import { createContext, useContext, useState, useCallback } from "react";
import { X, Info, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] p-6 w-full max-w-sm flex flex-col gap-3 pointer-events-none" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isError = toast.type === 'error';
            const isSuccess = toast.type === 'success';
            
            return (
              <motion.div 
                key={toast.id} 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-[var(--shadow-level-3)] bg-canvas ${isError ? 'border-error/20' : isSuccess ? 'border-success/20' : 'border-hairline'}`}
              >
                <div className="shrink-0 mt-0.5">
                  {isError ? (
                    <WarningCircle weight="fill" className="w-5 h-5 text-error" />
                  ) : isSuccess ? (
                    <CheckCircle weight="fill" className="w-5 h-5 text-success" />
                  ) : (
                    <Info weight="fill" className="w-5 h-5 text-link" />
                  )}
                </div>
                <div className="flex-1 text-sm font-medium text-ink leading-snug">
                  {toast.message}
                </div>
                <button
                  className="shrink-0 text-mute hover:text-ink hover:bg-canvas-soft rounded p-1 transition-colors -m-1"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
