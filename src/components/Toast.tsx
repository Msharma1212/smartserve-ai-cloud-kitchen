import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastItem {
  id: string;
  text: string;
  type: "success" | "info" | "error";
}

interface Props {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none font-sans" id="toast-layer-hub">
      <AnimatePresence>
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 25, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              transition={{ type: "spring", damping: 18, stiffness: 350 }}
              className={`p-4 rounded-2xl shadow-xl flex items-start gap-3 border pointer-events-auto bg-white ${
                isSuccess
                  ? "border-emerald-100 shadow-emerald-505 shadow-emerald-100/10"
                  : isError
                  ? "border-rose-100 shadow-rose-100/10"
                  : "border-slate-100 shadow-slate-150/10"
              }`}
            >
              {/* Icon Container */}
              <div className="shrink-0 mt-0.5">
                {isSuccess ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                ) : isError ? (
                  <div className="w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <Info className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Text Body */}
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800 leading-normal">
                  {t.text}
                </p>
              </div>

              {/* Dismiss Trigger */}
              <button
                type="button"
                onClick={() => onRemove(t.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
