"use client";
import { Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
interface ActionToastProps {
  message: string | null;
}
export function ActionToast({ message }: ActionToastProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-moss/20 bg-card px-4 py-2 text-sm font-semibold text-moss shadow-lg"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
