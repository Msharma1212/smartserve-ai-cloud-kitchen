import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Phone, User, CheckCircle2, ShieldAlert, Sparkles, X, ChevronRight, Lock } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  otpStep: "phone" | "otp";
  setOtpStep: (val: "phone" | "otp") => void;
  loginNameInput: string;
  setLoginNameInput: (val: string) => void;
  loginPhoneInput: string;
  setLoginPhoneInput: (val: string) => void;
  loginOtpInput: string;
  setLoginOtpInput: (val: string) => void;
  handleApplyLogin: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  otpStep,
  setOtpStep,
  loginNameInput,
  setLoginNameInput,
  loginPhoneInput,
  setLoginPhoneInput,
  loginOtpInput,
  setLoginOtpInput,
  handleApplyLogin,
}: Props) {
  if (!isOpen) return null;

  const quickFillOtpCode = () => {
    setLoginOtpInput("1234");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans" id="premium-login-modal-viewport">
        {/* Blurry Backdrop standard preset */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Main container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col z-10 text-slate-800"
          id="premium-login-box"
        >
          {/* Distinct top graphics border visual */}
          <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 w-full" />

          {/* Close Trigger Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors z-20"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* 1. Header with branding */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-primary px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                <span>SmartServe Security Gateway</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight font-display">
                {otpStep === "phone" ? "Welcome to SmartServe" : "Enter Verification PIN"}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {otpStep === "phone"
                  ? "Login or sign up instantly in 1 click to unlock direct cloud kitchen routing."
                  : "We sent a simulated 4-digit code to your phone number via virtual Firebase Node."}
              </p>
            </div>

            {/* 2. Form controls */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {otpStep === "phone" ? (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    {/* Customer full name entry */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="E.g. Siddharth"
                          value={loginNameInput}
                          onChange={(e) => setLoginNameInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl pl-10 pr-3.5 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-orange-100 transition-all text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Customer phone number entry */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <div className="absolute left-8.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 border-r pr-2 border-slate-200">
                          +91
                        </div>
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="e.g. 9876543210"
                          value={loginPhoneInput}
                          onChange={(e) => setLoginPhoneInput(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl pl-18 pr-3.5 py-3 text-xs font-mono font-bold tracking-widest outline-none focus:ring-1 focus:ring-orange-100 transition-all text-slate-800"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4 text-center"
                  >
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                        Enter 4-Digit Passcode
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="• • • •"
                          value={loginOtpInput}
                          onChange={(e) => setLoginOtpInput(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3.5 text-center text-sm font-mono font-black tracking-[1em] outline-none focus:ring-1 focus:ring-orange-100 transition-all text-slate-850"
                        />
                      </div>
                    </div>

                    {/* OTP helper shortcut */}
                    <div className="p-3 bg-orange-50/50 border border-orange-100/50 rounded-2xl text-[10.5px] text-orange-850 leading-relaxed text-left flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span>A simulated SMS was targeted to <strong>{loginPhoneInput}</strong>.</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-500 font-mono">Demo code: <strong className="text-primary">1234</strong></span>
                          <button
                            type="button"
                            onClick={quickFillOtpCode}
                            className="bg-primary hover:bg-orange-600 text-white font-mono text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Auto-Fill
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Submit Button */}
              <button
                type="button"
                onClick={handleApplyLogin}
                className="w-full bg-primary hover:bg-orange-600 text-white font-mono text-[11px] font-black uppercase py-3.5 rounded-2xl transition-all shadow-xl shadow-orange-500/15 flex items-center justify-center gap-2 hover:shadow-orange-500/25 active:scale-97 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{otpStep === "phone" ? "Send simulated OTP PIN" : "Verify & Authorize"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Back button link if in OTP state */}
            {otpStep === "otp" && (
              <button
                onClick={() => setOtpStep("phone")}
                className="text-[10px] font-mono uppercase font-black text-slate-400 hover:text-primary transition-colors block text-center mx-auto"
              >
                ← Back to change number
              </button>
            )}

            {/* Simulated Firebase disclaimer check with small text */}
            <div className="border-t border-slate-100 pt-4 text-center">
              <span className="text-[9px] text-[#94a3b8] font-mono leading-relaxed block max-w-xs mx-auto">
                🔒 Secured by Firebase Auth node in offline testing sandbox mode. Zero cookies are tracked outside session persistence.
              </span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
