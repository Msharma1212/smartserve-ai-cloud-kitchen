import React, { useState, useEffect } from "react";
import { MenuItem, CartItem, Order, Franchise, Rider, Employee } from "./types";
import CustomerHeader from "./components/CustomerHeader";
import CustomerFooter from "./components/CustomerFooter";
import HeroLanding from "./components/HeroLanding";
import UpiPaymentModal from "./components/UpiPaymentModal";
import PNROrdering from "./components/PNROrdering";
import PartnerWithUs from "./components/PartnerWithUs";
import CareersPage from "./components/CareersPage";
import CustomerDashboard from "./components/CustomerDashboard";
import EnterpriseHQ from "./components/EnterpriseHQ";
import EnterpriseKitchen from "./components/EnterpriseKitchen";
import EnterpriseRider from "./components/EnterpriseRider";
import EnterpriseEmployee from "./components/EnterpriseEmployee";
import AboutCompany from "./components/AboutCompany";
import ArchitectureMonitor from "./components/ArchitectureMonitor";
import AddCustomizationModal from "./components/AddCustomizationModal";
import LocationSystemModal from "./components/LocationSystemModal";
import CartDrawer from "./components/CartDrawer";
import LoginModal from "./components/LoginModal";
import ToastContainer, { ToastItem } from "./components/Toast";
import { 
  getTrainPositionInfo, 
  isStationPassed as libIsStationPassed, 
  checkIsServiceable as libCheckIsServiceable, 
  getLinearTimes 
} from "./lib/trainTracking";

