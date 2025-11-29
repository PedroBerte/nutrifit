import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface UpdateNotificationProps {
  isOpen: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateNotification({
  isOpen,
  onUpdate,
  onDismiss,
}: UpdateNotificationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <div className="relative overflow-hidden rounded-2xl border border-neutral-dark-04 bg-gradient-to-br from-neutral-dark-02 to-neutral-dark-01 p-6 shadow-2xl backdrop-blur-sm">
            {/* Animated gradient background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary animate-gradient-x" />
            </div>

            {/* Close button */}
            <button
              onClick={onDismiss}
              className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-light-02 transition-colors hover:bg-neutral-dark-03 hover:text-neutral-light-01"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="relative flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary opacity-20" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/30">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 space-y-2 pt-1">
                <div className="space-y-1">
                  <h3 className="font-semibold text-neutral-light-01">
                    Nova versão disponível! 🎉
                  </h3>
                  <p className="text-sm text-neutral-light-02">
                    Atualize agora para aproveitar as melhorias e novos
                    recursos.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={onUpdate}
                    size="sm"
                    className="gap-2 bg-primary font-medium text-neutral-dark-01 hover:bg-primary/90"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Atualizar agora
                  </Button>
                  <Button
                    onClick={onDismiss}
                    size="sm"
                    variant="ghost"
                    className="text-neutral-light-02 hover:bg-neutral-dark-03 hover:text-neutral-light-01"
                  >
                    Mais tarde
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
