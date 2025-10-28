import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-500/90",
    iconColor: "text-green-100",
    textColor: "text-white",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-500/90",
    iconColor: "text-red-100",
    textColor: "text-white",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-500/90",
    iconColor: "text-yellow-100",
    textColor: "text-white",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-500/90",
    iconColor: "text-blue-100",
    textColor: "text-white",
  },
};

export function Toast({
  id,
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95, marginTop: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1, marginTop: 8 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 min-w-[300px] max-w-md p-4 rounded-lg shadow-lg backdrop-blur-sm ${config.bgColor}`}
    >
      <Icon className={`size-5 flex-shrink-0 ${config.iconColor}`} />
      <p className={`flex-1 text-sm font-medium ${config.textColor}`}>
        {message}
      </p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Fechar"
      >
        <X className={`size-4 ${config.textColor}`} />
      </button>
    </motion.div>
  );
}
