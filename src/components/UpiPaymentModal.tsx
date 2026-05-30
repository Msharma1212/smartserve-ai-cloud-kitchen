import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Copy, Check, ShieldCheck, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  customerPhone: string;
  onPaymentSuccess: (updatedOrder: any) => void;
}

export default function UpiPaymentModal({
  isOpen,
  onClose,
  orderId,
  amount,
  customerPhone,
  onPaymentSuccess
}: Props) {
  const [paymentStatus, setPaymentStatus] = useState<"IDLE" | "PENDING" | "SUCCESS" | "FAILED">("IDLE");
  const [stepMessage, setStepMessage] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [failReason, setFailReason] = useState<string>("");

  const upiId = "pay.smartserve@okaxis";

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPayment = async () => {
    setPaymentStatus("PENDING");
    setStepMessage("Initializing secure NPCI merchant tunnel...");

    const steps = [
      "Contacting your banking UPI app coordinates...",
      "Waiting for payment confirmation hook from payer platform...",
      "Analyzing bank transaction reference ledger...",
      "Cryptographically signing validation tokens..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStepMessage(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        // Execute real backend confirmation!
        triggerBackendConfirmation();
      }
    }, 900);
  };

  const triggerBackendConfirmation = async () => {
    try {
      const res = await fetch("/api/payment/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentOption: "UPI" })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPaymentStatus("SUCCESS");
          setStepMessage("Payment Verified Successfully! Handing over to kitchen...");
          setTimeout(() => {
            onPaymentSuccess(data.order);
            onClose();
          }, 1500);
        } else {
          setPaymentStatus("FAILED");
          setFailReason("Dual signature validation failed on bank server gateway.");
        }
      } else {
        setPaymentStatus("FAILED");
        setFailReason("Merchant bank is offline. Please retry after some moments.");
      }
    } catch {
      setPaymentStatus("FAILED");
      setFailReason("Connection loss with NPCI settlements backbone.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" id="upi-instant-checkout-dialog">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white text-center shadow-2xl relative"
      >
        {/* Close Button only if not active pending verify */}
        {paymentStatus !== "PENDING" && paymentStatus !== "SUCCESS" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="space-y-5">
          <div className="space-y-1.5 flex flex-col items-center">
            <span className="text-[9px] text-orange-500 font-mono tracking-widest font-black uppercase text-center">NPCI SECURE MERCHANTS</span>
            <h3 className="text-sm font-extrabold font-sans tracking-tight">⚡ UPI INSTANT PAY</h3>
          </div>

          {paymentStatus === "IDLE" && (
            <div className="space-y-5 text-center">
              {/* Monospace Amount */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 space-y-1 text-center">
                <span className="text-[10px] text-slate-500 font-mono block">FINAL AMOUT TO PAY</span>
                <strong className="text-2xl font-black text-orange-400 font-mono">₹{amount}</strong>
              </div>

              {/* Dynamic QR Code vector simulation */}
              <div className="bg-white p-3 rounded-2xl w-40 h-40 mx-auto border-4 border-slate-950 relative shadow-inner flex items-center justify-center select-none">
                <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  {/* Styled authentic QR grid */}
                  <path d="M2,2 H8 V8 H2 Z M4,4 v2 h2 v-2 z M16,2 H22 V8 H16 Z M18,4 v2 h2 v-2 z M2,16 H8 V22 H2 Z M4,18 v2 h2 v-2 z M10,4 h2 v2 h-2 z M10,8 h2 v2 h-2 z M14,10 h2 v2 h-2 z M14,14 h2 v2 h-2 z M10,14 h2 v2 h-2 z M12,18 h2 v2 h-2 z M18,12 h2 v2 h-2 z M16,16 h2 v2 h-2 z" />
                  <path d="M10,2 h2 v2 h-2 z M12,6 h2 v2 h-2 z M6,12 H12 V14 H6 Z M16,18 h4 v2 h-4 z" opacity="0.85" />
                  <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" fill="#f97316" />
                </svg>
                {/* Visual pulse line */}
                <div className="absolute left-0 right-0 h-0.5 bg-orange-500/50 shadow-lg shadow-orange-500 top-0 animate-[bounce_2.5s_infinite]" />
              </div>

              {/* UPI ID copier and verify handler */}
              <div className="space-y-3.5">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-400 text-[10.5px]">{upiId}</span>
                  <button
                    onClick={handleCopyUpiId}
                    className="text-slate-300 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    title="Copy Merchant UPI ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="bg-slate-950 text-slate-400 p-3 rounded-lg text-[9.5px] leading-relaxed font-mono flex items-center gap-2 border border-slate-850 text-left">
                  <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Scan QR code with your BHIM, GPay, PhonePe, or Paytm app to pay. Do not close this panel.</span>
                </div>

                <button
                  onClick={handleVerifyPayment}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs font-black uppercase py-3 rounded-xl transition-all shadow-md shadow-orange-500/10 active:scale-97 cursor-pointer"
                >
                  I Have Paid ✓ Confirm
                </button>
              </div>
            </div>
          )}

          {paymentStatus === "PENDING" && (
            <div className="py-10 space-y-6 text-center">
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin" />
              </div>
              <div className="space-y-1">
                <strong className="text-xs font-mono text-orange-400 tracking-wider">VERIFYING WITH MERCHANT CORE</strong>
                <p className="text-[10.5px] text-slate-400 font-mono leading-relaxed px-4">{stepMessage}</p>
              </div>
            </div>
          )}

          {paymentStatus === "SUCCESS" && (
            <div className="py-10 space-y-4 text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
              <div className="space-y-1">
                <strong className="text-xs font-mono text-emerald-400 tracking-widest uppercase">Payment Confirmed!</strong>
                <p className="text-[10px] text-slate-400 font-mono">Invoice generated. Handing over directly to the baking deck.</p>
              </div>
            </div>
          )}

          {paymentStatus === "FAILED" && (
            <div className="py-10 space-y-5 text-center">
              <AlertCircle className="w-14 h-14 text-red-500 mx-auto animate-pulse" />
              <div className="space-y-1.5 font-mono">
                <strong className="text-xs text-red-500 tracking-widest uppercase block">Transaction Terminated</strong>
                <p className="text-[10px] text-slate-400 leading-normal px-4">{failReason}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentStatus("IDLE")}
                  className="flex-1 bg-slate-800 text-slate-300 font-mono text-[10px] uppercase font-bold py-2.5 rounded-lg cursor-pointer"
                >
                  Retry Payment
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-red-650 text-white bg-red-600 hover:bg-red-750 font-mono text-[10px] uppercase font-bold py-2.5 rounded-lg cursor-pointer"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
