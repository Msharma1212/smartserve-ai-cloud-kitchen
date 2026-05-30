import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, X, Plus, Minus, Tag, MapPin, CreditCard, LogIn, Sparkles, HelpCircle, Eye, Trash2, Car, Coffee, Compass, Train, Clock, Check, AlertCircle } from "lucide-react";
import { CartItem, Franchise } from "../types";
import { 
  getTrainPositionInfo, 
  isStationPassed as libIsStationPassed, 
  checkIsServiceable as libCheckIsServiceable,
  getLinearTimes 
} from "../lib/trainTracking";

const fallbackRouteStops = [
  { stationCode: "NDLS", stationName: "New Delhi Railway Station", arrivalTime: "16:55", departureTime: "17:10", distanceKm: 0 },
  { stationCode: "CNB", stationName: "Kanpur Central (SmartServe Central Hub)", arrivalTime: "21:35", departureTime: "21:40", distanceKm: 440 },
  { stationCode: "PRYJ", stationName: "Prayagraj Junction", arrivalTime: "23:50", departureTime: "23:55", distanceKm: 630 },
  { stationCode: "PNBE", stationName: "Patna Junction stop", arrivalTime: "04:10", departureTime: "04:20", distanceKm: 980 },
  { stationCode: "HWH", stationName: "Howrah Junction", arrivalTime: "08:30", departureTime: "08:30", distanceKm: 1445 }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateCartQty: (id: string, delta: number) => void;
  onRemoveFromCart: (id: string) => void;
  couponCode: string;
  onChangeCouponCode: (val: string) => void;
  onApplyCouponCode: () => void;
  appliedCoupon: string;
  cartSubtotal: number;
  cartTaxes: number;
  deliverySurcharge: number;
  couponDiscountSum: number;
  grandTotalResult: number;
  customerPhone: string;
  checkoutName: string;
  checkoutPhone: string;
  checkoutAddress: string;
  onChangeCheckoutAddress: (val: string) => void;
  paymentOption: "UPI" | "Card" | "Wallet" | "COD";
  onChangePaymentOption: (val: "UPI" | "Card" | "Wallet" | "COD") => void;
  onCheckoutSubmit: () => void;
  onOpenLogin: () => void;
  pnrStationInfo: any;
  onDisablePnrMode: () => void;
  onSetPnrStationInfo: (info: any) => void;
  simulatedTime?: string;
  onChangeSimulatedTime?: (val: string) => void;

  // Ordering mode additions
  selectedOrderMode: "dine-in" | "pickup" | "delivery" | "in-car" | "train";
  onChangeOrderMode: (val: "dine-in" | "pickup" | "delivery" | "in-car" | "train") => void;
  dineInTableNumber: string;
  onChangeDineInTableNumber: (val: string) => void;
  inCarSpotNumber: string;
  onChangeInCarSpot: (val: string) => void;
  inCarVehiclePlate: string;
  onChangeInCarVehiclePlate: (val: string) => void;
  pickupTimeEstimate: string;
  onChangePickupTimeEstimate: (val: string) => void;
  addToast?: (msg: string, type: "success" | "error" | "info" | "warning") => void;
  franchises: Franchise[];
  onNavigate?: (page: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateCartQty,
  onRemoveFromCart,
  couponCode,
  onChangeCouponCode,
  onApplyCouponCode,
  appliedCoupon,
  cartSubtotal,
  cartTaxes,
  deliverySurcharge,
  couponDiscountSum,
  grandTotalResult,
  customerPhone,
  checkoutName,
  checkoutPhone,
  checkoutAddress,
  onChangeCheckoutAddress,
  paymentOption,
  onChangePaymentOption,
  onCheckoutSubmit,
  onOpenLogin,
  pnrStationInfo,
  onDisablePnrMode,
  onSetPnrStationInfo,
  simulatedTime = "21:38",
  onChangeSimulatedTime,

  // Ordering mode additions
  selectedOrderMode,
  onChangeOrderMode,
  dineInTableNumber,
  onChangeDineInTableNumber,
  inCarSpotNumber,
  onChangeInCarSpot,
  inCarVehiclePlate,
  onChangeInCarVehiclePlate,
  pickupTimeEstimate,
  onChangePickupTimeEstimate,
  addToast,
  franchises,
  onNavigate,
}: Props) {

  // Local state for the PNR input system inside the cart
  const [cartPnr, setCartPnr] = useState(pnrStationInfo?.pnr || "");
  const [cartStation, setCartStation] = useState(pnrStationInfo?.stationName || "Kanpur Central Station");
  const [cartCoach, setCartCoach] = useState(pnrStationInfo?.coach || "B3");
  const [cartSeat, setCartSeat] = useState(pnrStationInfo?.seat || "18");
  const [pnrLoading, setPnrLoading] = useState(false);
  const [pnrError, setPnrError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobileState = () => setIsMobile(window.innerWidth < 768);
    checkMobileState();
    window.addEventListener("resize", checkMobileState);
    return () => window.removeEventListener("resize", checkMobileState);
  }, []);

  useEffect(() => {
    if (pnrStationInfo) {
      setCartPnr(pnrStationInfo.pnr || "");
      setCartStation(pnrStationInfo.stationName || "Kanpur Central Station");
      setCartCoach(pnrStationInfo.coach || "B3");
      setCartSeat(pnrStationInfo.seat || "18");
      setPnrError(null);
    }
  }, [pnrStationInfo, isOpen]);

  const handleValidatePnr = async (customPnr?: string) => {
    const pnrToValidate = (customPnr || cartPnr).trim();
    if (!/^[0-9]{10}$/.test(pnrToValidate)) {
      setPnrError("Enter valid 10-digit PNR");
      return;
    }
    setPnrLoading(true);
    setPnrError(null);
    try {
      // Small simulated delay for a true premium tech feel
      await new Promise((r) => setTimeout(r, 1000));
      const res = await fetch(`/api/train/pnr?pnrNumber=${pnrToValidate}`);
      const data = await res.json();
      if (data.success && data.train) {
        if (data.fallback) {
          if (addToast) addToast("Unable to fetch live train data", "error");
        }
        const stops = data.train.routeStops || [];
        const firstServiceable = stops.find((s: any) => s.stationCode === "CNB" || s.stationCode === "NDLS") || stops[0];

        onSetPnrStationInfo({
          pnr: data.train.pnr,
          trainNo: data.train.trainNo,
          trainName: data.train.trainName,
          coach: data.train.coach || cartCoach || "B3",
          seat: data.train.seat || cartSeat || "18",
          stationCode: firstServiceable?.stationCode || "CNB",
          stationName: firstServiceable?.stationName || "Kanpur Central Station",
          routeStops: stops,
          currentDelayMins: data.train.currentDelayMins || 0
        });
        setPnrError(null);
      } else {
        setPnrError("PNR not found in central IRCTC query database.");
        if (addToast) addToast("Unable to fetch live train data", "error");
      }
    } catch (err) {
      setPnrError("Network lag connecting to railway query node.");
      if (addToast) addToast("Unable to fetch live train data", "error");
    } finally {
      setPnrLoading(false);
    }
  };

  const handleDemoPnrSelect = (demoCode: string, demoTrainName: string) => {
    setCartPnr(demoCode);
    setCartCoach("B3");
    setCartSeat("24");
    setCartStation("Kanpur Central Station");
    handleValidatePnr(demoCode);
  };

  const handleForceOverride = () => {
    if (!cartPnr) {
      setPnrError("Enter any numeric values as placeholder first.");
      return;
    }
    onSetPnrStationInfo({
      pnr: cartPnr,
      trainNo: "12301",
      trainName: "SmartServe Fast Express",
      coach: cartCoach || "A1",
      seat: cartSeat || "12",
      stationCode: "CNB",
      stationName: cartStation || "Kanpur Central Station"
    });
    setPnrError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans" id="cart-drawer-overlay">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer container body */}
          <div className={isMobile ? "fixed bottom-0 inset-x-0 top-auto h-[85vh] pl-0 flex z-50 overflow-hidden" : "absolute inset-y-0 right-0 max-w-full pl-10 flex"}>
            <motion.div
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={{ x: 0, y: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className={isMobile 
                ? "w-full bg-white shadow-[0_-10px_35px_rgba(0,0,0,0.15)] rounded-t-3xl flex flex-col h-full" 
                : "w-screen max-w-md bg-white/95 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.15)] border-l border-slate-100 flex flex-col"}
              id="cart-drawer-body"
            >
              {/* Header section with brand and counters */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-primary shadow-xs">
                    <ShoppingCart className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 tracking-tight font-display uppercase">
                      My Selected Basket
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                      {cart.length === 0 ? "Basket Empty" : `${cart.reduce((s, c) => s + c.qty, 0)} items selected`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all hover:rotate-90 duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Core interactive scroll body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/40">
                
                {/* 1. Basket items lists */}
                {cart.length === 0 ? (
                  <div className="text-center py-20 px-6 space-y-5 animate-fade-in">
                    <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <div className="absolute inset-0 bg-orange-100/40 rounded-full scale-110 animate-ping" style={{ animationDuration: "3s" }} />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-orange-100 to-amber-50 flex items-center justify-center text-[#ff4d2d] shadow-inner">
                        <ShoppingCart className="w-9 h-9 animate-bounce" style={{ animationDuration: "2.2s" }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Your Basket is Empty</h4>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Explore our Convection Handcrafted pizzas, customized toppings, and dynamic beverages to qualify for instant direct-grid dispatch.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        if (onNavigate) {
                          onNavigate("order");
                        }
                        setTimeout(() => {
                          const el = document.getElementById("interactive-menus-page");
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth" });
                          }
                        }, 120);
                      }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-[10.5px] font-black uppercase tracking-wider px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-orange-500/25 active:scale-95 cursor-pointer"
                    >
                      Browse Kitchen Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between border-b pb-2 border-slate-100/60">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Selected Confections
                      </span>
                      <span className="text-[10px] text-[#ff4d2d] font-bold bg-orange-50/80 px-2.5 py-0.5 rounded-full font-mono">
                        {cart.reduce((s, c) => s + c.qty, 0)} Items
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                      {cart.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-3.5 flex gap-3.5 hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
                          <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                            <img
                              src={item.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80"}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              alt={item.name}
                              referrerPolicy="no-referrer"
                            />
                            {item.isVeg !== undefined && (
                              <span className={`absolute top-1 left-1 w-2 h-2 rounded-full border-white border ${item.isVeg ? "bg-emerald-500" : "bg-red-500"}`} />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="space-y-0.5">
                              <h4 className="font-extrabold text-slate-800 text-xs truncate leading-tight">{item.name}</h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-[8.5px] font-mono font-bold uppercase text-slate-500 border border-slate-100">
                                  Size: {item.size}
                                </span>
                              </div>
                              {item.toppings && item.toppings.length > 0 && (
                                <p className="text-[8.5px] text-slate-400 font-mono truncate leading-normal" title={item.toppings.join(", ")}>
                                  + {item.toppings.join(", ")}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-50">
                              <span className="font-black text-slate-800 font-mono text-xs">₹{item.price * item.qty}</span>
                              
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center bg-slate-50 border border-slate-200/60 rounded-full shadow-inner overflow-hidden">
                                  <button
                                    onClick={() => onUpdateCartQty(item.id, -1)}
                                    className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors font-black text-xs cursor-pointer select-none"
                                  >
                                    -
                                  </button>
                                  <span className="px-1 font-mono font-bold text-xs text-slate-850 select-none">{item.qty}</span>
                                  <button
                                    onClick={() => onUpdateCartQty(item.id, 1)}
                                    className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors font-black text-xs cursor-pointer select-none"
                                  >
                                    +
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => onRemoveFromCart(item.id)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center border border-red-100 hover:bg-red-50 text-red-500 hover:text-red-700 transition-all cursor-pointer active:scale-90"
                                  title="Remove Item"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                 {/* Premium Railway Active Mode Callout Dashboard */}
                 {cart.length > 0 && pnrStationInfo && (() => {
                   const matchingStop = pnrStationInfo.routeStops?.find((s: any) => s.stationCode === pnrStationInfo.stationCode);
                   const arrTime = matchingStop?.arrivalTime || "21:35";
                   const depTime = matchingStop?.departureTime || "21:40";
                   const firstStop = pnrStationInfo.routeStops?.[0]?.stationCode || "Departure";
                   const lastStop = pnrStationInfo.routeStops?.[pnrStationInfo.routeStops.length - 1]?.stationCode || "Destination";

                   return (
                     <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 text-white p-4.5 rounded-2xl space-y-3.5 shadow-xl text-left relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-1 bg-indigo-500/10 text-[7px] font-mono tracking-wider text-indigo-300 font-black">
                         GPS SYNC: SECURED
                       </div>
                       
                       <div className="flex items-center justify-between border-b border-indigo-900/40 pb-2">
                         <div className="flex items-center gap-1.5">
                           <span className="text-sm">🚆</span>
                           <div>
                             <span className="text-[9px] font-mono font-black text-amber-400 block tracking-wider uppercase leading-none">Smart PNR Intercept</span>
                             <span className="text-[8px] text-slate-400 font-mono">PNR Match: {pnrStationInfo.pnr}</span>
                           </div>
                         </div>
                         <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[8px] text-emerald-300 font-mono font-black animate-pulse uppercase tracking-wider">
                           ✓ Cook-to-Berth Active
                         </span>
                       </div>

                       <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                         <div>
                           <span className="text-[7.5px] text-slate-450 block uppercase font-bold">Assigned Train</span>
                           <strong className="text-white block mt-0.5 text-[11px] truncate" title={`${pnrStationInfo.trainNo} - ${pnrStationInfo.trainName}`}>
                             {pnrStationInfo.trainNo} - {pnrStationInfo.trainName}
                           </strong>
                         </div>
                         <div>
                           <span className="text-[7.5px] text-slate-450 block uppercase font-bold">Delivery Berth Seat</span>
                           <strong className="text-white block mt-0.5 text-[11px]">
                             Coach {pnrStationInfo.coach} / Seat {pnrStationInfo.seat}
                           </strong>
                         </div>
                         <div>
                           <span className="text-[7.5px] text-slate-450 block uppercase font-bold">Junction Decision Hub</span>
                           <strong className="text-amber-300 block mt-0.5 text-[11px] truncate">
                             {pnrStationInfo.stationCode} ({pnrStationInfo.stationName})
                           </strong>
                         </div>
                         <div>
                           <span className="text-[7.5px] text-slate-450 block uppercase font-bold">ETA Intercept Window</span>
                           <strong className="text-emerald-400 block mt-0.5 text-[11px]">
                             Arr: {arrTime} | Dep: {depTime}
                           </strong>
                         </div>
                       </div>

                       {/* Linear track progress line inside the cart */}
                       <div className="pt-1">
                         <div className="relative flex items-center justify-between text-[7px] text-slate-400 font-mono">
                           <span>{firstStop}</span>
                           <div className="flex-1 h-[1.5px] bg-slate-800 mx-2.5 relative flex items-center justify-center">
                             <div className="absolute left-[35%] text-[10px] leading-none animate-pulse">🚆</div>
                           </div>
                           <span className="text-amber-400 font-extrabold">{pnrStationInfo.stationCode}</span>
                           <div className="flex-1 h-[1.5px] bg-dashed border-t border-slate-800/50 mx-2.5" />
                           <span>{lastStop}</span>
                         </div>
                       </div>

                       <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-white/5">
                         <button
                           type="button"
                           onClick={onDisablePnrMode}
                           className="text-[8px] font-mono uppercase bg-slate-900 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 px-2 py-1 rounded transition w-full text-center"
                         >
                           Disable railway transit intercept
                         </button>
                       </div>
                     </div>
                   );
                 })()}

                {/* 2. Coupons Application Section */}
                {cart.length > 0 && (
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-baseline justify-between border-b pb-1.5 border-slate-50">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                        Coupons & Promos
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">1 active per ticket</span>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Type FESTIVE50, FIRST100..."
                          value={couponCode}
                          onChange={(e) => onChangeCouponCode(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-black uppercase text-slate-700 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 transition-all placeholder:text-slate-350"
                        />
                      </div>
                      <button
                        onClick={onApplyCouponCode}
                        className="bg-slate-900 hover:bg-slate-850 text-white font-mono text-[10px] font-black uppercase px-4 rounded-xl transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {appliedCoupon && (
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-xl text-[10.5px] font-mono font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Promotional discount applied: <strong>{appliedCoupon}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Breakdown of Cost values */}
                {cart.length > 0 && (
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-2.5 text-xs font-mono text-slate-500">
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider border-b pb-1.5 mb-2 flex items-center justify-between">
                      <span>Accounting Slip</span>
                      <span className="font-extrabold text-[#94a3b8]">SLP-{new Date().getFullYear()}</span>
                    </span>

                    <div className="flex justify-between">
                      <span>Subtotal of Items:</span>
                      <strong className="text-slate-800 font-bold">₹{cartSubtotal}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>CGST Tax (9%):</span>
                      <strong className="text-slate-700 font-medium">₹{Math.round(cartSubtotal * 0.09)}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>SGST Tax (9%):</span>
                      <strong className="text-slate-700 font-medium">₹{Math.round(cartSubtotal * 0.09)}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Service Charge (2%):</span>
                      <strong className="text-slate-700 font-medium">₹{Math.round(cartSubtotal * 0.02)}</strong>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-dashed border-slate-100">
                      <span>Delivery Surcharge:</span>
                      <strong className={deliverySurcharge === 0 ? "text-emerald-700 font-black" : "text-slate-805 font-bold"}>
                        {deliverySurcharge === 0 
                          ? "FREE (≥₹500)" 
                          : appliedCoupon 
                          ? `₹${deliverySurcharge} (Promo Active)` 
                          : `₹${deliverySurcharge} (<₹500 Threshold)`}
                      </strong>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-700 font-black">
                        <span>Coupon Slashed Value:</span>
                        <span>-₹{couponDiscountSum}</span>
                      </div>
                    )}

                    <div className="pt-3.5 border-t border-slate-100 mt-2 flex items-baseline justify-between text-xs text-slate-800 font-black">
                      <span className="text-xs uppercase tracking-tight font-display font-black text-slate-700">GRAND TOTAL INVOICE:</span>
                      <span className="text-lg font-black text-primary font-mono whitespace-nowrap">₹{grandTotalResult}</span>
                    </div>
                  </div>
                )}

                {/* 4. Consignee Dispatch Details container */}
                {cart.length > 0 && (
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5">
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider border-b pb-1.5">
                      Consignee Dispatch Details
                    </span>

                    {!customerPhone ? (
                      <div className="space-y-3">
                        <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center font-mono text-[10px] text-indigo-700 leading-normal">
                          Please verify your phone number with our instant simulated SMS verification to proceed.
                        </div>
                        <button
                          onClick={onOpenLogin}
                          className="w-full bg-primary hover:bg-primary-hover text-white font-mono text-[10.5px] font-black uppercase py-3 rounded-xl transition-all shadow-md shadow-orange-100 flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-orange-200"
                        >
                          <LogIn className="w-4 h-4 text-white" />
                          <span>Login to Verify</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-[8px] text-slate-400 font-bold block uppercase">Verified Name</span>
                            <span className="text-slate-850 font-extrabold truncate block">{checkoutName}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 font-bold block uppercase">Primary Contact</span>
                            <span className="text-slate-850 font-extrabold truncate block">{checkoutPhone}</span>
                          </div>
                        </div>

                        {/* Active Mode selector indicator within the Checkout Panel */}
                        <div className="space-y-1 my-1.5 p-2 bg-slate-50 rounded-xl border border-dotted border-slate-200">
                          <label className="block text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                            Cart Dispatch Mode
                          </label>
                          <div className="grid grid-cols-5 gap-1 font-mono text-[9px] font-bold">
                            {[
                              { id: "delivery", label: "Delivery", sym: "🛵" },
                              { id: "dine-in", label: "Dine-In", sym: "🍽️" },
                              { id: "in-car", label: "In-Car", sym: "🚗" },
                              { id: "pickup", label: "Pickup", sym: "🎒" },
                              { id: "train", label: "Train", sym: "🚆" },
                            ].map((md) => {
                              const active = selectedOrderMode === md.id;
                              return (
                                <button
                                  type="button"
                                  key={md.id}
                                  onClick={() => onChangeOrderMode(md.id as any)}
                                  className={`p-1 rounded-lg text-center flex flex-col items-center justify-center gap-0.5 border select-none transition-all cursor-pointer ${
                                    active
                                      ? "bg-slate-900 border-slate-950 text-white font-extrabold shadow-sm"
                                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                                  }`}
                                  title={md.label}
                                >
                                  <span className="text-sm">{md.sym}</span>
                                  <span className="text-[7.5px] tracking-tighter truncate w-full block">{md.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Mode Specific Dynamic Form Fields */}
                        {selectedOrderMode === "delivery" && (
                          <div className="space-y-1">
                            <label className="block text-[9.5px] font-bold text-slate-500 uppercase font-mono">
                              GPS Delivery Address
                            </label>
                            <div className="relative">
                              <MapPin className="w-3.5 h-3.5 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="E.g. Room 42, Floor 2, DLF Cyber City..."
                                value={checkoutAddress}
                                onChange={(e) => onChangeCheckoutAddress(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 transition-all text-slate-700"
                              />
                            </div>
                          </div>
                        )}

                        {selectedOrderMode === "dine-in" && (
                          <div className="space-y-1">
                            <label className="block text-[9.5px] font-bold text-slate-500 uppercase font-mono">
                              Restaurant Serving Table
                            </label>
                            <div className="relative">
                              <Coffee className="w-3.5 h-3.5 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="E.g. Table 5, Table 12, Main Hall..."
                                value={dineInTableNumber}
                                onChange={(e) => onChangeDineInTableNumber(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 transition-all text-slate-700 font-mono"
                              />
                            </div>
                            <span className="text-[8.5px] text-emerald-600 font-medium block">✓ Serves direct from convection thermal kitchen block.</span>
                          </div>
                        )}

                        {selectedOrderMode === "in-car" && (
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <label className="block text-[9.5px] font-bold text-slate-500 uppercase font-mono">
                                Parking Slot / Bay Number
                              </label>
                              <div className="relative">
                                <Car className="w-3.5 h-3.5 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  placeholder="E.g. Slot 4, Bay Area B..."
                                  value={inCarSpotNumber}
                                  onChange={(e) => onChangeInCarSpot(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 transition-all text-slate-700 font-mono"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[9.5px] font-bold text-slate-500 uppercase font-mono">
                                Car Registration Number / Model
                              </label>
                              <div className="relative">
                                <Compass className="w-3.5 h-3.5 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  placeholder="E.g. White Creta UP32-XX-1234..."
                                  value={inCarVehiclePlate}
                                  onChange={(e) => onChangeInCarVehiclePlate(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 transition-all text-slate-700 font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedOrderMode === "pickup" && (
                          <div className="space-y-1">
                            <label className="block text-[9.5px] font-bold text-slate-500 uppercase font-mono">
                              Self-Pickup Schedule Time
                            </label>
                            <div className="relative flex gap-2">
                              {["15 mins", "30 mins", "45 mins", "Later"].map((time) => {
                                const active = pickupTimeEstimate === time;
                                return (
                                  <button
                                    type="button"
                                    key={time}
                                    onClick={() => onChangePickupTimeEstimate(time)}
                                    className={`flex-1 py-2 text-center rounded-lg border text-[10px] font-mono font-bold transition-all ${
                                      active
                                        ? "bg-primary border-primary text-white shadow-sm"
                                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {time}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {selectedOrderMode === "train" && (
                          <div className="space-y-3 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between border-b pb-1.5 border-slate-200/60 mb-1">
                              <span className="text-[10px] font-mono font-black tracking-wider uppercase text-primary flex items-center gap-1">
                                <Train className="w-3 h-3 text-primary animate-pulse" />
                                <span>IRCTC Integrated Track Delivery</span>
                              </span>
                              {pnrStationInfo && (
                                <button
                                  type="button"
                                  onClick={onDisablePnrMode}
                                  className="text-[9px] font-mono leading-none font-bold uppercase py-1 px-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-md transition-all scale-95"
                                >
                                  Reset PNR
                                </button>
                              )}
                            </div>

                            {/* PNR State matches details */}
                            {pnrStationInfo ? (
                              <div className="space-y-3">
                                {/* Success Banner */}
                                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full" />
                                    <div>
                                      <p className="text-[10px] font-mono font-black text-emerald-800 text-left">PNR {pnrStationInfo.pnr} ACTIVE</p>
                                      <p className="text-[9px] text-emerald-600 font-medium text-left">IRCTC live connection verified</p>
                                    </div>
                                  </div>
                                  <span className="text-[8.5px] font-mono px-2 py-0.5 bg-emerald-200/55 text-emerald-700 rounded font-bold animate-pulse">
                                    ✓ SECURED
                                  </span>
                                </div>

                                {/* Live Telemetry and Position Simulation */}
                                <div className="space-y-3.5">
                                  <div className="flex items-center justify-between bg-slate-900 text-white p-3.5 rounded-2xl space-y-2 border border-slate-800 shadow-lg flex-wrap gap-2">
                                    <div className="text-left">
                                      <p className="text-[9px] font-mono text-amber-400 font-extrabold uppercase tracking-wide text-left">
                                        Live Status Simulator
                                      </p>
                                      <h4 className="text-xs font-black font-sans text-slate-100 text-left">
                                        {pnrStationInfo.trainName} ({pnrStationInfo.trainNo})
                                      </h4>
                                    </div>
                                    <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded font-extrabold ${pnrStationInfo.currentDelayMins > 0 ? "bg-red-500/20 text-rose-300 border border-red-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
                                      {pnrStationInfo.currentDelayMins > 0 ? `+${pnrStationInfo?.currentDelayMins}m Delayed` : "On Time"}
                                    </span>
                                  </div>
                                </div>

                                {/* Dynamic status feedback and time control */}
                                {(() => {
                                  const fallbackRouteStops = [
                                    { stationCode: "NDLS", stationName: "New Delhi Railway Station", arrivalTime: "16:55", departureTime: "17:10", distanceKm: 0 },
                                    { stationCode: "CNB", stationName: "Kanpur Central (SmartServe Central Hub)", arrivalTime: "21:35", departureTime: "21:40", distanceKm: 440 },
                                    { stationCode: "PRYJ", stationName: "Prayagraj Junction", arrivalTime: "23:50", departureTime: "23:55", distanceKm: 630 },
                                    { stationCode: "PNBE", stationName: "Patna Junction stop", arrivalTime: "04:10", departureTime: "04:20", distanceKm: 980 },
                                    { stationCode: "HWH", stationName: "Howrah Junction", arrivalTime: "08:30", departureTime: "08:30", distanceKm: 1445 }
                                  ];
                                  const stops = pnrStationInfo.routeStops || fallbackRouteStops;
                                  const livePos = getTrainPositionInfo(stops, simulatedTime);
                                  
                                  // Determine physical descriptions for testing/simulations
                                  let desc = "";
                                  let nextStop = null;
                                  let currentStop = stops[0];
                                  let simulatedIndex = 0;

                                  if (livePos.atStationIndex !== -1) {
                                    currentStop = stops[livePos.atStationIndex];
                                    simulatedIndex = livePos.atStationIndex;
                                    desc = `Currently stopped at ${currentStop.stationName} (${currentStop.stationCode}). Departing scheduled at ${currentStop.departureTime}.`;
                                    nextStop = livePos.atStationIndex < stops.length - 1 ? stops[livePos.atStationIndex + 1] : null;
                                  } else if (livePos.betweenStations) {
                                    currentStop = stops[Math.max(0, livePos.betweenStations.fromIndex)];
                                    simulatedIndex = Math.max(0, livePos.betweenStations.fromIndex);
                                    nextStop = stops[livePos.betweenStations.toIndex];
                                    if (nextStop) {
                                      desc = `Departed ${currentStop.stationCode}. En-route to ${nextStop.stationName} (${nextStop.distanceKm - currentStop.distanceKm}km segment | approaching in ${Math.round(100 - livePos.betweenStations.progressPct)}% distance).`;
                                    } else {
                                      desc = `Arrived at final station terminal boundary!`;
                                    }
                                  } else if (livePos.linearCurrentTime < getLinearTimes(stops)[0].linearArr) {
                                    desc = `Preparing for departure at starting station: ${stops[0].stationName}.`;
                                  } else {
                                    desc = `Arrived at destination terminus: ${stops[stops.length - 1].stationName}.`;
                                    simulatedIndex = stops.length - 1;
                                  }

                                  return (
                                    <div className="space-y-3.5 text-left bg-slate-900 border border-slate-800 p-4.5 rounded-2xl shadow-xl">
                                      <div className="flex items-center justify-between text-[10px] font-mono border-b border-white/5 pb-2">
                                        <span className="text-amber-400 font-extrabold uppercase">Live Clock Time:</span>
                                        <span className="text-slate-100 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{simulatedTime}</span>
                                      </div>
                                      
                                      <div className="text-[9.5px] font-mono text-slate-350 leading-snug font-medium">
                                        <span className="text-amber-450 font-black">Position Info:</span> {desc}
                                      </div>

                                      {/* Horizontal progress visualization */}
                                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                                        {(() => {
                                          let progressPct = 0;
                                          if (livePos.atStationIndex !== -1) {
                                            progressPct = (livePos.atStationIndex / (stops.length - 1)) * 100;
                                          } else if (livePos.betweenStations) {
                                            const fromIdx = livePos.betweenStations.fromIndex;
                                            const basePct = fromIdx === -1 ? 0 : (fromIdx / (stops.length - 1)) * 100;
                                            const segmentWeight = 100 / (stops.length - 1);
                                            progressPct = basePct + (livePos.betweenStations.progressPct / 100) * segmentWeight;
                                          } else if (livePos.linearCurrentTime >= getLinearTimes(stops)[stops.length - 1].linearDep) {
                                            progressPct = 100;
                                          }
                                          return (
                                            <div 
                                              className="h-full bg-gradient-to-r from-emerald-500 via-amber-450 to-orange-500 rounded-full transition-all duration-1000"
                                              style={{ width: `${Math.min(progressPct, 100)}%` }}
                                            />
                                          );
                                        })()}
                                      </div>

                                      {/* Manual position adjust triggers */}
                                      <div className="flex items-center justify-between pt-1 border-t border-white/5 pt-2">
                                        <span className="text-[8.5px] font-mono text-slate-400 font-extrabold uppercase">
                                          Simulation Lever:
                                        </span>
                                        <div className="flex gap-1.5">
                                          <button
                                            type="button"
                                            disabled={simulatedIndex <= 0}
                                            onClick={() => {
                                              const prevIdx = simulatedIndex - 1;
                                              const targetStop = stops[prevIdx];
                                              const [h, m] = targetStop.arrivalTime.split(":").map(Number);
                                              // Set time to Kanpur or target station arrival + 2 mins
                                              let targetM = m + 2;
                                              let targetH = h;
                                              if (targetM >= 60) {
                                                targetM -= 60;
                                                targetH = (targetH + 1) % 24;
                                              }
                                              const strTime = `${String(targetH).padStart(2, "0")}:${String(targetM).padStart(2, "0")}`;
                                              
                                              onSetPnrStationInfo({
                                                ...pnrStationInfo,
                                                currentStationIndex: prevIdx
                                              });
                                              if (onChangeSimulatedTime) {
                                                onChangeSimulatedTime(strTime);
                                              }
                                              if (addToast) addToast(`Simulated train rolled back to ${targetStop.stationCode} (${strTime})!`, "info");
                                            }}
                                            className="px-2 py-1 bg-slate-800 hover:bg-slate-705 disabled:opacity-30 rounded text-[8.5px] font-mono font-extrabold text-slate-300 transition-all cursor-pointer border border-slate-750"
                                          >
                                            ◀ Prev Stop
                                          </button>
                                          <button
                                            type="button"
                                            disabled={simulatedIndex >= stops.length - 1}
                                            onClick={() => {
                                              const nextIdx = simulatedIndex + 1;
                                              const targetStop = stops[nextIdx];
                                              const [h, m] = targetStop.arrivalTime.split(":").map(Number);
                                              let targetM = m + 2;
                                              let targetH = h;
                                              if (targetM >= 60) {
                                                targetM -= 60;
                                                targetH = (targetH + 1) % 24;
                                              }
                                              const strTime = `${String(targetH).padStart(2, "0")}:${String(targetM).padStart(2, "0")}`;

                                              const stateUpdate: any = {
                                                ...pnrStationInfo,
                                                currentStationIndex: nextIdx
                                              };
                                              
                                              // Shift drop node if passed
                                              const curSelectedIdx = stops.findIndex((s: any) => s.stationCode === pnrStationInfo.stationCode);
                                              if (curSelectedIdx >= 0 && curSelectedIdx <= nextIdx) {
                                                const selectableStops = stops.slice(nextIdx + 1);
                                                const allowedSelection = selectableStops.find(s => libCheckIsServiceable(s, franchises));
                                                if (allowedSelection) {
                                                  stateUpdate.stationCode = allowedSelection.stationCode;
                                                  stateUpdate.stationName = allowedSelection.stationName;
                                                }
                                              }

                                              onSetPnrStationInfo(stateUpdate);
                                              if (onChangeSimulatedTime) {
                                                onChangeSimulatedTime(strTime);
                                              }
                                              if (addToast) addToast(`Simulated train advanced to ${targetStop.stationCode} (${strTime})!`, "success");
                                            }}
                                            className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-450 hover:to-orange-550 disabled:opacity-30 rounded text-[8.5px] font-mono font-black text-slate-950 transition-all cursor-pointer border border-amber-500 shadow-xs"
                                          >
                                            Next Stop ▶
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Active Itinerary Timeline Selection Area */}
                                <div className="space-y-2 pt-1.5 font-bold">
                                  <p className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest block text-left">
                                    Delivery Stations Timeline
                                  </p>
                                  <div className="relative border-l-2 border-slate-100 ml-2 pl-4 space-y-3.5 py-1 text-left">
                                    {((pnrStationInfo.routeStops || fallbackRouteStops) as any[]).map((stop: any, idx: number) => {
                                      const isServiceable = libCheckIsServiceable(stop, franchises);
                                      const isPassed = libIsStationPassed(stop.departureTime, simulatedTime, pnrStationInfo.routeStops || fallbackRouteStops, stop.stationCode);
                                      const isCurrentSelection = pnrStationInfo.stationCode === stop.stationCode;
                                      
                                      let status: "Departed" | "Available" | "Unserviceable" = "Available";
                                      if (isPassed) {
                                        status = "Departed";
                                      } else if (!isServiceable) {
                                        status = "Unserviceable";
                                      }

                                      const livePos = getTrainPositionInfo(pnrStationInfo.routeStops || fallbackRouteStops, simulatedTime);
                                      const isTrainAtThisStop = livePos.atStationIndex === idx;

                                      return (
                                        <div key={stop.stationCode} className="relative select-none group">
                                          {/* Bullet node dot */}
                                          <div className="absolute -left-[24.5px] top-1.5 z-10 flex items-center justify-center">
                                            {isTrainAtThisStop ? (
                                              <span className="text-xs bg-amber-400 border border-amber-500/40 p-0.5 rounded-full z-20 animate-bounce">🚆</span>
                                            ) : status === "Departed" ? (
                                              <span className="w-3.5 h-3.5 rounded-full border border-red-200 bg-red-50 flex items-center justify-center text-[7px] font-black text-red-500 shadow-3xs">
                                                ✕
                                              </span>
                                            ) : status === "Unserviceable" ? (
                                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-slate-200 flex items-center justify-center text-[6px] font-extrabold text-slate-400 shadow-3xs">
                                                •
                                              </span>
                                            ) : (
                                              <span
                                                className={`w-3.5 h-3.5 rounded-full border-2 block shadow-xs transition-all ${
                                                  isCurrentSelection
                                                    ? "border-emerald-500 bg-emerald-400 ring-4 ring-emerald-500/20 scale-110"
                                                    : "border-slate-350 bg-white group-hover:scale-110"
                                                }`}
                                              />
                                            )}
                                          </div>

                                          {/* Step Card Inner */}
                                          <button
                                            type="button"
                                            disabled={status === "Departed" || status === "Unserviceable"}
                                            onClick={() => {
                                              onSetPnrStationInfo({
                                                ...pnrStationInfo,
                                                stationCode: stop.stationCode,
                                                stationName: stop.stationName
                                              });
                                              if (addToast) {
                                                addToast(`Food delivery destination updated to: ${stop.stationName}! 🥘`, "success");
                                              }
                                            }}
                                            className={`w-full text-left p-2.5 px-3.5 rounded-xl border transition-all relative ${
                                              isCurrentSelection
                                                ? "bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border-emerald-300 shadow-sm font-semibold text-emerald-950 scale-[1.01]"
                                                : status === "Departed"
                                                ? "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed"
                                                : status === "Unserviceable"
                                                ? "bg-slate-50/50 border-slate-100 cursor-not-allowed opacity-50"
                                                : "bg-white border-slate-150 hover:border-slate-300 hover:bg-slate-50/45 cursor-pointer"
                                            }`}
                                          >
                                            <div className="flex items-center justify-between gap-1.5">
                                              <span className={`text-[10px] font-bold font-mono tracking-wide ${status === "Departed" ? "text-slate-400 line-through decoration-red-500/20" : isCurrentSelection ? "text-emerald-900 font-extrabold" : "text-slate-800"}`}>
                                                {stop.stationCode} - {stop.stationName}
                                              </span>
                                              
                                              {/* Node Specific Status Badges */}
                                              {isCurrentSelection ? (
                                                <span className="text-[7.5px] font-mono leading-none tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white font-black animate-pulse shadow-3xs flex items-center gap-0.5">
                                                  <span>🎯</span> Delivery Node
                                                </span>
                                              ) : status === "Departed" ? (
                                                <span className="text-[7.5px] font-mono leading-none py-0.5 px-1 bg-red-50 text-red-650 font-black border border-red-100/50 rounded uppercase">
                                                  Departed
                                                </span>
                                              ) : status === "Unserviceable" ? (
                                                <span className="text-[7.5px] font-mono leading-none py-0.5 px-1 bg-slate-100 text-slate-400 font-bold rounded uppercase">
                                                  Unserviceable
                                                </span>
                                              ) : (
                                                <span className="text-[7.5px] font-mono leading-none py-0.5 px-1.5 bg-emerald-50 text-emerald-700 border border-emerald-110 hover:bg-emerald-100 font-bold rounded uppercase transition-colors">
                                                  Available
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mt-1 pt-1 border-t border-slate-100/50">
                                              <span>Arr/Dep: {stop.arrivalTime} - {stop.departureTime}</span>
                                              <span>{stop.distanceKm} KM</span>
                                            </div>
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* BERTH / LOCATION SELECTION COMPONENT OVERRIDE */}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div className="space-y-1">
                                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase font-mono text-left">
                                      Coach Location
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. B3"
                                      value={pnrStationInfo.coach}
                                      onChange={(e) => {
                                        onSetPnrStationInfo({ ...pnrStationInfo, coach: e.target.value.toUpperCase() });
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none font-mono text-slate-700"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase font-mono text-left">
                                      Berth / Seat
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. 18"
                                      value={pnrStationInfo.seat}
                                      onChange={(e) => {
                                        onSetPnrStationInfo({ ...pnrStationInfo, seat: e.target.value.replace(/\D/g, "") });
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none font-mono text-slate-700"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3 text-left">
                                {/* PNR text field */}
                                <div className="space-y-1">
                                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase font-mono">
                                    IRCTC 10-Digit PNR ID
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Enter your train PNR number (e.g. 1234567890)"
                                    value={cartPnr}
                                    onChange={(e) => {
                                      setCartPnr(e.target.value.replace(/\D/g, "").slice(0, 10));
                                      setPnrError(null);
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none font-mono focus:border-orange-300 text-slate-800"
                                    maxLength={10}
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleValidatePnr()}
                                  disabled={pnrLoading}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  {pnrLoading ? (
                                    <>
                                      <span className="h-3 w-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                      <span>Requesting Railway APIs...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Train className="w-3.5 h-3.5 text-orange-400" />
                                      <span>Look Up & Validate PNR</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* State-aware friendly fallback errors and demo links */}
                            {pnrError && (
                              <div className="bg-orange-50/80 border border-orange-200 p-3 rounded-xl space-y-2 mt-2 transition-all">
                                <span className="text-[9px] font-black text-orange-700 block uppercase tracking-wider font-mono flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-orange-600 shrink-0" />
                                  <span>{pnrError}</span>
                                </span>
                                <p className="text-[9.5px] text-slate-500 leading-tight">
                                  No real-time booking matched. Try out simulated routes via one-click triggers or force bypass manually to checkout:
                                </p>
                                <div className="flex flex-col gap-1.5 pt-1">
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleDemoPnrSelect("1234567890", "Howrah Rajdhani")}
                                      className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 py-1.5 rounded-lg text-[9px] font-mono font-bold text-slate-705 transition"
                                    >
                                      Demo Rajdhani (12345)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDemoPnrSelect("9876543210", "Sealdah Duronto")}
                                      className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 py-1.5 rounded-lg text-[9px] font-mono font-bold text-slate-705 transition"
                                    >
                                      Demo Duronto (98765)
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleForceOverride}
                                    className="w-full bg-orange-100/60 hover:bg-orange-200 text-primary font-mono font-black text-[9px] py-1.5 rounded-lg uppercase tracking-wider"
                                  >
                                    ⚡ Override / Match Manual Seat
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Payment Selection checkboxes */}
                        <div className="space-y-1.5">
                          <label className="block text-[9.5px] font-bold text-slate-500 uppercase font-mono">
                            Select Secure Gateway
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] font-bold">
                            {[
                              { label: "⚡ UPI Instantly", val: "UPI" },
                              { label: "💳 Card (Razorpay)", val: "Card" },
                              { label: "🎒 Wallet Balance", val: "Wallet" },
                              { label: "💵 CoD (Cash)", val: "COD" }
                            ].map((pm) => (
                              <button
                                type="button"
                                key={pm.val}
                                onClick={() => onChangePaymentOption(pm.val as any)}
                                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${paymentOption === pm.val ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-slate-50 hover:bg-slate-100 border-slate-150 text-slate-650"}`}
                              >
                                <span>{pm.label}</span>
                                {paymentOption === pm.val && (
                                  <span className="text-emerald-400 font-extrabold">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 5. Mode-Specific Dynamic Order Information bar */}
                        <div className={`p-3.5 rounded-xl border text-xs text-left space-y-1.5 font-mono ${
                          selectedOrderMode === "delivery" ? "bg-orange-50/40 border-orange-200 text-orange-900" :
                          selectedOrderMode === "train" ? "bg-rose-50/40 border-rose-200 text-rose-900" :
                          selectedOrderMode === "pickup" ? "bg-amber-50/40 border-amber-200 text-amber-900" :
                          selectedOrderMode === "dine-in" ? "bg-indigo-50/40 border-indigo-200 text-indigo-900" :
                          "bg-sky-50/40 border-sky-200 text-sky-900"
                        }`}>
                          <div className="flex items-center gap-1.5 font-black uppercase text-[9px] tracking-wider text-slate-600">
                            <span>📋</span>
                            <span>Selected Channel Tracker</span>
                          </div>
                          
                          {selectedOrderMode === "delivery" && (
                            <div className="space-y-0.5 text-[10px] leading-tight">
                              <p className="text-slate-500 text-[9px] uppercase">📌 Coordinates destination:</p>
                              <p className="font-bold text-slate-950">{checkoutAddress || "Connaught Place Hub GPS Area"}</p>
                              <p className="text-slate-500 mt-1">🕒 Estimated arrival: <strong className="text-orange-600 font-bold">14 Mins Direct preparing & run</strong></p>
                            </div>
                          )}

                          {selectedOrderMode === "train" && (
                            <div className="space-y-0.5 text-[10px] leading-tight">
                              <p className="text-slate-500 text-[9px] uppercase">📌 Delivery Railway Station stop:</p>
                              <p className="font-bold text-slate-950">{pnrStationInfo?.stationName || "Kanpur Central Station (Platform 3)"}</p>
                              <p className="text-slate-500 mt-1 text-[9px] uppercase">📌 Seat Berth allocation:</p>
                              <p className="font-bold text-slate-950">{pnrStationInfo?.coach || "A1"} Coach / Seat {pnrStationInfo?.seat || "Platform"}</p>
                              <p className="text-slate-500 mt-1">🕒 Arrival window: <strong className="text-rose-600 font-bold">Automatic Real-time Train stop GPS lock</strong></p>
                            </div>
                          )}

                          {selectedOrderMode === "pickup" && (
                            <div className="space-y-0.5 text-[10px] leading-tight">
                              <p className="text-slate-500 text-[9px] uppercase">📌 Smart Retrieval Locker:</p>
                              <p className="font-bold text-slate-950">High-Temp Isolation Cabin Pod B</p>
                              <p className="text-slate-500 mt-1">🕒 Pickup counter time: <strong className="text-amber-600 font-bold">Ready within {pickupTimeEstimate || "15 mins"}</strong></p>
                            </div>
                          )}

                          {selectedOrderMode === "dine-in" && (
                            <div className="space-y-0.5 text-[10px] leading-tight">
                              <p className="text-slate-500 text-[9px] uppercase">📌 Tableside dining setup:</p>
                              <p className="font-bold text-slate-950">Table identifier: {dineInTableNumber || "Table 4"}</p>
                              <p className="text-slate-500 mt-1">🕒 Preparation speed: <strong className="text-indigo-600 font-bold">Direct stove tableside serving (12 mins)</strong></p>
                            </div>
                          )}

                          {selectedOrderMode === "in-car" && (
                            <div className="space-y-0.5 text-[10px] leading-tight">
                              <p className="text-slate-500 text-[9px] uppercase">📌 Smart Car Parking details:</p>
                              <p className="font-bold text-slate-950">Slot Bay: {inCarSpotNumber || "Bay 3"} | Vehicle Registration: {inCarVehiclePlate || "White SUV"}</p>
                              <p className="text-slate-500 mt-1">🕒 Runner bay ETA: <strong className="text-sky-600 font-bold">Window Sealed direct bay dispatch in 15 mins</strong></p>
                            </div>
                          )}
                        </div>

                        {/* Order Submit Action Trigger button */}
                        <button
                          onClick={onCheckoutSubmit}
                          className="w-full bg-primary hover:bg-orange-600 text-white font-mono text-[11px] font-black uppercase py-3.5 rounded-xl transition-all shadow-xl shadow-orange-500/15 flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-orange-500/25 active:scale-97"
                        >
                          <CreditCard className="w-4 h-4 text-white" />
                          <span>Place Food Order (₹{grandTotalResult})</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Bottom footer bar of drawer if items exist */}
              {cart.length > 0 && (
                <div className="bg-slate-900 border-t border-slate-800 p-4 text-white">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div>
                      <span className="text-slate-400 font-mono text-[9px] block uppercase font-bold">Order Grand Sum</span>
                      <strong className="text-base text-white font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                        ₹{grandTotalResult}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 text-[10px] font-bold block">★ Free Station Delivery</span>
                      <span className="text-[9px] text-slate-400 block font-mono">preparation: 14 mins</span>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
