import React, { useEffect } from "react";
import { useToastStore } from "../../stores/toastStore";
import { clsx } from "clsx";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Toaster = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={clsx("rounded-lg p-4 shadow-md flex items-start gap-3", {
              "bg-success-50 text-success-800 dark:bg-success-900 dark:text-success-200":
                toast.type === "success",
              "bg-error-50 text-error-800 dark:bg-error-900 dark:text-error-200":
                toast.type === "error",
              "bg-warning-50 text-warning-800 dark:bg-warning-900 dark:text-warning-200":
                toast.type === "warning",
              "bg-secondary-50 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200":
                toast.type === "info",
            })}
          >
            <div className="flex-shrink-0 pt-0.5">
              {toast.type === "success" && (
                <CheckCircle className="h-5 w-5 text-success-500 dark:text-success-400" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="h-5 w-5 text-error-500 dark:text-error-400" />
              )}
              {toast.type === "warning" && (
                <AlertTriangle className="h-5 w-5 text-warning-500 dark:text-warning-400" />
              )}
              {toast.type === "info" && (
                <Info className="h-5 w-5 text-secondary-500 dark:text-secondary-400" />
              )}
            </div>

            <div className="flex-1 pt-0.5">
              <h3 className="font-medium">{toast.title}</h3>
              {toast.description && (
                <p className="text-sm opacity-90 mt-1">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-1 mt-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-gray-500 rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