import { ShoppingCart, LogIn, AlertCircle, Sparkles, MapPin, CheckCircle, ShieldCheck, CreditCard, ChevronRight, X, Navigation, Star, Clock, Car, Coffee, Train, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { io as socketIOClient } from "socket.io-client";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("ss_cart");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  
  // Auth state
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number>(1800);
  const [loginPhoneInput, setLoginPhoneInput] = useState<string>("");
  const [loginNameInput, setLoginNameInput] = useState<string>("");
  const [loginOtpInput, setLoginOtpInput] = useState<string>("");
  const [otpStep, setOtpStep] = useState<"phone" | "otp">("phone");
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (text: string, type: "success" | "info" | "error" = "success") => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Address and payment inputs
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [selectedBranchCode, setSelectedBranchCode] = useState("DEL-CP");
  const [paymentOption, setPaymentOption] = useState<"UPI" | "Card" | "Wallet" | "COD">("UPI");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  // Five Advanced Order Modes
  const [selectedOrderMode, setSelectedOrderMode] = useState<"dine-in" | "pickup" | "delivery" | "in-car" | "train">(() => {
    return (localStorage.getItem("ss_order_mode") as any) || "delivery";
  });
  const [dineInTableNumber, setDineInTableNumber] = useState("Table 4");
  const [inCarSpotNumber, setInCarSpotNumber] = useState("Bay 3");
  const [inCarVehiclePlate, setInCarVehiclePlate] = useState("UP32-AB-1234 (White Toyota)");
  const [pickupTimeEstimate, setPickupTimeEstimate] = useState("15 mins");

  // Redesigned scroll experience states
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isCheckoutExpandedMobile, setIsCheckoutExpandedMobile] = useState(false);
  const [isFloatingWidgetExpanded, setIsFloatingWidgetExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleScroll();
    handleResize();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("ss_order_mode", selectedOrderMode);
  }, [selectedOrderMode]);

  // Page Load Scroll to Top Fix
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const scrollToMenuCategories = () => {
    setTimeout(() => {
      const el = document.getElementById("menu-categories-anchor");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  // Train / Route integration
  const [pnrStationInfo, setPnrStationInfo] = useState<{
    pnr: string;
    trainNo: string;
    trainName: string;
    coach: string;
    seat: number;
    stationCode: string;
    stationName: string;
    routeStops?: any[];
  } | null>(null);

  const [trainPnrInput, setTrainPnrInput] = useState("");
  const [isFetchingPnr, setIsFetchingPnr] = useState(false);
  const [menuGlowActive, setMenuGlowActive] = useState(false);

  // Helper trigger to activate menu glow effect
  const triggerMenuGlow = () => {
    setMenuGlowActive(true);
    setTimeout(() => {
      setMenuGlowActive(false);
    }, 4500);
  };

  const [simulatedTime, setSimulatedTime] = useState("21:38");

  // Timer to auto-update station status and position every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedTime((prev) => {
        const [h, m] = prev.split(":").map(Number);
        let nMin = m + 1;
        let nHour = h;
        if (nMin >= 60) {
          nMin = 0;
          nHour = (nHour + 1) % 24;
        }
        return `${String(nHour).padStart(2, "0")}:${String(nMin).padStart(2, "0")}`;
      });
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const checkIsServiceable = (stop: { stationCode: string; stationName: string }) => {
    return libCheckIsServiceable(stop, franchises);
  };

  const isStationPassed = (departureTimeStr: string, stopCode?: string, stops?: any[]) => {
    return libIsStationPassed(departureTimeStr, simulatedTime, stops || pnrStationInfo?.routeStops, stopCode);
  };

  const mapStationToFranchiseCode = (stationCode: string, stationName: string) => {
    const code = (stationCode || "").toUpperCase();
    const name = (stationName || "").toLowerCase();
    
    if (code === "CNB" || name.includes("kanpur")) {
      return "CNB"; // Choose the primary Kanpur Central Kitchen block
    }
    if (code === "NDLS" || name.includes("delhi") || name.includes("connaught")) {
      return "DEL-CP"; // Choose Flagship Connaught Place or NDLS stop hub
    }
    return "CNB"; // Default fallback
  };

  // Helper function to fetch or simulate PNR status details with auto-scroll and auto-select
  const handleFetchPnr = async (pnrVal: string) => {
    const cleanPnr = pnrVal.trim();
    if (!/^[0-9]{10}$/.test(cleanPnr)) {
      addToast("Enter valid 10-digit PNR", "error");
      return;
    }
    
    setIsFetchingPnr(true);
    addToast("Fetching train details...", "info");
    
    // Simulate real-world IRCTC database API latency
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/train/pnr?pnrNumber=${cleanPnr}`);
        if (res.ok) {
          const d = await res.json();
          if (d.success && d.train) {
            const stops = d.train.routeStops || [];
            // Find optimal serviceable stop that hasn't passed
            const optimalStop = stops.find((s: any) => checkIsServiceable(s) && !isStationPassed(s.departureTime, s.stationCode))
              || stops.find((s: any) => checkIsServiceable(s))
              || stops[0];

            const targetBranch = mapStationToFranchiseCode(optimalStop?.stationCode, optimalStop?.stationName);

            setPnrStationInfo({
              pnr: d.train.pnr,
              trainNo: d.train.trainNo,
              trainName: d.train.trainName,
              coach: d.train.coach,
              seat: Number(d.train.seat) || 18,
              stationCode: optimalStop?.stationCode || "CNB",
              stationName: optimalStop?.stationName || "Kanpur Central Station",
              routeStops: stops
            });
            setSelectedBranchCode(targetBranch);

            if (d.fallback) {
              addToast("Unable to fetch live train data", "error");
            } else {
              addToast("PNR Verified ✅", "success");
            }
            triggerMenuGlow();
            setIsCheckoutExpandedMobile(false);
            scrollToMenuCategories();
            setIsFetchingPnr(false);
            return;
          }
        }
        throw new Error("Local fallback simulator triggered");
      } catch (err) {
        // Fallback simulated premium data (Offline lookup system)
        addToast("Unable to fetch live train data", "error");
        const fallbackName = cleanPnr === "9876543210" ? "Duronto Express" : cleanPnr === "4567890123" ? "Shatabdi Express" : "Rajdhani Express";
        const fallbackNo = cleanPnr === "9876543210" ? "12260" : cleanPnr === "4567890123" ? "12004" : "12301";
        
        const fallbackStops = [
          { stationCode: "NDLS", stationName: "New Delhi Railway Station", arrivalTime: "16:55", departureTime: "17:10", distanceKm: 0 },
          { stationCode: "CNB", stationName: "Kanpur Central (SmartServe Central Hub)", arrivalTime: "21:35", departureTime: "21:40", distanceKm: 440 },
          { stationCode: "PRYJ", stationName: "Prayagraj Junction", arrivalTime: "23:50", departureTime: "23:55", distanceKm: 630 },
          { stationCode: "PNBE", stationName: "Patna Junction stop", arrivalTime: "04:10", departureTime: "04:20", distanceKm: 980 },
          { stationCode: "HWH", stationName: "Howrah Junction", arrivalTime: "08:30", departureTime: "08:30", distanceKm: 1445 }
        ];

        const optimalStop = fallbackStops.find(s => checkIsServiceable(s) && !isStationPassed(s.departureTime, s.stationCode)) || fallbackStops[1];
        const targetBranch = mapStationToFranchiseCode(optimalStop?.stationCode, optimalStop?.stationName);

        setPnrStationInfo({
          pnr: cleanPnr,
          trainNo: fallbackNo,
          trainName: fallbackName,
          coach: "B3",
          seat: 18,
          stationCode: optimalStop?.stationCode || "CNB",
          stationName: optimalStop?.stationName || "Kanpur Central Station",
          routeStops: fallbackStops
        });
        setSelectedBranchCode(targetBranch); // Auto-select nearest matching active franchise
        triggerMenuGlow();
        setIsCheckoutExpandedMobile(false);
        scrollToMenuCategories();
      } finally {
        setIsFetchingPnr(false);
      }
    }, 850);
  };

  // Printed Order Receipt for animation
  const [printedOrderReceipt, setPrintedOrderReceipt] = useState<Order | null>(null);

  // UPI payment modal states
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiModalOrderId, setUpiModalOrderId] = useState("");
  const [upiModalOrder, setUpiModalOrder] = useState<any>(null);
  const [upiAmount, setUpiAmount] = useState(0);

  // Enterprise portal auth
  const [staffRole, setStaffRole] = useState<string>("Founder");
  const [staffBranchCode, setStaffBranchCode] = useState("DEL-CP");
  
  // Customization modal handles
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Dynamic state syncing from server lists
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [activeRidersPool, setActiveRidersPool] = useState<Rider[]>([]);

  // Local storage cache recovery and database sync check
  useEffect(() => {
    const savedPhone = localStorage.getItem("ss_customer_phone");
    const savedName = localStorage.getItem("ss_customer_name");
    const savedWBalance = localStorage.getItem("ss_wallet_balance");
    const savedToken = localStorage.getItem("ss_jwt_token");
    if (savedPhone) {
      setCustomerPhone(savedPhone);
      setCheckoutName(savedName || `Customer ${savedPhone.slice(-4)}`);
      setCheckoutPhone(savedPhone);
    }
    if (savedName) setCustomerName(savedName);
    if (savedWBalance) setWalletBalance(parseInt(savedWBalance) || 1800);

    const savedAddress = localStorage.getItem("ss_user_address");
    const savedBranch = localStorage.getItem("ss_selected_branch_code");
    if (savedAddress) {
      setCheckoutAddress(savedAddress);
    } else {
      // First website visit location permission flow
      setIsLocationModalOpen(true);
    }
    if (savedBranch) {
      setSelectedBranchCode(savedBranch);
    }

    fetchMenu();
    fetchOrdersList();
    fetchFranchiseBranches();
    fetchStaffLogs();

    if (savedToken) {
      fetchUserCartFromDB(savedToken);
    }
  }, []);

  // Synthesize realistic print micro-buzz sound
  const playPrintSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      let time = ctx.currentTime;
      
      for (let i = 0; i < 15; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        // randomize pitch slightly like stepping motor
        osc.frequency.setValueAtTime(140 + Math.random() * 25, time);
        gain.gain.setValueAtTime(0.012, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.05);
        time += 0.09;
      }
    } catch {
      // Graceful failover if blocked
    }
  };

  useEffect(() => {
    if (printedOrderReceipt) {
      playPrintSound();
    }
  }, [printedOrderReceipt]);

  // Connect and initialize Real-Time Socket.io client connections
  useEffect(() => {
    const socket = socketIOClient();

    socket.on("connect", () => {
      console.log("Socket.io real-time push streams activated ✓");
    });

    socket.on("order_progress", (updatedOrder: any) => {
      // Intelligently updates stages and rider coordinate drifts instantly
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    });

    socket.on("franchise_dashboard_update", () => {
      fetchOrdersList();
      fetchStaffLogs();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchUserCartFromDB = async (token: string) => {
    try {
      const res = await fetch("/api/cart", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cart && data.cart.length > 0) {
          setCart(data.cart);
          addToast("Recovered your saved items from database! 🛒", "info");
        }
      }
    } catch (err) {
      console.error("Cart retrieval failed:", err);
    }
  };

  const syncUserCartToDB = async (currentCart: CartItem[]) => {
    const token = localStorage.getItem("ss_jwt_token");
    if (!token) return;

    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cart: currentCart })
      });
    } catch (err) {
      console.error("Cart sync failed:", err);
    }
  };

  // Sync cart automatically to save persistent copy offline & database
  useEffect(() => {
    localStorage.setItem("ss_cart", JSON.stringify(cart));
    syncUserCartToDB(cart);
  }, [cart]);

  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        const data = await res.json();
        setMenu(data.menu);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrdersList = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFranchiseBranches = async () => {
    try {
      const res = await fetch("/api/franchises");
      if (res.ok) {
        const data = await res.json();
        setFranchises(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStaffLogs = async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setEmployeesList(data.employees);
        setActiveRidersPool(data.activePool);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Background active tick polling every 7s to reflect kitchen progress
  useEffect(() => {
    const timer = setInterval(() => {
      fetchOrdersList();
      fetchStaffLogs();
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handleApplyLogin = async () => {
    if (otpStep === "phone") {
      if (loginPhoneInput.length < 10) {
        addToast("Please enter a valid 10 digit phone number.", "error");
        return;
      }
      
      try {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: loginPhoneInput, name: loginNameInput })
        });
        if (res.ok) {
          const data = await res.json();
          setOtpStep("otp");
          if (data.debugPin) {
            addToast(`[Dev OTP Passcode: ${data.debugPin}] Secure security code dispatched to +91 ${loginPhoneInput}! 💬`, "info");
          } else {
            addToast(`Secure OTP code dispatched via SMS carrier network to +91 ${loginPhoneInput}! 💬`, "info");
          }
        } else {
          addToast("Carrier network failure. Could not transmit SMS OTP.", "error");
        }
      } catch (err) {
        addToast("Network failure connection to security gateway.", "error");
      }
    } else {
      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: loginPhoneInput, otp: loginOtpInput, name: loginNameInput })
        });
        if (res.ok) {
          const data = await res.json();
          
          localStorage.setItem("ss_jwt_token", data.token);
          localStorage.setItem("ss_customer_phone", data.user.phone);
          localStorage.setItem("ss_customer_name", data.user.name);
          localStorage.setItem("ss_wallet_balance", data.user.walletBalance.toString());

          setCustomerPhone(data.user.phone);
          setCustomerName(data.user.name);
          setWalletBalance(data.user.walletBalance);

          setCheckoutName(data.user.name);
          setCheckoutPhone(data.user.phone);

          setIsLoginOpen(false);
          setOtpStep("phone");
          setLoginOtpInput("");
          setLoginPhoneInput("");
          setLoginNameInput("");

          addToast(`Authenticated successfully! Welcome, ${data.user.name}! ✨`, "success");

          // Sync user cart from database
          fetchUserCartFromDB(data.token);
        } else {
          const errData = await res.json();
          addToast(errData.error || "Incorrect validation passcode.", "error");
        }
      } catch (err) {
        addToast("Authorization failover occurred.", "error");
      }
    }
  };

  const handleLogoutCustomer = () => {
    setCustomerPhone("");
    setCustomerName("");
    localStorage.removeItem("ss_customer_phone");
    localStorage.removeItem("ss_customer_name");
    localStorage.removeItem("ss_jwt_token");
    localStorage.removeItem("ss_wallet_balance");
    addToast("Logged out successfully.", "info");
  };

  const navigateToPage = (destPage: string, triggerCategory?: string) => {
    setCurrentPage(destPage);
    if (triggerCategory) {
      setSelectedCategory(triggerCategory);
    } else if (destPage === "order") {
      setSelectedCategory("All");
    }
  };

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    const existingIndex = cart.findIndex((i) => i.id === item.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].qty += 1;
      setCart(updated);
    } else {
      setCart([...cart, item]);
    }
    setCustomizingItem(null);
    addToast(`${item.name} added to your Selected Basket! 🍕`, "success");
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    const updated = cart.map((i) => {
      if (i.id === id) {
        const nextQty = i.qty + delta;
        return { ...i, qty: nextQty < 1 ? 1 : nextQty };
      }
      return i;
    }).filter((i) => i.qty > 0);
    
    setCart(updated);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter((i) => i.id !== id));
    addToast("Item removed from your basket.", "info");
  };

  // New advanced premium cost valuations
  const cartSubtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  
  let couponDiscountSum = 0;
  if (appliedCoupon === "FESTIVE50") couponDiscountSum = Math.min(cartSubtotal * 0.5, 150);
  if (appliedCoupon === "FIRST100") couponDiscountSum = Math.min(cartSubtotal, 100);
  if (appliedCoupon === "SMARTAI") couponDiscountSum = Math.min(cartSubtotal * 0.15, 60);

  // Exact CGST (9%), SGST (9%), Service Charge (2%)
  const cgstRate = 0.09;
  const sgstRate = 0.09;
  const serviceChargeRate = 0.02;

  const cgstTax = Math.round(cartSubtotal * cgstRate);
  const sgstTax = Math.round(cartSubtotal * sgstRate);
  const serviceCharge = Math.round(cartSubtotal * serviceChargeRate);
  const cartTaxes = cgstTax + sgstTax + serviceCharge;

  // Delivery charge is 30 unless subtotal is >= 500 (Free), but if a coupon is applied, it remains 30
  const deliverySurcharge = (cart.length > 0) 
    ? (appliedCoupon ? 30 : (cartSubtotal >= 500 ? 0 : 30)) 
    : 0;

  const grandTotalResult = cartSubtotal + cartTaxes + deliverySurcharge - couponDiscountSum;

  const handleApplyCouponCode = () => {
    const code = couponCode.trim().toUpperCase();
    if (["FESTIVE50", "FIRST100", "SMARTAI"].includes(code)) {
      setAppliedCoupon(code);
      addToast(`Promo code '${code}' successfully matched! Discount deducted. 🏷️`, "success");
    } else {
      addToast("Invalid coupon code. Try FESTIVE50 or FIRST100.", "error");
    }
  };

  // Helper failure toast alerter
  const showToast = (msg: string) => {
    addToast(msg, "error");
  };

  const showSuccessToast = (msg: string) => {
    addToast(msg, "success");
  };

  const showErrorToast = (msg: string) => {
    addToast(msg, "error");
  };

  const openBillAnimation = (order: any) => {
    finalizeCheckoutUI(order, true);
  };

  const finalizeCheckoutUI = async (savedOrder: any, skipToast: boolean = false) => {
    // Subtract wallet if selected
    if (paymentOption === "Wallet") {
      const nextBal = walletBalance - grandTotalResult;
      setWalletBalance(nextBal);
      localStorage.setItem("ss_wallet_balance", nextBal.toString());

      const token = localStorage.getItem("ss_jwt_token");
      if (token) {
        await fetch("/api/wallet/recharge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ amount: -grandTotalResult })
        });
      }
    }

    // Set the printed receipt details for an animated print visual!
    if (savedOrder) {
      setPrintedOrderReceipt(savedOrder);
    }

    // Clean values
    setCart([]);
    setAppliedCoupon("");
    setCouponCode("");
    setPnrStationInfo(null);
    setCheckoutAddress("");
    setIsCartDrawerOpen(false);

    // Sync list
    fetchOrdersList();
    
    if (!skipToast) {
      addToast(`Order placed successfully! Mode: ${selectedOrderMode.toUpperCase()}. 🛵`, "success");
    }
    setCurrentPage("dashboard");
  };

  // Perform operational submit checkout using premium Razorpay checkout or other options
  const handleCheckoutSubmit = async () => {
    if (!checkoutName.trim() || !checkoutPhone.trim()) {
      addToast("Please login or verify phone code first to checkout.", "error");
      return;
    }
    if (selectedOrderMode === "train") {
      const pnr = pnrStationInfo?.pnr;
      const station = pnrStationInfo?.stationName;
      const seat = pnrStationInfo?.seat;
      if (!pnr || !station || !seat) {
        addToast("Complete train details before placing order", "error");
        return;
      }

      const stops = pnrStationInfo?.routeStops || [];
      const chosenStop = stops.find((s: any) => s.stationName === station || s.stationCode === pnrStationInfo?.stationCode);
      if (chosenStop) {
        const isServiceable = checkIsServiceable(chosenStop);
        const isPassed = isStationPassed(chosenStop.departureTime);
        if (!isServiceable) {
          addToast("Food service is not active at the selected station stop", "error");
          return;
        }
        if (isPassed) {
          addToast("The train has already passed the selected station stop. Order delivery is impossible.", "error");
          return;
        }
      } else {
        const isServiceable = checkIsServiceable({ stationCode: pnrStationInfo?.stationCode || "", stationName: station || "" });
        if (!isServiceable) {
          addToast("Please select a valid, active and serviceable delivery station stop.", "error");
          return;
        }
      }
    } else if (selectedOrderMode === "delivery" && !checkoutAddress.trim()) {
      addToast("Please specify delivery destination address of your desk.", "error");
      return;
    }

    if (paymentOption === "Wallet" && walletBalance < grandTotalResult) {
      addToast("Insufficient wallet credits. Recharge credits in your dashboard first.", "error");
      return;
    }

    const cartItems = cart.map((i) => ({
      id: i.menuId,
      name: `${i.name} (${i.size})`,
      price: i.price,
      qty: i.qty,
      category: i.category
    }));

    const totalAmount = grandTotalResult;
    const selectedMode = selectedOrderMode;
    const address = selectedOrderMode === "delivery" ? checkoutAddress : (selectedOrderMode === "in-car" ? `Car Section Spot: ${inCarSpotNumber}` : "Dine-In Table: " + dineInTableNumber);
    
    // 1. ROOT ISSUE FIX (TRAIN MODE)
    const selectedStation = selectedOrderMode === "train" && pnrStationInfo ? { name: pnrStationInfo.stationName } : null;
    const coach = selectedOrderMode === "train" && pnrStationInfo ? pnrStationInfo.coach : "";
    const seatNumber = selectedOrderMode === "train" && pnrStationInfo ? pnrStationInfo.seat : "";

    const orderData = {
      items: cartItems,
      total: totalAmount,
      orderType: selectedMode,
      station: selectedStation?.name || "",
      seat: `${coach || ""}-${seatNumber || ""}`,
      address: address || "",
      paymentOption: paymentOption,
      pnrNumber: pnrStationInfo?.pnr || "",
      trainNumber: pnrStationInfo?.trainNo || "",
      trainName: pnrStationInfo?.trainName || "",
      branchCode: selectedBranchCode // Pass active selected branch
    };

    // Add console log before sending
    console.log("SENDING ORDER:", orderData);
    console.log("FINAL ORDER DATA:", orderData);

    let successDetected = false;
    try {
      const token = localStorage.getItem("ss_jwt_token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/order/place-order", {
        method: "POST",
        headers,
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      // 6. DEBUG LOGGING: Log both status and parsed response
      console.log("API STATUS:", res.status);
      console.log("API RESPONSE:", data);

      // 5. STRICT RESPONSE VALIDATION: MUST verify both status and success flag
      if (res.ok && data.success === true) {
        successDetected = true;

        if (paymentOption === "UPI") {
          // DO NOT trigger bill animation immediately!
          // Open UPI scan and pay Modal with state variables
          setUpiModalOrderId(data.order.id);
          setUpiAmount(totalAmount);
          setUpiModalOrder(data.order);
          setIsUpiModalOpen(true);
          
          // Clear cart drawer, but keep checkout records intact until UPI settles!
          setCart([]);
          setAppliedCoupon("");
          setCouponCode("");
          setIsCartDrawerOpen(false);
          fetchOrdersList();
          return;
        }

        if (paymentOption === "Card" && data.razorpayOrderId) {
          // Open Razorpay.
          // Note we do NOT generate invoice or trigger openBillAnimation until verification succeeds!
          const openRazorpay = (razorpayOrderId: string) => {
            const options = {
              key: data.razorpayKey || "rzp_test_5d6e7f8g9h", 
              amount: totalAmount * 100,
              currency: "INR",
              name: "SmartServe Cloud Kitchens",
              description: "Production SaaS Checkout Flow",
              order_id: razorpayOrderId,
              handler: async function (response: any) {
                try {
                  addToast("Verifying payment transaction signature...", "info");
                  const verifyRes = await fetch("/api/payment/verify-signature", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      razorpayOrderId: response.razorpay_order_id,
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpaySignature: response.razorpay_signature
                    })
                  });
                  
                  const verificationResult = await verifyRes.json();
                  if (verificationResult.success) {
                    addToast("Payment successful! Settle invoice...", "success");

                    // Webhook style signature confirmation callback
                    const confirmRes = await fetch("/api/payment/confirm-payment", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: data.order.id, paymentOption: "Card" })
                    });
                    const confirmData = await confirmRes.json();
                    
                    if (confirmData.success) {
                      openBillAnimation(confirmData.order || data.order);
                    } else {
                      openBillAnimation(data.order);
                    }
                    setCart([]);
                    setAppliedCoupon("");
                    setCouponCode("");
                    setIsCartDrawerOpen(false);
                    fetchOrdersList();
                    setCurrentPage("dashboard");
                  } else {
                    addToast("Payment signature verification failed. Cryptographic mismatch.", "error");
                  }
                } catch {
                  addToast("Server failed to cryptographically sign payment signature verification.", "error");
                }
              },
              prefill: {
                name: checkoutName,
                contact: checkoutPhone
              },
              theme: {
                color: "#f97316"
              }
            };

            const scriptId = "razorpay-checkout-script-node";
            if (document.getElementById(scriptId)) {
              const rzp = new (window as any).Razorpay(options);
              rzp.open();
            } else {
              const script = document.createElement("script");
              script.id = scriptId;
              script.src = "https://checkout.razorpay.com/v1/checkout.js";
              script.async = true;
              script.onload = () => {
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
              };
              document.body.appendChild(script);
            }
          };

          openRazorpay(data.razorpayOrderId);
          return;
        }

        if (paymentOption === "Wallet") {
          // Call wallet PAY endpoint
          try {
            const token = localStorage.getItem("ss_jwt_token");
            const payRes = await fetch("/api/wallet/pay", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ amount: totalAmount, description: `SmartServe Settle #${data.order.id}` })
            });

            if (payRes.ok) {
              const payData = await payRes.json();
              if (payData.success) {
                // Settle order Paid
                await fetch("/api/payment/confirm-payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: data.order.id, paymentOption: "Wallet" })
                });

                setWalletBalance(payData.balance);
                localStorage.setItem("ss_wallet_balance", payData.balance.toString());
                
                showSuccessToast("Wallet payment successful! Saturated credits subtracted.");
                openBillAnimation({ ...data.order, paymentStatus: "Paid" });
                
                setCart([]);
                setAppliedCoupon("");
                setCouponCode("");
                setIsCartDrawerOpen(false);
                fetchOrdersList();
                setCurrentPage("dashboard");
                return;
              }
            }
            addToast("Wallet deduction rejected by core clearing system.", "error");
            return;
          } catch {
            addToast("Wallet payment transport loss. Settle manual COD instead.", "error");
            return;
          }
        }

        // COD OR OTHER MODE:
        showSuccessToast("Order placed successfully! Settle cash on delivery. 🛵");
        openBillAnimation(data.order);
        setCart([]);
        setAppliedCoupon("");
        setCouponCode("");
        setIsCartDrawerOpen(false);
        fetchOrdersList();
        setCurrentPage("dashboard");
      } else {
        // FAILURE FLOW
        showErrorToast(data.message || "Unable to place order, please try again");
      }

    } catch (e) {
      console.error("CORS / Connection failed to place-order backend:", e);
      // 7. REMOVE FALSE RETRY TRIGGER: Ensure retry toast is ONLY shown on real failure
      if (!successDetected) {
        showErrorToast("Unable to place order, please try again");
      }
    }
  };

  // Staff action trigger
  const handleUpdateOrderStage = async (orderId: string, nextStage: number) => {
    try {
      const res = await fetch("/api/orders/update-stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, stage: nextStage })
      });
      if (res.ok) {
        fetchOrdersList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Client side categorizations
  const [filterVegCategory, setFilterVegCategory] = useState<"All" | "Veg" | "Jain">("All");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="applet-viewport-root">
      
      {/* Dynamic tech watcher architecture sidebar monitor overlay */}
      {/* <ArchitectureMonitor /> */}

      {/* Main navigation Header */}
      <CustomerHeader
        currentPage={currentPage}
        onNavigate={navigateToPage}
        cartCount={cart.reduce((s, c) => s + c.qty, 0)}
        customerPhone={customerPhone}
        onOpenLogin={() => {
          setIsLoginOpen(true);
          setOtpStep("phone");
        }}
        onLogoutCustomer={handleLogoutCustomer}
        isStaff={false}
        userAddress={checkoutAddress}
        onOpenLocation={() => setIsLocationModalOpen(true)}
        onOpenCart={() => setIsCartDrawerOpen(true)}
      />

      {/* Main layout container content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <AnimatePresence mode="wait">
          
          {/* CUSTOMER GREETINGS PAGE */}
          {currentPage === "home" && (
            <HeroLanding
              menu={menu}
              onNavigate={navigateToPage}
              selectedOrderMode={selectedOrderMode}
              onChangeOrderMode={setSelectedOrderMode}
              dineInTableNumber={dineInTableNumber}
              onChangeDineInTableNumber={setDineInTableNumber}
              inCarSpotNumber={inCarSpotNumber}
              onChangeInCarSpot={setInCarSpotNumber}
              inCarVehiclePlate={inCarVehiclePlate}
              onChangeInCarVehiclePlate={setInCarVehiclePlate}
              pickupTimeEstimate={pickupTimeEstimate}
              onChangePickupTimeEstimate={setPickupTimeEstimate}
              pnrStationInfo={pnrStationInfo}
              setPnrStationInfo={setPnrStationInfo}
              setSelectedBranchCode={setSelectedBranchCode}
              addToast={addToast}
              checkoutAddress={checkoutAddress}
              onChangeCheckoutAddress={setCheckoutAddress}
            />
          )}

          {/* DYNAMIC ORDER SELECTION / MENUS PAGE */}
          {currentPage === "order" && (() => {
            // Scroll-driven animation math
            let checkoutScale = 1;
            let checkoutOpacity = 1;
            let checkoutBlur = 0;
            let checkoutTranslateY = 0;
            let showCompactSticky = false;

            if (scrollY < 150) {
              checkoutScale = 1;
              checkoutOpacity = 1;
              checkoutBlur = 0;
              checkoutTranslateY = 0;
            } else if (scrollY >= 150 && scrollY < 300) {
              const fraction = (scrollY - 150) / 150;
              checkoutScale = 1 - fraction * 0.05;
              checkoutOpacity = 1 - fraction * 0.25;
              checkoutBlur = fraction * 4;
              checkoutTranslateY = fraction * -15;
            } else {
              checkoutScale = 0.95;
              checkoutOpacity = Math.max(0, 1 - (scrollY - 300) / 100);
              checkoutBlur = 4;
              checkoutTranslateY = -15 - (scrollY - 300) * 0.25;
              showCompactSticky = true;
            }

            return (
              <div className="relative w-full text-slate-850" id="order-page-root">
                {/* Parallax Background Railway Track Graphics */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[400px] overflow-hidden pointer-events-none opacity-[0.06] select-none"
                  style={{ transform: !isMobile ? `translateY(${scrollY * 0.15}px)` : "none" }}
                >
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 1000 400" fill="none" stroke="currentColor">
                    <path d="M-100,100 C200,120 400,50 600,180 C800,310 900,150 1200,170" strokeWidth="6" strokeDasharray="4 8" />
                    <path d="M-100,108 C200,128 400,58 600,188 C800,318 900,158 1200,178" strokeWidth="6" strokeDasharray="4 8" />
                    <path d="M-100,104 C200,124 400,54 600,184 C800,314 900,154 1200,174" strokeWidth="1" strokeDasharray="1 15" strokeLinecap="round" />
                    <path d="M-100,280 C300,200 500,350 800,200 C1000,100 1100,250 1200,220" strokeWidth="4" strokeDasharray="3 6" />
                    <path d="M-100,286 C300,206 500,356 800,206 C1000,106 1100,256 1200,226" strokeWidth="4" strokeDasharray="3 6" />
                    <circle cx="280" cy="115" r="8" fill="currentColor" className="text-amber-500 animate-pulse" />
                    <circle cx="585" cy="180" r="10" fill="currentColor" className="text-amber-500" stroke="white" strokeWidth="2" />
                    <circle cx="830" cy="180" r="8" fill="currentColor" className="text-red-500" />
                  </svg>
                </div>

                {/* COMPACT STICKY MODE & PROGRESS TOP BAR PANEL */}
                <AnimatePresence>
                  {(!isMobile && scrollY >= 350) || (isMobile && !isCheckoutExpandedMobile) ? (
                    <motion.div
                      initial={{ y: -80, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -80, opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="sticky top-16 z-35 -mx-4 px-4 py-2 mt-2 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-md rounded-b-2xl mb-4 max-w-7xl mx-auto"
                      id="compact-sticky-top-panel"
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
                        {/* Active Mode Summary Card - Mockup Result */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="p-2.5 rounded-xl bg-orange-50 text-slate-800 flex items-center justify-center text-xl shadow-inner shrink-0 border border-orange-100 animate-pulse">
                            {selectedOrderMode === "train" && "🚆"}
                            {selectedOrderMode === "delivery" && "🛵"}
                            {selectedOrderMode === "dine-in" && "🍽️"}
                            {selectedOrderMode === "in-car" && "🚗"}
                            {selectedOrderMode === "pickup" && "🎒"}
                          </div>
                          <div className="text-left font-sans">
                            <span className="text-[9px] font-mono leading-none font-black text-primary uppercase block tracking-wider">
                              {selectedOrderMode === "train" && "Train Berth Delivery Active"}
                              {selectedOrderMode === "delivery" && "GPS Dispatch Delivery Active"}
                              {selectedOrderMode === "dine-in" && "Tableside Dine-In Service"}
                              {selectedOrderMode === "in-car" && "Drive-In Car Service"}
                              {selectedOrderMode === "pickup" && "Counter Instant Pickup"}
                            </span>
                            <strong className="text-xs text-slate-800 block mt-0.5 truncate max-w-[210px] sm:max-w-xs font-black">
                              {selectedOrderMode === "train" && pnrStationInfo && `Coach ${pnrStationInfo.coach} / Seat ${pnrStationInfo.seat} • ${pnrStationInfo.trainNo}`}
                              {selectedOrderMode === "train" && !pnrStationInfo && "PNR details not set"}
                              {selectedOrderMode === "delivery" && (checkoutAddress || "No dispatch address set")}
                              {selectedOrderMode === "dine-in" && (dineInTableNumber || "Specify table")}
                              {selectedOrderMode === "in-car" && `${inCarSpotNumber} • ${inCarVehiclePlate}`}
                              {selectedOrderMode === "pickup" && `Pickup in ${pickupTimeEstimate}`}
                            </strong>
                            {pnrStationInfo && selectedOrderMode === "train" && (
                              <span className="text-[9px] text-emerald-655 font-mono font-medium block text-emerald-600">
                                Junction Stop: {pnrStationInfo.stationName} ({pnrStationInfo.stationCode})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sticky Mode Selector Compact Pill Bar */}
                        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase hidden md:inline">Switch Channel:</span>
                          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                            {[
                              { id: "delivery", icon: "🛵", label: "Delivery" },
                              { id: "dine-in", icon: "🍽️", label: "Dine-In" },
                              { id: "in-car", icon: "🚗", label: "In-Car" },
                              { id: "pickup", icon: "🎒", label: "Pickup" },
                              { id: "train", icon: "🚆", label: "Train" }
                            ].map((m) => (
                              <button
                                key={m.id}
                                onClick={() => {
                                  setSelectedOrderMode(m.id as any);
                                  if (m.id === "train") setSelectedBranchCode("KNP-JN");
                                  addToast(`Switched channel to ${m.label}!`, "info");
                                }}
                                className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs transition-all active:scale-95 cursor-pointer ${
                                  selectedOrderMode === m.id
                                    ? "bg-slate-900 border border-slate-950 text-white shadow-md font-bold scale-110" 
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                }`}
                                title={m.label}
                              >
                                {m.icon}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => {
                              if (isMobile) {
                                setIsCheckoutExpandedMobile(true);
                              } else {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }
                            }}
                            className="bg-primary hover:bg-primary-hover active:scale-95 text-white font-mono font-black text-[9.5px] uppercase px-3 py-2 rounded-xl transition-all shadow-md shadow-orange-500/10 shrink-0 cursor-pointer"
                          >
                            Configure
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Mobile Quick Config Access Bar */}
                {isMobile && (
                  <div className="flex items-center justify-between bg-white border border-slate-150 rounded-2xl p-3.5 shadow-sm mb-4">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold tracking-wider block">Active Channel Mode</span>
                      <span className="text-xs font-black flex items-center gap-1.5 mt-0.5 text-slate-800">
                        {selectedOrderMode === "train" && "🚆 Train Berth Delivery"}
                        {selectedOrderMode === "delivery" && "🛵 GPS Address Delivery"}
                        {selectedOrderMode === "dine-in" && "🍽️ Tableside Dine-In"}
                        {selectedOrderMode === "in-car" && "🚗 In-Car Drive-In Basket"}
                        {selectedOrderMode === "pickup" && "🎒 Counter Fast Pickup"}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsCheckoutExpandedMobile(!isCheckoutExpandedMobile)}
                      className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black text-[9.5px] uppercase font-mono px-3.5 py-2 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer border border-transparent"
                    >
                      {isCheckoutExpandedMobile ? "Close Setup" : "Edit Setup"}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-800">
                  
                  {/* Menu and selector list column */}
                  <div className="lg:col-span-12 space-y-6">

                    {/* DYNAMIC SCROLL TRANSITION WRAPPER ON THE CHECKOUT BAR */}
                    {(!isMobile || isCheckoutExpandedMobile) && (
                      <motion.div
                        style={!isMobile ? {
                          scale: checkoutScale,
                          opacity: checkoutOpacity,
                          filter: `blur(${checkoutBlur}px)`,
                          transform: `translateY(${checkoutTranslateY}px)`,
                          pointerEvents: scrollY >= 320 ? "none" : "auto",
                          height: scrollY >= 350 ? 0 : "auto",
                          overflow: "hidden",
                          marginBottom: scrollY >= 350 ? 0 : "1.5rem"
                        } : {}}
                        className="w-full origin-top"
                      >
                        <div className="sticky top-[73px] z-20 -mx-4 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-md mb-6 rounded-b-2xl">
                          <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-mono font-black tracking-wider uppercase text-primary block leading-none">SmartServe Multi-Channel Kitchens</span>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mt-1">Select Active Checkout mode</h3>
                      </div>
                      <span className="text-[10px] bg-slate-900 text-white font-mono font-bold px-3 py-1 rounded-full uppercase shrink-0">
                        ⚡ Mode: {selectedOrderMode.replace("-", " ")}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                      {[
                        {
                          id: "delivery",
                          title: "🛵 GPS Delivery",
                          desc: "Direct to door",
                          icon: <MapPin className="w-5 h-5 text-orange-500" />,
                          bg: "hover:bg-orange-50/50 border-slate-150",
                          activeBg: "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-600 text-white shadow-lg shadow-orange-500/15"
                        },
                        {
                          id: "dine-in",
                          title: "🍽️ Dine-In",
                          desc: "At table service",
                          icon: <Coffee className="w-5 h-5 text-indigo-500" />,
                          bg: "hover:bg-indigo-50/50 border-slate-150",
                          activeBg: "bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/15"
                        },
                        {
                          id: "in-car",
                          title: "🚗 In-Car",
                          desc: "Park & eat at bay",
                          icon: <Car className="w-5 h-5 text-sky-500" />,
                          bg: "hover:bg-sky-50/50 border-slate-150",
                          activeBg: "bg-gradient-to-br from-sky-500 to-sky-600 border-sky-600 text-white shadow-lg shadow-sky-500/15"
                        },
                        {
                          id: "pickup",
                          title: "🎒 Counter Pickup",
                          desc: "Zero wait carry",
                          icon: <Clock className="w-5 h-5 text-amber-500" />,
                          bg: "hover:bg-amber-50/50 border-slate-150",
                          activeBg: "bg-gradient-to-br from-amber-500 to-amber-600 border-amber-600 text-white shadow-lg shadow-amber-500/15"
                        },
                        {
                          id: "train",
                          title: "🚆 Train Berth",
                          desc: "Berth food on track",
                          icon: <Train className="w-5 h-5 text-red-500" />,
                          bg: "hover:bg-blue-50/50 border-slate-150",
                          activeBg: "bg-gradient-to-br from-slate-900 to-slate-950 border-slate-950 text-white shadow-lg shadow-slate-900/40"
                        }
                      ].map((mode) => {
                        const isSelected = selectedOrderMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => {
                              setSelectedOrderMode(mode.id as any);
                              // Auto update branch for train if switching to train to ensure correct cooking hub
                              if (mode.id === "train") {
                                setSelectedBranchCode("KNP-JN");
                              } else {
                                // Non-train modes immediately trigger scroll to explore active categories
                                scrollToMenuCategories();
                              }
                              addToast(`Channel mode updated to ${mode.id.replace("-", " ").toUpperCase()}`, "success");
                            }}
                            className={`p-3 rounded-xl border text-left transition-all duration-300 transform active:scale-95 cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? mode.activeBg + " border-transparent font-black scale-[1.02]"
                                : "bg-white hover:shadow-md border-slate-205 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className={`p-1.5 rounded-lg ${isSelected ? "bg-white/10" : "bg-slate-50"}`}>
                                {mode.icon}
                              </span>
                              {isSelected && <span className="h-2 w-2 bg-white rounded-full animate-ping" />}
                            </div>
                            <div>
                              <p className="text-xs font-black tracking-tight">{mode.title}</p>
                              <p className={`text-[9px] ${isSelected ? "text-white/85" : "text-slate-400"} font-medium`}>
                                {mode.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* CONTEXTUAL INLINE CONFIGURATION CARD */}
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      {selectedOrderMode === "dine-in" && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
                          <div>
                            <span className="text-[9px] text-indigo-650 uppercase font-bold block font-mono">Dine-In Configuration</span>
                            <span className="text-slate-600 block mt-0.5">Please specify your designated serving table number below so we route the carrier to the tableside:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={dineInTableNumber}
                              onChange={(e) => setDineInTableNumber(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  if (dineInTableNumber.trim()) {
                                    addToast(`Table confirmed: ${dineInTableNumber}. Ready to order!`, "success");
                                    scrollToMenuCategories();
                                  }
                                }
                              }}
                              placeholder="e.g. Table 4"
                              className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none focus:border-indigo-300 w-32"
                            />
                            <button
                              onClick={() => {
                                if (!dineInTableNumber.trim()) {
                                  addToast("Please provide your Table number.", "error");
                                  return;
                                }
                                addToast(`Table confirmed: ${dineInTableNumber}. Ready to order!`, "success");
                                scrollToMenuCategories();
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-bold text-[10px] uppercase font-mono px-3.5 py-1.5 rounded-lg shadow-sm cursor-pointer shrink-0"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedOrderMode === "pickup" && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
                          <div>
                            <span className="text-[9px] text-amber-655 uppercase font-bold block font-mono text-amber-650">Counter Pickup Schedule</span>
                            <span className="text-slate-600 block mt-0.5">Dishes are kept inside high-temperature safe preservation lockers. Choose expected pick timing:</span>
                          </div>
                          <div className="flex gap-1.5">
                            {["15 mins", "30 mins", "45 mins", "Later"].map((time) => (
                              <button
                                key={time}
                                onClick={() => {
                                  setPickupTimeEstimate(time);
                                  addToast(`Pickup scheduled for ${time}. Ready to explore kinds!`, "success");
                                  scrollToMenuCategories();
                                }}
                                className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                  pickupTimeEstimate === time
                                    ? "bg-amber-500 border-amber-500 text-white shadow-xs"
                                    : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedOrderMode === "in-car" && (
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-sky-650 uppercase font-bold block font-mono">Drive-In Convection Service</span>
                            <span className="text-slate-600 block">Our runners will bring sealed heatproof packaging right to your slot bay:</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-mono font-bold">Bay Slot:</span>
                              <input
                                type="text"
                                value={inCarSpotNumber}
                                onChange={(e) => setInCarSpotNumber(e.target.value)}
                                placeholder="e.g. Bay 3"
                                className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold w-24 outline-none focus:border-sky-300"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-mono font-bold">Car Tag/Plate:</span>
                              <input
                                type="text"
                                value={inCarVehiclePlate}
                                onChange={(e) => setInCarVehiclePlate(e.target.value)}
                                placeholder="e.g. UP32-AB-1234"
                                className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold w-40 outline-none focus:border-sky-300"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    if (inCarSpotNumber && inCarVehiclePlate) {
                                      addToast(`Spot & Vehicle plate details saved!`, "success");
                                      scrollToMenuCategories();
                                    }
                                  }
                                }}
                              />
                            </div>
                            <button
                              onClick={() => {
                                if (!inCarSpotNumber || !inCarVehiclePlate) {
                                  addToast("Please input both Bay slot and Car plate.", "error");
                                  return;
                                }
                                addToast(`Spot & Vehicle plate details saved!`, "success");
                                scrollToMenuCategories();
                              }}
                              className="bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all text-white font-bold text-[10px] uppercase font-mono px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedOrderMode === "delivery" && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-[9px] text-orange-650 uppercase font-bold block font-mono">Standard GPS Delivery dispatch</span>
                            <span className="text-slate-600 block mt-0.5">Sealed packaging sent with rider, monitored via live telemetry coordinates:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={checkoutAddress}
                              onChange={(e) => setCheckoutAddress(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  if (checkoutAddress.trim()) {
                                    addToast("Delivery coordinates saved!", "success");
                                    scrollToMenuCategories();
                                  }
                                }
                              }}
                              placeholder="E.g. Room 42, Floor 2, DLF Cyber City..."
                              className="bg-white border border-slate-202 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 outline-none w-64 focus:border-orange-300"
                            />
                            <button
                              onClick={() => {
                                if (!checkoutAddress.trim()) {
                                  addToast("Please provide a delivery address.", "error");
                                  return;
                                }
                                addToast("Delivery coordinates saved!", "success");
                                scrollToMenuCategories();
                              }}
                              className="bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white font-bold text-[10px] uppercase font-mono px-3.5 py-1.5 rounded-lg shadow-sm cursor-pointer shrink-0"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedOrderMode === "train" && (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                            <div>
                              <span className="text-[9px] text-amber-600 uppercase font-bold block font-mono">🚆 Train Berth Delivery (IRCTC Active Stop)</span>
                              <span className="text-slate-600 block mt-0.5">Matched food items will be delivered direct to your station stop berth:</span>
                            </div>
                            {pnrStationInfo ? (
                              <div className="space-y-3 w-full animate-fade-in text-xs">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-tr from-orange-50/50 to-amber-50/40 border border-orange-200/60 p-3 rounded-2xl shadow-xs">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-xl shrink-0">🚆</span>
                                    <p className="text-[10.5px] font-mono leading-relaxed text-slate-700">
                                      Train: <strong className="text-slate-900 font-bold">{pnrStationInfo.trainName} ({pnrStationInfo.trainNo})</strong> <br />
                                      Selected Stop: <strong className="text-amber-700 font-extrabold">{pnrStationInfo.stationName}</strong> <br />
                                      Coach/Berth: <strong className="text-slate-900">B-{pnrStationInfo.coach} / Seat {pnrStationInfo.seat}</strong>
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setPnrStationInfo(null);
                                      setTrainPnrInput("");
                                    }}
                                    className="text-[9px] font-mono font-black text-red-600 hover:text-red-500 hover:bg-red-50 uppercase px-2.5 py-1.5 bg-white border border-slate-200/85 rounded-xl cursor-pointer transition-all shadow-xs self-end sm:self-center"
                                  >
                                    Reset PNR
                                  </button>
                                </div>

                                {/* Horizontal Stops Timeline selector */}
                                <div className="space-y-4 pt-1">
                                  {(() => {
                                    const livePos = getTrainPositionInfo(pnrStationInfo.routeStops || [], simulatedTime);
                                    let approachLabel = "";
                                    if (livePos.atStationIndex !== -1) {
                                      const st = pnrStationInfo.routeStops?.[livePos.atStationIndex];
                                      approachLabel = `Stopped at ${st?.stationName} (${st?.stationCode})`;
                                    } else if (livePos.betweenStations) {
                                      const nextStopObj = pnrStationInfo.routeStops?.[livePos.betweenStations.toIndex];
                                      if (nextStopObj) {
                                        approachLabel = `En-route to ${nextStopObj.stationName} (approaching in ${Math.round(100 - livePos.betweenStations.progressPct)}% distance)`;
                                      } else if (livePos.betweenStations.fromIndex >= (pnrStationInfo.routeStops?.length || 0) - 1) {
                                        approachLabel = `Arrived at final destination terminal.`;
                                      } else {
                                        approachLabel = `Preparing for departure...`;
                                      }
                                    }

                                    return (
                                      <div className="bg-slate-900 text-white rounded-2xl p-4.5 border border-slate-800 shadow-lg relative overflow-hidden text-left">
                                        <div className="absolute top-0 right-0 p-1.5 bg-slate-800 text-[8.5px] rounded-bl-xl font-mono text-amber-400 font-black flex items-center gap-1">
                                          <span className="w-1.2 h-1.2 bg-emerald-400 rounded-full animate-pulse" />
                                          LIVE POSITION ACTIVE
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm">🕒</span>
                                            <span className="text-[10px] font-mono font-extrabold text-slate-205">
                                              Live Route Clock: <span className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono font-bold ml-1">{simulatedTime}</span>
                                            </span>
                                          </div>
                                          <div className="text-[10px] text-amber-300 font-black font-mono flex items-center gap-1">
                                            <span>🚆</span>
                                            <span>{approachLabel}</span>
                                          </div>
                                        </div>

                                        <div className="relative mt-8 mb-6 px-4">
                                          {/* Visual Track Rail Line */}
                                          <div className="absolute left-6 right-6 top-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            {/* Covered Track Highlights */}
                                            {(() => {
                                              let pct = 0;
                                              if (livePos.atStationIndex !== -1) {
                                                pct = (livePos.atStationIndex / ((pnrStationInfo.routeStops?.length || 1) - 1)) * 100;
                                              } else if (livePos.betweenStations) {
                                                const totalStops = pnrStationInfo.routeStops?.length || 1;
                                                const fromIndex = livePos.betweenStations.fromIndex;
                                                const basePct = fromIndex === -1 ? 0 : (fromIndex / (totalStops - 1)) * 100;
                                                const segmentWeight = 100 / (totalStops - 1);
                                                pct = basePct + (livePos.betweenStations.progressPct / 100) * segmentWeight;
                                              }
                                              return (
                                                <div 
                                                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-orange-500 rounded-full transition-all duration-1000" 
                                                  style={{ width: `${Math.min(pct, 100)}%` }} 
                                                />
                                              );
                                            })()}
                                          </div>

                                          {/* Moving Train Icon on Track */}
                                          {(() => {
                                            let pct = 0;
                                            if (livePos.atStationIndex !== -1) {
                                              pct = (livePos.atStationIndex / ((pnrStationInfo.routeStops?.length || 1) - 1)) * 100;
                                            } else if (livePos.betweenStations) {
                                              const totalStops = pnrStationInfo.routeStops?.length || 1;
                                              const fromIndex = livePos.betweenStations.fromIndex;
                                              const basePct = fromIndex === -1 ? 0 : (fromIndex / (totalStops - 1)) * 100;
                                              const segmentWeight = 100 / (totalStops - 1);
                                              pct = basePct + (livePos.betweenStations.progressPct / 100) * segmentWeight;
                                            }

                                            return (
                                              <motion.div 
                                                className="absolute -top-1.5 z-20 flex flex-col items-center -ml-3"
                                                style={{ left: `${Math.min(Math.max(pct, 3), 97)}%` }}
                                                animate={{ y: [0, -1.5, 0] }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                              >
                                                <span className="text-base drop-shadow-[0_2px_4px_rgba(251,191,36,0.6)]">🚆</span>
                                                <span className="text-[7px] font-mono leading-none bg-amber-400 text-slate-950 font-black px-1 rounded uppercase mt-0.5 whitespace-nowrap shadow-xs">
                                                  LIVE
                                                </span>
                                              </motion.div>
                                            );
                                          })()}

                                          {/* Stations Circles as Nodes */}
                                          <div className="relative flex justify-between">
                                            {(pnrStationInfo.routeStops || []).map((stop: any, idx: number) => {
                                              const isSelected = pnrStationInfo.stationCode === stop.stationCode;
                                              const isServiceable = checkIsServiceable(stop);
                                              const isPassed = isStationPassed(stop.departureTime, stop.stationCode);
                                              const isClickable = isServiceable && !isPassed;
                                              
                                              let nodeColor = "bg-slate-900 border-slate-700 text-slate-400";
                                              let badgeText = "No Service";

                                              if (isPassed) {
                                                nodeColor = "bg-slate-950 border-red-500/50 text-red-500 line-through decoration-red-500/40";
                                                badgeText = "Departed";
                                              } else if (isServiceable) {
                                                nodeColor = isSelected 
                                                  ? "bg-amber-400 border-amber-300 text-slate-950 font-black scale-110 shadow-[0_0_12px_rgba(251,191,36,0.65)]" 
                                                  : "bg-slate-900 border-emerald-400 text-emerald-450 hover:border-emerald-350 hover:scale-105 shadow-[0_0_6px_rgba(16,185,129,0.25)]";
                                                badgeText = isSelected ? "Deliver Here" : "Available";
                                              }

                                              const isTrainAtThisStop = livePos.atStationIndex === idx;

                                              return (
                                                <div key={stop.stationCode} className="flex flex-col items-center text-center relative z-10 select-none">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      if (isClickable) {
                                                        setPnrStationInfo({
                                                          ...pnrStationInfo,
                                                          stationCode: stop.stationCode,
                                                          stationName: stop.stationName
                                                        });
                                                        const targetBranch = mapStationToFranchiseCode(stop.stationCode, stop.stationName);
                                                        setSelectedBranchCode(targetBranch);
                                                        addToast(`Delivery switched to platform stop: ${stop.stationName}`, "success");
                                                      } else {
                                                        if (isPassed) {
                                                          addToast(`Train has already departed ${stop.stationName}.`, "error");
                                                        } else {
                                                          addToast(`Offline stop. Kitchen service works exclusively at Kanpur (CNB) & New Delhi (NDLS).`, "error");
                                                        }
                                                      }
                                                    }}
                                                    className={`w-7.5 h-7.5 rounded-full border-2 flex items-center justify-center text-[9px] font-mono tracking-tighter cursor-pointer transition-all ${nodeColor}`}
                                                    title={`${stop.stationName} (${badgeText})`}
                                                  >
                                                    {isTrainAtThisStop ? "🚆" : stop.stationCode.slice(0, 3)}
                                                  </button>
                                                  <div className="mt-2.5 max-w-[85px] leading-tight">
                                                    <strong className={`text-[10px] block truncate font-sans ${isPassed ? "text-slate-500 line-through" : isSelected ? "text-amber-400 font-extrabold" : "text-slate-200"}`}>{stop.stationCode}</strong>
                                                    <span className="text-[7px] text-slate-400 block truncate font-mono">{stop.stationName}</span>
                                                    <span className={`text-[7px] px-1 py-0.2 rounded font-mono font-black border uppercase block mt-1 ${
                                                      isPassed 
                                                        ? "bg-red-950/40 text-red-500 border-red-950" 
                                                        : isServiceable 
                                                          ? isSelected 
                                                            ? "bg-amber-400 text-slate-950 border-amber-300 font-black animate-pulse"
                                                            : "bg-emerald-950 text-emerald-450 border-emerald-900" 
                                                          : "bg-slate-850 text-slate-550 border-slate-800"
                                                    }`}>
                                                      {badgeText}
                                                    </span>
                                                    <span className="text-[7px] font-mono text-slate-550 block mt-0.5">Dep: {stop.departureTime}</span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] text-slate-400 font-mono italic">Demo IRCTC PNRs:</span>
                                {[
                                  { pnr: "1234567890", name: "Rajdhani" },
                                  { pnr: "9876543210", name: "Duronto" },
                                  { pnr: "4567890123", name: "Shatabdi" }
                                ].map((demo) => (
                                  <button
                                    key={demo.pnr}
                                    type="button"
                                    disabled={isFetchingPnr}
                                    onClick={() => {
                                      setTrainPnrInput(demo.pnr);
                                      handleFetchPnr(demo.pnr);
                                    }}
                                    className="bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-bold text-slate-700 cursor-pointer transition-colors disabled:opacity-50"
                                  >
                                    🚆 {demo.name} ({demo.pnr})
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {!pnrStationInfo && (
                            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100/70">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl w-full">
                                <div className="relative flex-1">
                                  <input
                                    type="text"
                                    placeholder="Enter Your 10-Digit IRCTC PNR Number..."
                                    className="bg-white border border-slate-205 pl-3.5 pr-10 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none w-full focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition-all font-mono tracking-widest"
                                    id="pnr-sticky-menu-input"
                                    maxLength={10}
                                    value={trainPnrInput}
                                    disabled={isFetchingPnr}
                                    onChange={(e) => setTrainPnrInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleFetchPnr(trainPnrInput);
                                      }
                                    }}
                                  />
                                  {trainPnrInput.length > 0 && !isFetchingPnr && (
                                    <button
                                      type="button"
                                      onClick={() => setTrainPnrInput("")}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleFetchPnr(trainPnrInput)}
                                  disabled={isFetchingPnr}
                                  className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/15 transition-all duration-300 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                                >
                                  {isFetchingPnr ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                      <span>Fetching...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Train className="w-3.5 h-3.5 text-white" />
                                      <span>Fetch Train Details</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-[9.5px] text-slate-400 font-mono flex items-center gap-1.5 pl-1">
                                <span className={`h-1.5 w-1.5 rounded-full ${isFetchingPnr ? "bg-amber-500 animate-ping" : "bg-emerald-500 animate-pulse"}`}></span>
                                <span>Press [Enter] or click fetch. Verified server-side IRCTC validation active.</span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

                {/* Nearest Branch Location selector bar */}
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase leading-none">Shipping Grid Node</span>
                      <strong className="text-xs text-slate-800 block truncate">
                        {franchises.find((f) => f.code === selectedBranchCode)?.name || "Cooking near Connaught Hub"}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setIsLocationModalOpen(true)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-mono font-bold uppercase px-3 py-2 rounded-xl flex items-center gap-1 border border-emerald-100 transition-all shadow-sm shrink-0 cursor-pointer"
                      id="order-btn-locate-me"
                    >
                      <Navigation className="w-3 h-3 text-emerald-600 rotate-45" />
                      <span>Locate Me</span>
                    </button>

                    <select
                      value={selectedBranchCode}
                      onChange={(e) => setSelectedBranchCode(e.target.value)}
                      className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-xs font-mono font-bold text-slate-700 outline-none cursor-pointer"
                      id="select-active-kitchen-branch"
                    >
                      {franchises.map((f) => (
                        <option key={f.code} value={f.code}>{f.name} ({f.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Train Delivery Confirmation Header */}
                {pnrStationInfo && (
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-205 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-amber-800 font-bold block uppercase font-mono text-[10px]">Train stopped platform delivery active!</span>
                      <p className="text-[10px] text-amber-600 mt-0.5 leading-tight">
                        Delivering directly to train <strong>{pnrStationInfo.trainName} ({pnrStationInfo.trainNo})</strong> stop platform <strong>{pnrStationInfo.stationName}</strong>. seat: {pnrStationInfo.coach}/{pnrStationInfo.seat}.
                      </p>
                    </div>
                    <button
                      onClick={() => setPnrStationInfo(null)}
                      className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-500 font-mono"
                    >
                      Disable Train Mode
                    </button>
                  </div>
                )}

                {/* DYNAMIC MENU RISE TRANSITION WRAPPER */}
                <motion.div
                  style={!isMobile ? {
                    scale: Math.min(1, 0.96 + (scrollY / 300) * 0.04),
                    y: Math.max(0, 30 - (scrollY / 200) * 30),
                    opacity: Math.min(1, 0.4 + (scrollY / 150) * 0.6)
                  } : {}}
                  className="space-y-6 w-full origin-top"
                >
                  {/* Food Categories Selector & Veg/Jain filters layout */}
                  <div 
                    className={`space-y-4 bg-white rounded-2xl p-5 shadow-sm transition-all duration-700 ease-out border ${
                      menuGlowActive 
                        ? "border-amber-500 ring-4 ring-amber-500/25 shadow-lg shadow-amber-500/10 scale-[1.01]" 
                        : "border-slate-100"
                    }`} 
                    id="menu-categories-anchor"
                  >
                    
                    {/* Category Selection Tabs */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wider leading-none">Explore Menu Categories</span>
                      <motion.div 
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.1
                            }
                          }
                        }}
                        initial="hidden"
                        animate="show"
                        className="flex items-center gap-2 flex-wrap" 
                        id="explore-menu-category-tabs"
                      >
                        {[
                          { name: "All", label: "All Items", icon: "🍽️" },
                          { name: "Pizza", label: "Pizzas", icon: "🍕" },
                          { name: "Burger", label: "Burgers", icon: "🍔" },
                          { name: "Wraps", label: "Wraps", icon: "🌯" },
                          { name: "Drinks", label: "Drinks", icon: "🥤" }
                        ].map((cat) => (
                          <motion.button
                            variants={{
                              hidden: { opacity: 0, y: 15, scale: 0.9 },
                              show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 14 } }
                            }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 border cursor-pointer ${
                              selectedCategory === cat.name 
                                ? "bg-primary border-primary text-white shadow-md shadow-orange-100 font-black" 
                                : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-200"
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span className="font-display font-black">{cat.label}</span>
                            <span className="text-[9px] opacity-75 font-mono">
                              ({cat.name === "All" ? menu.length : menu.filter(item => item.category === cat.name).length})
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    </div>

                  {/* Veg/Jain categorical filters */}
                  <div className="space-y-2 pt-2 border-t border-slate-50">
                    <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wider leading-none">Diet Preferences</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setFilterVegCategory("All")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all font-display cursor-pointer ${filterVegCategory === "All" ? "bg-slate-800 text-white shadow-sm" : "bg-white border border-slate-150 text-slate-600 hover:bg-slate-50"}`}
                      >
                        All Recipes
                      </button>
                      <button
                        onClick={() => setFilterVegCategory("Veg")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 font-display cursor-pointer ${filterVegCategory === "Veg" ? "bg-emerald-600 text-white shadow-sm" : "bg-white border border-slate-150 text-slate-600 hover:bg-slate-50"}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Pure Veg Only</span>
                      </button>
                      <button
                        onClick={() => setFilterVegCategory("Jain")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 font-display cursor-pointer ${filterVegCategory === "Jain" ? "bg-emerald-800 text-white shadow-sm" : "bg-white border border-slate-150 text-slate-600 hover:bg-slate-50"}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                        <span>Jain Friendly</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Grid of Menus items */}
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {menu
                      .filter((item) => {
                        // Category Filter
                        if (selectedCategory !== "All" && item.category !== selectedCategory) {
                          return false;
                        }
                        
                        // Dietary Preference Filter
                        if (filterVegCategory === "Veg") return item.isVeg;
                        if (filterVegCategory === "Jain") return item.isJain;
                        return true;
                      })
                      .map((item) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.96, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96, y: 15 }}
                          transition={{ type: "spring", stiffness: 100, damping: 15 }}
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-150 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-orange-100 transition-all duration-300 group"
                        >
                        <div className="p-3.5 flex gap-3.5">
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-50">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            {/* Star Rating Badge overlaid on image bottom */}
                            <div className="absolute bottom-1 right-1 bg-slate-900/95 text-amber-400 font-mono text-[8.5px] font-black px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 shadow-sm">
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
                              <span>{item.rating || "4.8"}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider text-white ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`}>
                                {item.isVeg ? "Pure Veg" : "Non-Veg"}
                              </span>
                              {item.isJain && (
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[8px] font-mono font-black">
                                  Jain✓
                                </span>
                              )}
                              
                              {/* Popular badge */}
                              {parseFloat(item.rating) >= 4.8 && (
                                <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-primary text-[8px] font-mono font-bold uppercase tracking-wider">
                                  🔥 Bestseller
                                </span>
                              )}
                            </div>
                            
                            <h4 className="text-sm font-black text-slate-800 truncate leading-snug font-display group-hover:text-primary transition-colors">{item.name}</h4>
                            <p className="text-[10.5px] text-slate-500 leading-snug line-clamp-2 min-h-[30px]">{item.description}</p>
                            
                            {/* Dynamic recommendations per Mode */}
                            {selectedOrderMode === "train" && (
                              <div className="bg-blue-50 text-blue-800 text-[8.5px] px-2 py-1 rounded-lg border border-blue-100 font-mono font-bold w-max max-w-full block">
                                🚆 Berth-side track ready
                              </div>
                            )}
                            {selectedOrderMode === "in-car" && (
                              <div className="bg-sky-50 text-sky-800 text-[8.5px] px-2 py-1 rounded-lg border border-sky-100 font-mono font-bold w-max max-w-full block">
                                🚗 Spill-free car slot plate
                              </div>
                            )}
                            {selectedOrderMode === "dine-in" && (
                              <div className="bg-indigo-50 text-indigo-800 text-[8.5px] px-2 py-1 rounded-lg border border-indigo-100 font-mono font-bold w-max max-w-full block">
                                🍽️ Straight oven-to-table warm
                              </div>
                            )}
                            {selectedOrderMode === "pickup" && (
                              <div className="bg-amber-50 text-amber-800 text-[8.5px] px-2 py-1 rounded-lg border border-amber-100 font-mono font-bold w-max max-w-full block">
                                🎒 Hot preservation cabin pickup
                              </div>
                            )}
                            {selectedOrderMode === "delivery" && (
                              <div className="bg-orange-50 text-orange-850 text-[8.5px] px-2 py-1 rounded-lg border border-orange-100 font-mono font-bold w-max max-w-full block">
                                🛵 Insulated dispatch box delivery
                              </div>
                            )}
                            
                            {/* Fast Preparation Indicators */}
                            <div className="flex items-center gap-2 text-[9.5px] font-mono text-slate-400">
                              <span className="flex items-center gap-0.5 font-bold">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span>Prep time: 14m</span>
                              </span>
                              <span>•</span>
                              <span>Sterilized pack</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold">
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold leading-none mb-0.5 font-mono">Total Net Price</span>
                            <span className="text-slate-800 font-black text-sm">₹{item.price}</span>
                          </div>
                          <button
                            onClick={() => setCustomizingItem(item)}
                            className="bg-primary hover:bg-primary-hover text-white font-mono text-[9.5px] font-black uppercase px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 cursor-pointer"
                          >
                            Add Custom +
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </div>

            </div>
          </div>
        );
      })()}

          {/* TRAIN RECRUIT STOP TIMELINE PAGE */}
          {currentPage === "train-order" && (
            <PNROrdering
              simulatedTime={simulatedTime}
              addToast={addToast}
              franchises={franchises}
              onSelectStation={(info) => {
                setPnrStationInfo(info);
                setSelectedBranchCode("KNP-JN"); // set Kanpur as cooking base
                addToast(`Railway route selected: ${info.trainNo} - ${info.trainName} | Delivery: ${info.stationName} (Seat ${info.coach}/${info.seat})`, "success");
                setCurrentPage("order");
              }}
            />
          )}

          {/* PARTNER WITH US FRANCHISOR FORM */}
          {currentPage === "partner" && (
            <PartnerWithUs />
          )}

          {/* CAREERS RECRUIT ROSTER */}
          {currentPage === "careers" && (
            <CareersPage />
          )}

          {/* COMPANY BACKGROUND CORE MISSION AND LEADERSHIP */}
          {currentPage === "about" && (
            <AboutCompany />
          )}

          {/* CUSTOMER PORTAL LIVE DASHBOARDS RECEIPT */}
          {currentPage === "dashboard" && (
            <CustomerDashboard
              customerName={customerName}
              customerPhone={customerPhone}
              walletBalance={walletBalance}
              onAddWallet={(amt) => {
                const nextBal = walletBalance + amt;
                setWalletBalance(nextBal);
                localStorage.setItem("ss_wallet_balance", nextBal.toString());
              }}
              orders={orders}
              onNavigate={navigateToPage}
            />
          )}

          {/* EXECUTIVE INTERNAL SECURITY LOGIN ROUTER */}
          {currentPage === "internal-login" && (
            <div className="max-w-md mx-auto py-12 text-slate-800" id="executive-portal-authorization">
              <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-6 shadow-xl">
                
                <div className="text-center space-y-1.5 border-b pb-4">
                  <span className="text-[9.5px] font-mono tracking-widest text-indigo-600 font-extrabold uppercase">SMARTSERVE AI CLOUD KITCHEN OS</span>
                  <h3 className="text-sm font-bold uppercase font-sans">Corporate Authorization Panel</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1 font-mono">Terminal Staff Role</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs outline-none focus:border-slate-400 text-slate-700 font-medium"
                    >
                      <option>Founder</option>
                      <option>Franchise Admin</option>
                      <option>Kitchen Staff</option>
                      <option>Rider</option>
                      <option>Employee</option>
                    </select>
                  </div>

                  {/* login button override router jump */}
                  <button
                    onClick={() => {
                      if (staffRole === "Founder") {
                        setCurrentPage("internal/hq");
                      } else if (staffRole === "Franchise Admin") {
                        setCurrentPage("internal/hq"); // unified to founder HQ control boards
                      } else if (staffRole === "Kitchen Staff") {
                        setCurrentPage("internal/kitchen");
                      } else if (staffRole === "Rider") {
                        setCurrentPage("internal/rider");
                      } else if (staffRole === "Employee") {
                        setCurrentPage("internal/employee");
                      }
                    }}
                    className="w-full bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] font-extrabold uppercase py-3 rounded-lg shadow-md transition-transform flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Authorize Role Session</span>
                  </button>

                  <div className="p-3 bg-indigo-50 bg-opacity-40 rounded-xl border border-indigo-150 text-[10px] text-indigo-700 leading-relaxed font-mono">
                    Staff logins do not require standard authentication in test mode bypass filters. Simply select your branch role above and press authorize.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* FOUNDER PLATFORM CORE DASHBOARD */}
          {currentPage === "internal/hq" && (
            <EnterpriseHQ
              franchises={franchises}
              orders={orders}
              onAddFranchise={(newF) => {
                setFranchises([...franchises, newF]);
              }}
            />
          )}

          {/* KITCHEN QUEUE CHEF DISPLAY */}
          {currentPage === "internal/kitchen" && (
            <EnterpriseKitchen
              orders={orders}
              onUpdateStage={handleUpdateOrderStage}
            />
          )}

          {/* RIDER DISPATCH CONSOLE LOGS */}
          {currentPage === "internal/rider" && (
            <EnterpriseRider
              activeRider={activeRidersPool[0] || { id: "rd1", name: "Rider Rahul Sharma", phone: "+91 9876543201", status: "delivering", currentLat: 28.6300, currentLon: 77.2185, totalDeliveries: 42, totalEarnings: 3150 }}
              orders={orders}
              onCompleteDelivery={(orderId) => {
                handleUpdateOrderStage(orderId, 6);
              }}
            />
          )}

          {/* ATTENDANCE SHIFT LEDGER PUNCHES */}
          {currentPage === "internal/employee" && (
            <EnterpriseEmployee
              employeesList={employeesList}
              onPunchShift={(empId, checkedIn) => {
                fetchStaffLogs();
              }}
            />
          )}

        </AnimatePresence>

      </main>

      {/* Global Interactive Customization drawer uploader */}
      <AnimatePresence>
        {customizingItem && (
          <AddCustomizationModal
            item={customizingItem}
            onClose={() => setCustomizingItem(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* Premium Onboarding Firebase Security Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        otpStep={otpStep}
        setOtpStep={setOtpStep}
        loginNameInput={loginNameInput}
        setLoginNameInput={setLoginNameInput}
        loginPhoneInput={loginPhoneInput}
        setLoginPhoneInput={setLoginPhoneInput}
        loginOtpInput={loginOtpInput}
        setLoginOtpInput={setLoginOtpInput}
        handleApplyLogin={handleApplyLogin}
      />

      {/* Floating Action Button (FAB) Pill when cart has items but drawer is closed */}
      {cart.reduce((s, c) => s + c.qty, 0) > 0 && !isCartDrawerOpen && (
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setIsCartDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-4 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-transform border border-emerald-500 cursor-pointer"
          id="global-floating-cart-pill"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 font-mono text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 border-emerald-600">
              {cart.reduce((s, c) => s + c.qty, 0)}
            </span>
          </div>
          <div className="text-left leading-none">
            <span className="text-[9px] uppercase tracking-wider text-emerald-200 block font-mono font-bold">Checkout basket</span>
            <span className="text-xs font-black">View Active Cart (₹{grandTotalResult})</span>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-100" />
        </motion.button>
      )}

      {/* Premium Floating Contextual Cart Drawer Panel */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cart={cart}
        onUpdateCartQty={handleUpdateCartQty}
        onRemoveFromCart={handleRemoveFromCart}
        couponCode={couponCode}
        onChangeCouponCode={setCouponCode}
        onApplyCouponCode={handleApplyCouponCode}
        appliedCoupon={appliedCoupon}
        cartSubtotal={cartSubtotal}
        cartTaxes={cartTaxes}
        deliverySurcharge={deliverySurcharge}
        couponDiscountSum={couponDiscountSum}
        grandTotalResult={grandTotalResult}
        customerPhone={customerPhone}
        checkoutName={checkoutName || customerName}
        checkoutPhone={checkoutPhone || customerPhone}
        checkoutAddress={checkoutAddress}
        onChangeCheckoutAddress={setCheckoutAddress}
        paymentOption={paymentOption}
        onChangePaymentOption={setPaymentOption}
        onCheckoutSubmit={handleCheckoutSubmit}
        onOpenLogin={() => {
          setIsLoginOpen(true);
          setOtpStep("phone");
        }}
        pnrStationInfo={pnrStationInfo}
        onDisablePnrMode={() => setPnrStationInfo(null)}
        onSetPnrStationInfo={setPnrStationInfo}
        simulatedTime={simulatedTime}
        onChangeSimulatedTime={setSimulatedTime}
        addToast={addToast}
        franchises={franchises}
        selectedOrderMode={selectedOrderMode}
        onChangeOrderMode={setSelectedOrderMode}
        dineInTableNumber={dineInTableNumber}
        onChangeDineInTableNumber={setDineInTableNumber}
        inCarSpotNumber={inCarSpotNumber}
        onChangeInCarSpot={setInCarSpotNumber}
        inCarVehiclePlate={inCarVehiclePlate}
        onChangeInCarVehiclePlate={setInCarVehiclePlate}
        pickupTimeEstimate={pickupTimeEstimate}
        onChangePickupTimeEstimate={setPickupTimeEstimate}
        onNavigate={navigateToPage}
      />

      {/* Slide-Up Micro-Alert Toast Container alerts */}
      <ToastContainer
        toasts={toasts}
        onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Location Detection & Autocomplete Modal overlays */}
      <LocationSystemModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        franchises={franchises}
        onLocationSelected={(address, lat, lng, branchCode) => {
          setCheckoutAddress(address);
          setSelectedBranchCode(branchCode);
        }}
      />

      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        orderId={upiModalOrderId}
        amount={upiAmount}
        customerPhone={checkoutPhone}
        onPaymentSuccess={(updatedOrder) => {
          showSuccessToast("UPI Transaction validated successfully!");
          // Trigger print bill receipt
          openBillAnimation(updatedOrder);
          // Set page
          setCurrentPage("dashboard");
        }}
      />

      {/* 6. ANIMATED THERMAL RECEIPT BILL PRINT MODULE */}
      <AnimatePresence>
        {printedOrderReceipt && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4" id="printed-thermal-bill-receipt">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[380px] flex flex-col"
            >
              {/* Paper printer chassis feed loader */}
              <div className="bg-slate-800 text-slate-400 p-3 rounded-t-2xl border-t border-x border-slate-700 shadow-inner text-center font-mono text-[9px] flex items-center justify-between px-6 select-none">
                <span>PRINTER FEED: ONLINE</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>RECEIPT PRINTER (58MM)</span>
              </div>
              <div className="bg-slate-900 h-2 mx-4 relative z-10 shadow-lg border-b border-slate-950" />

              {/* White thermal paper roll extending downwards */}
              <motion.div
                initial={{ height: 120, y: -20, opacity: 0.5 }}
                animate={{ height: "auto", y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 45, delay: 0.15 }}
                className="bg-[#fdfdfd] text-slate-800 px-6 py-8 shadow-2xl relative overflow-hidden flex flex-col font-mono text-[11px] leading-relaxed border-b-8 border-dashed border-slate-300 rounded-b-2xl select-none"
                style={{ backgroundImage: "repeating-linear-gradient(rgba(0,0,0,0.005), rgba(0,0,0,0.005) 2px, transparent 2px, transparent 4px)" }}
              >
                {/* 3. WATERMARK: Faded background watermark centered and slightly styled */}
                <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0 overflow-hidden">
                  <div className="text-slate-900 font-extrabold text-[3.25rem] tracking-[0.25em] opacity-[0.06] rotate-[-15deg] whitespace-nowrap">
                    SMARTSERVE
                  </div>
                </div>

                <div className="relative z-10 w-full">
                  {/* 1. Brand header block */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.22 }}
                    className="text-center space-y-1 mb-3"
                  >
                    <h2 className="text-base font-black text-slate-950 tracking-[0.12em]">SMARTSERVE FOODS</h2>
                    <p className="text-[10px] text-slate-500 font-bold italic">"Delicious Food, Delivered Smartly"</p>
                    <p className="text-[9px] text-slate-450 uppercase mt-0.5">Delhi NCR Main Express Kitchen</p>
                    <p className="text-[9.5px] text-slate-600 font-semibold">GSTIN: 07AAACS7841M1ZN</p>
                  </motion.div>

                  {/* Divider */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.15 }}
                    className="text-slate-300 font-mono tracking-tighter text-center"
                  >
                    ------------------------------------------
                  </motion.div>

                  {/* 4. BILL META STRUCTURE */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42, duration: 0.22 }}
                    className="space-y-1.5 text-[10.5px] text-slate-700 py-1"
                  >
                    <div className="flex justify-between">
                      <span>Order ID:</span>
                      <span className="font-extrabold text-slate-900">#SS{printedOrderReceipt.id?.slice(-6).toUpperCase() || "9832A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(printedOrderReceipt.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{new Date(printedOrderReceipt.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-150 p-1.5 rounded-lg text-slate-800 font-extrabold uppercase mt-1">
                      <span>Mode:</span>
                      <span className="text-orange-500 font-black">
                        {(printedOrderReceipt.orderMode || printedOrderReceipt.orderType || "DELIVERY").toUpperCase().replace("-", " ")}
                      </span>
                    </div>
                  </motion.div>

                  {/* Train transit info context block when train mode */}
                  {printedOrderReceipt.orderMode === "train" && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.15 }}
                        className="text-slate-300 font-mono tracking-tighter text-center"
                      >
                        ------------------------------------------
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.22 }}
                        className="space-y-1 text-[10.5px] text-slate-700 bg-orange-50/70 p-2.5 rounded-lg border border-orange-100/50"
                      >
                        <div className="flex justify-between">
                          <span>PNR:</span>
                          <span className="font-extrabold text-slate-950">{printedOrderReceipt.pnr || "Matched"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Station:</span>
                          <span className="font-extrabold text-slate-950">{printedOrderReceipt.deliveryStation || "Kanpur Central"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Seat:</span>
                          <span className="font-extrabold text-slate-950">{printedOrderReceipt.seatInfo || "A1-24"}</span>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* Dine In mode specifics */}
                  {printedOrderReceipt.orderMode === "dine-in" && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.15 }}
                        className="text-slate-300 font-mono tracking-tighter text-center"
                      >
                        ------------------------------------------
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.22 }}
                        className="space-y-1 text-[10.5px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200"
                      >
                        <div className="flex justify-between">
                          <span>Table Number:</span>
                          <span className="font-extrabold text-slate-950">{printedOrderReceipt.dineInTable || "Table 4"}</span>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* In Car specifics */}
                  {printedOrderReceipt.orderMode === "in-car" && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.15 }}
                        className="text-slate-300 font-mono tracking-tighter text-center"
                      >
                        ------------------------------------------
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.22 }}
                        className="space-y-1 text-[10.5px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200"
                      >
                        <div className="flex justify-between">
                          <span>Parking Spot:</span>
                          <span className="font-extrabold text-slate-950 uppercase">{printedOrderReceipt.inCarSpot || "Bay Slot 3"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vehicle Number:</span>
                          <span className="font-extrabold text-slate-950 uppercase truncate max-w-[130px]">{printedOrderReceipt.inCarVehicle || "UP32-AB-1234"}</span>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* Pickup specifics */}
                  {printedOrderReceipt.orderMode === "pickup" && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.15 }}
                        className="text-slate-300 font-mono tracking-tighter text-center"
                      >
                        ------------------------------------------
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.22 }}
                        className="space-y-1 text-[10.5px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200"
                      >
                        <div className="flex justify-between">
                          <span>Pickup Time:</span>
                          <span className="font-extrabold text-slate-950">In {printedOrderReceipt.pickupTime || "15 Mins"}</span>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* Standard Desk Delivery specifics */}
                  {(!printedOrderReceipt.orderMode || printedOrderReceipt.orderMode === "delivery") && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.15 }}
                        className="text-slate-300 font-mono tracking-tighter text-center"
                      >
                        ------------------------------------------
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.22 }}
                        className="space-y-1 text-[10.5px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 font-bold block">DELIVERY ADDRESS:</span>
                          <span className="font-extrabold text-slate-950 block leading-tight break-words">{printedOrderReceipt.deliveryAddress || "Standard Desk Delivery"}</span>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* Items header */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.82, duration: 0.15 }}
                    className="text-slate-300 font-mono tracking-tighter text-center mt-2"
                  >
                    ------------------------------------------
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.2 }}
                    className="font-mono text-[10.5px] text-slate-500 font-bold tracking-wider mt-1 mb-2"
                  >
                    ITEMS:
                  </motion.div>

                  {/* Items list with incremental line-by-line printing effect */}
                  <div className="space-y-2 mt-1.5 font-mono">
                    {printedOrderReceipt.items.map((it: any, idx: number) => {
                      const startDelay = 1.0 + idx * 0.08;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: startDelay, duration: 0.22 }}
                          className="flex justify-between text-[11px] text-slate-800 items-start font-mono"
                        >
                          <div className="min-w-0 flex-1 pr-4">
                            <span className="font-extrabold">{it.name} x{it.qty}</span>
                            {it.toppings && it.toppings.length > 0 && (
                              <span className="block text-[8.5px] text-slate-400 font-mono italic">
                                + {it.toppings.join(", ")}
                              </span>
                            )}
                          </div>
                          <span className="font-bold shrink-0">₹{it.price * it.qty}</span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Financials segment */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.15 }}
                    className="text-slate-300 font-mono tracking-tighter text-center mt-2"
                  >
                    ------------------------------------------
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.22 }}
                    className="space-y-1.5 text-[10.5px] text-slate-700 py-1"
                  >
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{printedOrderReceipt.items.reduce((acc: number, cur: any) => acc + (cur.price * cur.qty), 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%)</span>
                      <span>₹{printedOrderReceipt.tax || Math.round(printedOrderReceipt.items.reduce((acc: number, cur: any) => acc + (cur.price * cur.qty), 0) * 0.05)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span>₹{printedOrderReceipt.deliveryCharge || 0}</span>
                    </div>
                    {printedOrderReceipt.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount Coupon</span>
                        <span>- ₹{printedOrderReceipt.discount}</span>
                      </div>
                    )}
                    
                    {/* Double dashes look for financial net total */}
                    <div className="border-t border-dashed border-slate-300 mt-2.5 pt-2" />
                    <div className="flex justify-between font-black text-slate-900 text-xs py-0.5">
                      <span>Total</span>
                      <span className="text-slate-950 font-black">₹{printedOrderReceipt.total}</span>
                    </div>
                    <div className="border-b border-dashed border-slate-300 mt-0.5 pb-1" />
                  </motion.div>

                  {/* Payment Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 0.22 }}
                    className="space-y-1 text-[10.5px] text-slate-700 font-mono mt-1"
                  >
                    <div className="flex justify-between">
                      <span>Payment:</span>
                      <span className="font-extrabold uppercase">{printedOrderReceipt.paymentMethod || printedOrderReceipt.paymentOption || "COD"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-extrabold uppercase flex items-center gap-1 ${
                        printedOrderReceipt.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"
                      }`}>
                        {printedOrderReceipt.paymentStatus === "Paid" ? "Paid ✅" : "Payment Due ⚠️"}
                      </span>
                    </div>
                  </motion.div>

                  {/* Invoice Footer Block */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.95, duration: 0.15 }}
                    className="text-slate-300 font-mono tracking-tighter text-center mt-2"
                  >
                    ------------------------------------------
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.1, duration: 0.22 }}
                    className="text-center text-[10px] text-slate-500 font-bold font-mono tracking-wider space-y-1.5 mt-2 mb-2"
                  >
                    <p>"Thank you for ordering with SmartServe!"</p>
                    <p className="text-[8px] text-slate-400 font-normal">Please recycle this paper ticket.</p>
                  </motion.div>

                  {/* 6. Highly Authentic Red Verification Stamp with Scale Springs */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.8 }}
                    transition={{
                      type: "spring",
                      stiffness: 110,
                      damping: 10,
                      delay: 2.35
                    }}
                    className="absolute bottom-20 right-5 border-4 border-double border-red-500 text-red-600 font-mono tracking-wider font-extrabold uppercase text-[10px] py-1.5 px-3 rounded-full leading-none shadow-sm flex flex-col items-center select-none pointer-events-none bg-white/90 rotate-[-12deg]"
                  >
                    <span className="text-[7px] tracking-widest text-red-500 font-bold mb-0.5">SMARTSERVE</span>
                    <span className="text-[10px] font-black tracking-tight text-red-600">VERIFIED ✓</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Absolute Close Top Right Button x */}
              <button
                onClick={() => setPrintedOrderReceipt(null)}
                className="absolute -top-12 right-0 text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-white"
                title="Close Receipt Overlay"
                id="close-receipt-top-x"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Physical Cut / Tear action bar */}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToast("Sending printed invoice telemetry stream to local POS...", "info");
                      window.print();
                    }}
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-3 rounded-xl font-mono text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md text-center flex items-center justify-center gap-1.5 active:scale-97"
                  >
                    📄 Download Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrintedOrderReceipt(null);
                      setCurrentPage("dashboard");
                      addToast("Opening Live Logistics tracking board... 🛵", "success");
                    }}
                    className="flex-1 bg-primary hover:bg-orange-600 text-white bg-orange-600 hover:bg-orange-700 py-3 rounded-xl font-mono text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-orange-500/10 text-center flex items-center justify-center gap-1.5 active:scale-97"
                  >
                    📍 Track Order
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPrintedOrderReceipt(null);
                      setCurrentPage("menu");
                      addToast("Redirected to menu browsing.", "info");
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-705 border border-slate-700 text-slate-200 py-2.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-1 cursor-pointer"
                  >
                    🏠 Continue Browsing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrintedOrderReceipt(null);
                      setCurrentPage("dashboard");
                      addToast("Showing order history dossier.", "info");
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-705 border border-slate-700 text-slate-200 py-2.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-1 cursor-pointer"
                  >
                    📦 My Orders
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Brand Footer with required credits */}
      <CustomerFooter onNavigate={navigateToPage} />

    </div>
  );
}
