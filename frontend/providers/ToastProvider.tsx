"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/utils/cn";

export type ToastType = "success" | "error" | "warning" | "info";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      
      {/* Toast container overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 border shadow-md font-mono text-xs",
                "nothing-glass border-foreground/10 text-foreground"
              )}
            >
              {/* Type Icons */}
              <span className="mt-0.5 shrink-0">
                {t.type === "success" && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                {t.type === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                {t.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                {t.type === "info" && <Info className="h-4 w-4 text-foreground/50" />}
              </span>

              {/* Message */}
              <div className="flex-1 leading-relaxed">{t.message}</div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(t.id)}
                className="text-foreground/40 hover:text-foreground hover:bg-foreground/5 p-0.5 transition-colors"
                aria-label="Close notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              
              {/* Nothing accent indicator */}
              <div className="absolute top-0 left-0 w-0.5 h-full bg-accent" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
