import React, { useState, useEffect } from "react";
import { Order } from "../types";
import { 
  Wallet, Compass, Truck, Star, CheckCircle, Clock, MapPin, 
  Gift, CreditCard, ChevronRight, X, Phone, Share2, Expand, 
  Map, Bell, Shield, Volume2, Moon, Layers, Navigation,
  User, History, FileText, Heart, LifeBuoy, Settings, CornerDownRight,
  Plus, Trash2, Milestone, ArrowRight, Printer, AlertCircle, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SmartServeMap from "./SmartServeMap";

interface Props {
  customerName: string;
  customerPhone: string;
  walletBalance: number;
  onAddWallet: (amt: number) => void;
  orders: Order[];
  onNavigate: (page: string) => void;
  onReorder?: (items: any[]) => void;
}

const STAGES = [
  { id: 1, label: "Order Received", icon: "📋", desc: "Logistics cluster verified order." },
  { id: 2, label: "Preparing Food", icon: "👨‍🍳", desc: "Assembly & wood-fired baking." },
  { id: 3, label: "Rider Assigned", icon: "🛵", desc: "Direct courier dispatched to dock." },
  { id: 4, label: "Picked Up", icon: "📦", desc: "Thermal sealed foil locked in cart." },
  { id: 5, label: "On The Way", icon: "⚡", desc: "En route to delivery point." },
  { id: 6, label: "Delivered", icon: "🎉", desc: "Safely delivered of smart heat shields." }
];

export default function CustomerDashboard({
  customerName,
  customerPhone,
  walletBalance,
  onAddWallet,
  orders,
  onNavigate,
  onReorder
}: Props) {
  const [activeTab, setActiveTab] = useState<string>("tracking");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isMiniFloating, setIsMiniFloating] = useState<boolean>(false);
  const [isDialingRider, setIsDialingRider] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<string>("dialing");
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // EXTRAS RETRIVAL STATES
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState<string>("");
  const [newTag, setNewTag] = useState<string>("Home");
  
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState<string>("");
  const [ticketCategory, setTicketCategory] = useState<string>("Delivery Delay");
  const [ticketDesc, setTicketDesc] = useState<string>("");
  const [isCreatingTicket, setIsCreatingTicket] = useState<boolean>(false);

  const [rewardsProfile, setRewardsProfile] = useState<any>({
    points: 720,
    tier: "Gold Elite",
    referrals: 4,
    scratchcards: []
  });
  const [scratchedAnimCardId, setScratchedAnimCardId] = useState<string | null>(null);

  // Invoices & Thermal simulation States
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [thermalPrinting, setThermalPrinting] = useState<boolean>(false);
  const [invoiceClaimed, setInvoiceClaimed] = useState<boolean>(false);

  const myOrders = orders.filter((o) => o.customerPhone === customerPhone);

  useEffect(() => {
    if (myOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(myOrders[0].id);
    }
  }, [myOrders, selectedOrderId]);

  const activeTrackedOrder = myOrders.find((o) => o.id === selectedOrderId);

  // RETRIEVE EXTRAS VIA JWT TOKEN
  const getJWTToken = () => localStorage.getItem("ss_jwt_token");

  const fetchAddresses = async () => {
    const token = getJWTToken();
    if (!token) return;
    try {
      const res = await fetch("/api/addresses", { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchWalletHistory = async () => {
    const token = getJWTToken();
    if (!token) return;
    try {
      const res = await fetch("/api/wallet/history", { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setWalletHistory(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchFavorites = async () => {
    const token = getJWTToken();
    if (!token) return;
    try {
      const res = await fetch("/api/favorites", { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchTickets = async () => {
    const token = getJWTToken();
    if (!token) return;
    try {
      const res = await fetch("/api/support/tickets", { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchRewards = async () => {
    const token = getJWTToken();
    if (!token) return;
    try {
      const res = await fetch("/api/rewards", { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setRewardsProfile(data);
      }
    } catch (e) { console.error(e); }
  };

  // Trigger loads on mount or activeTab changes
  useEffect(() => {
    const token = getJWTToken();
    if (token) {
      if (activeTab === "addresses" || activeTab === "tracking") fetchAddresses();
      if (activeTab === "wallet") fetchWalletHistory();
      if (activeTab === "favorites") fetchFavorites();
      if (activeTab === "support") fetchTickets();
      if (activeTab === "rewards") fetchRewards();
    }
  }, [activeTab, customerPhone]);

  // Handle adding saved address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    const token = getJWTToken();
    if (!token) return;
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ address: newAddress, tag: newTag })
      });
      if (res.ok) {
        setNewAddress("");
        fetchAddresses();
      }
    } catch (e) { console.error(e); }
  };

  // Handle removing saved address
  const handleDeleteAddress = async (id: string) => {
    const token = getJWTToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (e) { console.error(e); }
  };

  // Toggle favorite dish
  const handleToggleFavorite = async (menuId: string) => {
    const token = getJWTToken();
    if (!token) return;
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ menuId })
      });
      if (res.ok) {
        fetchFavorites();
      }
    } catch (e) { console.error(e); }
  };

  // Handle support ticket submissions
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;
    const token = getJWTToken();
    if (!token) return;
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          subject: ticketSubject, 
          category: ticketCategory, 
          description: ticketDesc 
        })
      });
      if (res.ok) {
        setTicketSubject("");
        setTicketDesc("");
        setIsCreatingTicket(false);
        fetchTickets();
      }
    } catch (e) { console.error(e); }
  };

  // Handle rewards scratchcard interaction
  const handleScratchCard = async (cardId: string) => {
    const token = getJWTToken();
    if (!token) return;
    setScratchedAnimCardId(cardId);
    try {
      const res = await fetch("/api/rewards/scratch", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cardId })
      });
      if (res.ok) {
        const data = await res.json();
        // Add cashback dynamically if scratchcard was a direct credit!
        if (data.card.value > 0) {
          onAddWallet(data.card.value);
        }
        setTimeout(() => {
          setScratchedAnimCardId(null);
          fetchRewards();
          fetchWalletHistory();
        }, 1500);
      } else {
        setScratchedAnimCardId(null);
      }
    } catch (e) { 
      console.error(e); 
      setScratchedAnimCardId(null);
    }
  };

  // Helper coordinate resolution (supports Delhi NCR hubs, Kanpur central & Jabalpur hubs)
  const resolveBranchCoords = (code: string) => {
    const c = code?.toUpperCase() || "";
    // Delhi NCR Hubs
    if (c.includes("CP") || c.includes("DEL")) return { lat: 28.6299, lon: 77.2183 };
    if (c.includes("SEC62") || c.includes("NDA")) return { lat: 28.6273, lon: 77.3725 };
    if (c.includes("CYB") || c.includes("GGN")) return { lat: 28.4950, lon: 77.0878 };
    // Indian Railways Centrals
    if (c.includes("CNB") || c.includes("KAN")) return { lat: 26.4534, lon: 80.3542 };
    if (c.includes("PRYJ") || c.includes("PRAYAG")) return { lat: 25.4496, lon: 81.8291 };
    
    // Default Jabalpur demo franchises mapping coordinations
    if (c.includes("CIVIC")) return { lat: 23.1678, lon: 79.9329 };
    if (c.includes("MADAN")) return { lat: 23.1558, lon: 79.9161 };
    if (c.includes("VIJAY")) return { lat: 23.1932, lon: 79.9275 };
    if (c.includes("NAPIER")) return { lat: 23.1615, lon: 79.9261 };
    if (c.includes("GORAKH")) return { lat: 23.1522, lon: 79.9381 };

    return { lat: 23.1678, lon: 79.9329 }; // Default root Civic Centre Jabalpur focal point
  };

  // Haversine distance multiplier km
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getRiderMetrics = (order: Order) => {
    const branch = resolveBranchCoords(order.branchCode);
    const rLat = order.riderLat || branch.lat;
    const rLon = order.riderLon || branch.lon;
    const tLat = order.targetLat || (branch.lat + 0.0125);
    const tLon = order.targetLon || (branch.lon + 0.0125);

    const distLeft = getDistanceKm(rLat, rLon, tLat, tLon);
    const speed = order.stage >= 5 ? Math.round(38 + Math.sin(Date.now() / 6000) * 10) : 0;
    const rawETA = Math.ceil(distLeft * 2.5 + 1);
    const etaMin = order.stage === 6 ? 0 : order.stage < 5 ? 12 : rawETA;
    const isApproaching = distLeft > 0 && distLeft <= 0.40 && order.stage === 5;

    return {
      distLeft: distLeft < 0.02 ? 0 : parseFloat(distLeft.toFixed(2)),
      speed: order.stage === 6 ? 0 : speed,
      eta: etaMin,
      isApproaching,
      branchLat: branch.lat,
      branchLon: branch.lon,
      riderLat: rLat,
      riderLon: rLon,
      targetLat: tLat,
      targetLon: tLon,
    };
  };

  // Trigger high proximity sound notice when rider is approaching (<400m)
  useEffect(() => {
    if (activeTrackedOrder) {
      const metrics = getRiderMetrics(activeTrackedOrder);
      if (metrics.isApproaching) {
        setNotification("🚨 FOOD CAPTAIN ARRIVING! SmartServe electric fleet rider is within 400m of your location lock.");
        try {
          if ("speechSynthesis" in window) {
            const speech = new SpeechSynthesisUtterance("Your Smart Serve rider is arriving now");
            speech.volume = 0.8;
            window.speechSynthesis.speak(speech);
          }
        } catch (_) {}
      } else {
        setNotification(null);
      }
    }
  }, [activeTrackedOrder?.riderLat, activeTrackedOrder?.riderLon]);

  const handleShareTracking = () => {
    if (!activeTrackedOrder) return;
    const link = `${window.location.origin}/track/${activeTrackedOrder.id}`;
    navigator.clipboard.writeText(link);
    setNotification("✓ Secure logistics link copied! Share with friends or security gates.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
      setNotification("⚡ Active route re-optimized via clean-emission transit lanes.");
      setTimeout(() => setNotification(null), 3000);
    }, 1500);
  };

  const startDialer = () => {
    setIsDialingRider(true);
    setCallStatus("dialing");
    setTimeout(() => setCallStatus("ringing"), 1000);
    setTimeout(() => setCallStatus("connected"), 2500);
  };

  // Handle thermal bill simulation printing
  const printThermalBill = (order: Order) => {
    setActiveInvoiceOrder(order);
    setThermalPrinting(true);
    setInvoiceClaimed(false);
    setTimeout(() => {
      setThermalPrinting(false);
    }, 2800);
  };

  return (
    <div className="space-y-6 py-2 text-slate-800" id="smart-serve-customer-portal">
      
      {/* 1. Header Profile Banner */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-lg shadow-orange-500/10 flex items-center justify-center text-white text-xl font-black font-sans">
            {customerName.substring(0,2).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 font-sans">{customerName}</h2>
              <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
                {rewardsProfile.tier || "Gold Elite"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Account ID: {customerPhone}</p>
          </div>
        </div>

        {/* Dynamic Pocket Wallet */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 flex items-center justify-between min-w-[280px]">
          <div className="space-y-1 text-left">
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-widest font-mono">My Wallet Balance</span>
            <strong className="text-xl font-black text-white font-mono">₹{walletBalance}</strong>
          </div>
          <div className="flex flex-col gap-1.5 ml-4">
            <button
              onClick={() => onAddWallet(500)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black font-mono text-[9px] uppercase px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              + ₹500
            </button>
            <button
              onClick={() => onAddWallet(1000)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-black font-mono text-[9px] uppercase px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              + ₹1,000
            </button>
          </div>
        </div>
      </section>

      {/* Approaching Notifications Overlay */}
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-600 to-amber-500 text-white p-3.5 rounded-xl shadow-lg border border-orange-500 text-xs font-mono font-bold flex items-center gap-3"
        >
          <Bell className="w-4 h-4 animate-bounce text-white shrink-0" />
          <span>{notification}</span>
        </motion.div>
      )}

      {/* 2. Customer Dashboard Work Area: Tabbed Navigation split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Rail Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-3 shadow-sm space-y-1">
          <span className="text-[9px] font-black tracking-widest uppercase text-slate-400 font-mono block px-3 py-2 text-left">Account Portal</span>
          
          <button
            onClick={() => setActiveTab("tracking")}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "tracking" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Milestone className="w-4 h-4" />
              <span>Live Fast Tracking</span>
            </div>
            {orders.some(o => o.stage < 6 && o.customerPhone === customerPhone) && (
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "history" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4" />
              <span>Orders & Invoices</span>
            </div>
            <span className="font-mono text-[10px] opacity-75">{myOrders.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("wallet")}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "wallet" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Wallet className="w-4 h-4" />
              <span>My Wallet & Ledger</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "addresses" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4" />
              <span>Saved Locations</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("rewards")}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "rewards" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Gift className="w-4 h-4" />
              <span>Scratchcards & Rewards</span>
            </div>
            <span className="font-mono text-[10px] text-orange-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
              {rewardsProfile.points} pts
            </span>
          </button>

          <button
            onClick={() => setActiveTab("train")}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "train" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4" />
              <span>Train Route Deliveries</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "favorites" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4" />
              <span>Favorite Dishes</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "support" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LifeBuoy className="w-4 h-4" />
              <span>Help & Support</span>
            </div>
            {tickets.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "profile" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4" />
              <span>Customer Details</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "settings" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4" />
              <span>System Preferences</span>
            </div>
          </button>
        </div>

        {/* Tab Detail panel view */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[480px]">
          
          {/* TAB 1: LIVE COURIER TRACKING (MAP VIEWER) */}
          {activeTab === "tracking" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 font-sans">Active Ride Fast Courier Tracking</h3>
                  <span className="text-[11px] text-slate-400 font-mono">Live tracking maps for current orders assigned</span>
                </div>
                
                {myOrders.length > 0 && (
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                  >
                    {myOrders.map(o => (
                      <option key={o.id} value={o.id}>
                        Order #{o.id?.slice(-6).toUpperCase() || "..."} - {o.stage === 6 ? "Delivered" : "In Flight"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {activeTrackedOrder ? (() => {
                const m = getRiderMetrics(activeTrackedOrder);
                return (
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl relative">
                    <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white text-left">
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-widest text-orange-500 font-extrabold block">CONNECTED LOGISTICS TRACE</span>
                        <h4 className="text-xs font-black font-mono mt-0.5">ORDER ID: {activeTrackedOrder.id}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsFullScreen(!isFullScreen);
                            setIsMiniFloating(false);
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            isFullScreen ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          <Expand className="w-3 h-3" />
                          <span>{isFullScreen ? "Full View" : "Split View"}</span>
                        </button>
                      </div>
                    </div>

                    <div className={`grid grid-cols-1 ${isFullScreen ? "lg:grid-cols-1" : "lg:grid-cols-10"}`}>
                      {/* Active Milestones Checklist */}
                      {!isFullScreen && (
                        <div className="lg:col-span-3 bg-slate-900 p-4 border-r border-slate-850 space-y-4 text-white text-left">
                          <span className="text-[9px] font-black tracking-widest uppercase text-slate-450 font-mono block">Delivery Milestones</span>
                          <div className="space-y-3.5">
                            {STAGES.map((st) => {
                              const isCompleted = activeTrackedOrder.stage >= st.id;
                              const isCurrent = activeTrackedOrder.stage === st.id;
                              return (
                                <div key={st.id} className="flex items-start gap-2 max-w-full">
                                  <div className="mt-0.5 shrink-0">
                                    {isCompleted ? (
                                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center text-[9px] font-mono font-bold">✓</div>
                                    ) : isCurrent ? (
                                      <div className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500 flex items-center justify-center text-[10px] animate-pulse font-mono font-bold">●</div>
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center text-[9px] font-mono">{st.id}</div>
                                    )}
                                  </div>
                                  <div className="font-mono leading-tight truncate">
                                    <span className={`text-[10px] font-bold block ${
                                      isCurrent ? "text-orange-400" : isCompleted ? "text-emerald-400" : "text-slate-400"
                                    }`}>
                                      {st.label}
                                    </span>
                                    <span className="text-[8px] text-slate-500 block truncate leading-none mt-0.5">{st.desc}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Map Engine Viewport */}
                      <div className={`${isFullScreen ? "lg:col-span-1" : "lg:col-span-7"} relative h-[380px]`}>
                        
                        {/* Live Floating Tracking Metrics Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 text-white shadow-2xl text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                            <div>
                              <h5 className="text-[11px] font-black font-mono tracking-tight text-white">{activeTrackedOrder.riderName || "Logistics Driver Assigned"}</h5>
                              <span className="text-[8.5px] text-emerald-400 font-mono block font-bold">Zero-Emissions Electric Rider • DL-3S-CQ-4472</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={startDialer}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg font-mono text-[9.5px] uppercase font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Phone className="w-3 h-3 text-white" />
                                <span>Call Driver</span>
                              </button>
                              <button
                                onClick={handleRecalculate}
                                disabled={isRecalculating}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg font-mono text-[9.5px] uppercase font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                              >
                                <Navigation className={`w-3 h-3 ${isRecalculating ? "animate-spin" : ""}`} />
                                <span>Recount Route</span>
                              </button>
                              <button
                                onClick={handleShareTracking}
                                className="bg-slate-800 hover:bg-slate-705 p-2 rounded-lg font-mono text-[9.5px] uppercase text-slate-300 font-bold bg-slate-820 hover:bg-slate-800 cursor-pointer"
                              >
                                <Share2 className="w-3 h-3" />
                                <span>Share Link</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 font-mono text-center">
                            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                              <span className="text-[9px] text-slate-500 block uppercase font-bold">Speed Indicator</span>
                              <strong className="text-[12px] font-black text-orange-400 inline-flex items-center gap-0.5 mt-0.5">
                                {m.speed} <span className="text-[8px] text-slate-450 normal-case">km/h</span>
                              </strong>
                            </div>
                            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                              <span className="text-[9px] text-slate-500 block uppercase font-bold">Distance remaining</span>
                              <strong className="text-[12px] font-black text-white inline-flex items-center gap-0.5 mt-0.5">
                                {m.distLeft} <span className="text-[8px] text-slate-400 normal-case">km</span>
                              </strong>
                            </div>
                            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                              <span className="text-[9px] text-slate-500 block uppercase font-bold">Est Countdown</span>
                              <strong className="text-[12px] font-black text-emerald-400 inline-flex items-center gap-0.5 mt-0.5">
                                {m.eta} <span className="text-[8px] text-slate-400 normal-case">mins</span>
                              </strong>
                            </div>
                            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                              <span className="text-[9px] text-slate-500 block uppercase font-bold">Live Pin Locks</span>
                              <strong className="text-[12px] font-black text-amber-400 animate-pulse mt-0.5 block">
                                {activeTrackedOrder.stage === 6 ? "DELIVERED ✓" : `${m.eta * 60}s left`}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Rendering MapLibre OSM view */}
                        <div className="w-full h-full">
                          <SmartServeMap
                            riderLat={m.riderLat}
                            riderLon={m.riderLon}
                            customerLat={m.targetLat}
                            customerLon={m.targetLon}
                            outletLat={m.branchLat}
                            outletLon={m.branchLon}
                            isMiniMode={isMiniFloating}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-spin" />
                  <p className="text-xs font-mono leading-relaxed max-w-[280px] mx-auto">No dispatched in-flight orders detected. Completed orders will appear in your Order History.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDER HISTORY & INVOICE PRINTERS */}
          {activeTab === "history" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 font-sans">Full Order Logs & Invoice Dossiers</h3>
                <span className="text-[11px] text-slate-400 font-mono">View historic statements, print real-thermal receipts and reorder items</span>
              </div>

              {myOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <Printer className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-mono max-w-[260px] mx-auto">Your order docket ledger is blank. Book some fresh hot meals now!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map(o => (
                    <div key={o.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-mono text-slate-900">ID: #{o.id}</strong>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase ${
                              o.stage === 6 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                            }`}>
                              {o.stage === 6 ? "Delivered ✓" : "In Flight 🛵"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Placed: {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                        </div>
                        <div className="text-right">
                          <strong className="text-sm font-black font-mono text-slate-900 block">₹{o.total}</strong>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono block">Paid via {o.paymentMethod || (o as any).paymentOption || "WALLET"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                        <div className="space-y-1 text-xs font-mono text-slate-650 flex-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="text-orange-500 font-bold">{o.branchName}</span>
                            <span className="text-slate-300">|</span>
                            <span>{o.orderMode?.toUpperCase()}</span>
                          </div>
                          <div className="text-[10.5px] font-medium leading-normal text-slate-600">
                            {o.items.map(it => `${it.name} x${it.qty}`).join(", ")}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center shrink-0">
                          <button
                            onClick={() => printThermalBill(o)}
                            className="flex-1 sm:flex-none border border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-[10px] font-black font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                          
                          {onReorder && (
                            <button
                              onClick={() => {
                                onReorder(o.items);
                                onNavigate("menu");
                              }}
                              className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-xl text-[10px] font-black font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-orange-500/5 active:scale-97"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Reorder</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WALLET & LEDGER HISTORY */}
          {activeTab === "wallet" && (
            <div className="space-y-6 text-left font-mono">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 font-sans">Pocket Wallet Balance & Transaction History</h3>
                <span className="text-[11px] text-slate-400">Complete audit ledger of credit rewards and platform checkout debits</span>
              </div>

              {/* Stat balance cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">DURABLE BALANCE</span>
                  <strong className="text-lg font-black text-slate-900">₹{walletBalance}</strong>
                </div>
                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 text-emerald-800">
                  <span className="text-[9px] text-emerald-500 font-extrabold uppercase tracking-widest block mb-1">REFERRAL BONUS</span>
                  <strong className="text-lg font-black font-mono">₹120</strong>
                </div>
                <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 text-amber-800">
                  <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest block mb-1">EARNED REBATES</span>
                  <strong className="text-lg font-black font-mono">₹250</strong>
                </div>
              </div>

              {/* Transactions list */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] text-slate-400 font-bold block">
                  <span>TRANSACTION NARRATIVE</span>
                  <span>AMOUNT DETAILED</span>
                </div>

                {walletHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-150 rounded-xl">
                    <p className="text-[11px] italic">No prior transaction lines filed to your phone index.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {walletHistory.map(w => (
                      <div key={w.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-50 bg-white shadow-sm">
                        <div className="space-y-0.5 text-left">
                          <strong className="text-xs text-slate-800 tracking-tight block">{w.description}</strong>
                          <span className="text-[9.5px] text-slate-400 block">{w.id} • {new Date(w.createdAt || Date.now()).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                        </div>
                        <strong className={`text-xs font-black shrink-0 ${w.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                          {w.type === "credit" ? "+" : "-"} ₹{w.amount}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SAVED LOCATIONS */}
          {activeTab === "addresses" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 font-sans">Saved Delivery Locations</h3>
                <span className="text-[11px] text-slate-400 font-mono">Save recurring desk positions, homes and office coordinates for fast key checkout</span>
              </div>

              {/* Form to append direct address */}
              <form onSubmit={handleAddAddress} className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono block mb-1.5">Full Physical Desk Address</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-xs leading-normal font-mono"
                      placeholder="e.g. Block C-2, Stellar IT Park, Sector 62, Noida"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono block mb-1.5">Position Tag</label>
                    <select
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-xs font-mono font-bold"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                    >
                      <option value="Home">🏠 Home</option>
                      <option value="Office">🏢 Office</option>
                      <option value="Hostel">🎓 Hostel</option>
                      <option value="Other">📍 Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="p-2.5 bg-slate-900 border border-slate-800 text-white font-mono text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-850 transition-all flex items-center gap-1 cursor-pointer active:scale-97"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Location</span>
                  </button>
                </div>
              </form>

              {/* Locations items block */}
              <div className="space-y-3 pt-2">
                {addresses.length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono italic">No configured delivery nodes added.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {addresses.map(a => (
                      <div key={a.id} className="border border-slate-100 p-4 rounded-xl flex items-start gap-3 bg-white shadow-sm hover:border-slate-300 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="text-left font-mono space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800 text-xs">{a.tag}</span>
                            {a.isDefault && (
                              <span className="bg-emerald-50 text-emerald-600 text-[8px] px-1.5 py-0.5 rounded uppercase font-extrabold border border-emerald-100">Primary</span>
                            )}
                          </div>
                          <p className="text-[10px] leading-relaxed text-slate-500 break-words">{a.address}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(a.id)}
                          className="text-slate-350 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg shrink-0 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LOYALTY SCRATCHCARDS */}
          {activeTab === "rewards" && (
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 font-sans">Loyalty Rewards & Scratchcards</h3>
                  <span className="text-[11px] text-slate-400 font-mono">Scratch custom cards from order streaks to win instant cash credits to Wallet!</span>
                </div>
                <div className="bg-gradient-to-tr from-amber-500 to-orange-500 text-white p-3 rounded-xl font-mono text-center">
                  <span className="text-[8.5px] uppercase font-bold block">CLUB REPUTATION</span>
                  <strong className="text-sm font-black font-sans">{rewardsProfile.points} Smart-Stars</strong>
                </div>
              </div>

              {/* Dynamic list of scratchable vouchers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                {rewardsProfile.scratchcards?.map((card: any) => {
                  const isScratched = card.scratched;
                  const isPendingAnim = scratchedAnimCardId === card.id;

                  return (
                    <div
                      key={card.id}
                      onClick={() => !isScratched && handleScratchCard(card.id)}
                      className={`relative aspect-video rounded-2xl border p-4 flex flex-col justify-between overflow-hidden select-none select-none transition-all shadow-md text-left ${
                        isScratched 
                          ? "bg-[#fafafa] border-dashed border-slate-200" 
                          : "bg-slate-900 border-slate-800 text-white cursor-pointer hover:scale-103 active:scale-97"
                      }`}
                    >
                      {/* Grey Scratching animation layer */}
                      {isPendingAnim && (
                        <div className="absolute inset-0 bg-slate-300 animate-pulse flex items-center justify-center text-slate-600 font-mono text-xs font-bold leading-relaxed">
                          Scratching card...
                        </div>
                      )}

                      {isScratched ? (
                        <>
                          <div className="space-y-1">
                            <span className="text-[8.5px] font-mono text-emerald-600 font-black tracking-widest block uppercase">REWARD CLAIMED ✓</span>
                            <span className="text-xs font-black font-sans text-slate-900">{card.title}</span>
                          </div>
                          <strong className="text-[11px] font-bold font-mono text-slate-700 bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg text-center leading-tight">
                            {card.prize}
                          </strong>
                        </>
                      ) : (
                        <>
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-mono text-orange-400 font-bold block uppercase tracking-widest text-slate-400">DOUBLE EMISSIONS PRIZE</span>
                            <span className="text-[11.5px] font-extrabold font-mono text-white block tracking-tight">{card.title}</span>
                          </div>
                          
                          <div className="border border-dashed border-slate-700 rounded-lg p-2 flex items-center justify-center bg-slate-950/25 text-center text-orange-300 font-mono text-[9px] font-black uppercase tracking-wider gap-1.5 animate-pulse mt-3 mb-1">
                            <Gift className="w-3 h-3 text-orange-400 shrink-0" />
                            <span>Click to scratch</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: TRAIN ROUTED ORDERS DIRECT DILES */}
          {activeTab === "train" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 font-sans">Indian Railways Train Delivery Services</h3>
                <span className="text-[11px] text-slate-400 font-mono">Live tracking maps and stop coordination panels tailored to train-deck bookings</span>
              </div>

              {/* Station coverage list */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700">
                  <Milestone className="w-4 h-4 text-orange-500" />
                  <span>PREMIER TRANSIT HUB STATION COVERAGE</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-slate-500">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">🚉 Kanpur Central (CNB)</div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">🚉 New Delhi Term. (NDLS)</div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">🚉 Prayagraj Jn (PRYJ)</div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">🚉 Sealdah Terminal (SDAH)</div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">🚉 Patna Junction (PNBE)</div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">🚉 Howrah Junction (HWH)</div>
                </div>
              </div>

              {/* Interactive schedules detail */}
              <p className="text-xs leading-relaxed text-slate-500 font-mono">
                SmartServe integrates live PNR railway telemetry systems. Food packages are thermal-sealed within double-walled heat shields and directly hand-couriered to your train platform berth during designated halt times. No hassle, absolute safety!
              </p>
            </div>
          )}

          {/* TAB 7: FAVORITE DISHES */}
          {activeTab === "favorites" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 font-sans">Hearted Dishes</h3>
                <span className="text-[11px] text-slate-400 font-mono">Select hearts inside menu explore grids to save recurring recipes for fast cart refills</span>
              </div>

              {favorites.length === 0 ? (
                <div className="p-10 text-center text-slate-400 border border-dashed border-slate-150 rounded-xl">
                  <Heart className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs font-mono">No hearted dishes identified yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favorites.map(favId => (
                    <div key={favId} className="border border-slate-100 p-3.5 rounded-xl flex justify-between items-center bg-[#fafafa]">
                      <div className="text-left font-mono">
                        <span className="text-[9.5px] uppercase font-bold block text-slate-400 font-sans mb-0.5">FAVOURITE DISH</span>
                        <strong className="text-xs text-slate-800 text-[11px]">Item Code ID: {favId}</strong>
                      </div>
                      <button
                        onClick={() => handleToggleFavorite(favId)}
                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-current text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: HELP & SUPPORT TICKETS */}
          {activeTab === "support" && (
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 font-sans">Live Help Desk & Tickets</h3>
                  <span className="text-[11px] text-slate-400 font-mono">File complaints, coordinate delivery delays or platform anomalies with support staff</span>
                </div>
                <button
                  onClick={() => setIsCreatingTicket(!isCreatingTicket)}
                  className="bg-slate-900 border border-slate-800 text-white font-mono text-[10px] font-black uppercase px-3 py-2 rounded-lg hover:bg-slate-850 transition-all cursor-pointer flex items-center gap-1 active:scale-97"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreatingTicket ? "Close Draft" : "New Ticket"}</span>
                </button>
              </div>

              {/* Form to append new Support Ticket */}
              {isCreatingTicket && (
                <form onSubmit={handleCreateTicket} className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3 font-mono text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Docket Subject</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs"
                        placeholder="e.g. Noida outlet delivery delay status"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Category</label>
                      <select
                        className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs"
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                      >
                        <option value="Delivery Delay">⏰ Delivery Delay</option>
                        <option value="Food Quality">🍕 Wood-fired Quality</option>
                        <option value="Refund Credits">💳 Refund Credits</option>
                        <option value="App Bugs">⚙️ Technical Error</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Enquiry details</label>
                    <textarea
                      rows={3}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs leading-relaxed"
                      placeholder="Input item identifiers, stations halt timers and other details..."
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                    >
                      File Docket
                    </button>
                  </div>
                </form>
              )}

              {/* Tickets dynamic block */}
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono italic">No tickets filed yet.</p>
                ) : (
                  <div className="space-y-3.5">
                    {tickets.map(t => (
                      <div key={t.id} className="border border-slate-100 bg-[#fafafa] p-4 rounded-xl space-y-3 font-mono text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-900 text-xs">{t.subject}</strong>
                              <span className="text-[8.5px] bg-slate-200 text-slate-550 border border-slate-250 px-1.5 py-0.5 rounded font-black">{t.category}</span>
                            </div>
                            <span className="text-[9.5px] text-slate-400 mt-1 block">ID: {t.id} • {new Date(t.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase border ${
                            t.status === "OPEN" ? "bg-amber-50 text-amber-600 border-amber-200 animate-pulse" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-slate-500 leading-normal bg-white p-2.5 rounded-lg border border-slate-50">{t.description}</p>
                        
                        {/* Conversation Chat threads */}
                        {t.replies && t.replies.length > 0 && (
                          <div className="bg-indigo-50/25 p-3 rounded-lg border border-indigo-50 leading-relaxed text-[10px] space-y-2">
                            {t.replies.map((rep: any, idx: number) => (
                              <div key={idx} className="space-y-1">
                                <span className="font-extrabold text-indigo-700 tracking-tight block uppercase">{rep.sender}</span>
                                <p className="text-slate-600 leading-loose italic">"{rep.message}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: CUSTOMER PROFILE DETAILS */}
          {activeTab === "profile" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 font-sans">Customer Profile Details</h3>
                <span className="text-[11px] text-slate-400 font-mono">Platform profile specifications mapped to local stations registry databases</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-4 font-mono text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black block mb-1 font-bold">CLIENT NAME</span>
                    <strong className="text-slate-900 leading-none">{customerName}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black block mb-1 font-bold">CONTACT PHONE</span>
                    <strong className="text-slate-900 leading-none">{customerPhone}</strong>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black block mb-1 font-bold">PLATFORM ROLE</span>
                    <strong className="text-slate-900 leading-none">Customer (Level 1 Commuter)</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black block mb-1 font-bold">ACCOUNT STATE</span>
                    <span className="text-emerald-600 font-black leading-none uppercase">VERIFIED SECURE ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: CONFIG SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 text-left font-mono">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 font-sans">Platform Preferences</h3>
                <span className="text-[11px] text-slate-400">Manage telemetry alerts, audio chimes and accessibility overrides</span>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 shadow-sm bg-white hover:border-slate-350 transition-colors">
                  <div className="space-y-0.5 text-left text-xs">
                    <strong className="text-slate-850 block">Approaching Proximity Chimes</strong>
                    <span className="text-[10px] text-slate-400 block pb-1">Triggers automated speech notifications when rider gets within 400m locks</span>
                  </div>
                  <Volume2 className="w-5 h-5 text-orange-500" />
                </div>
                
                <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 shadow-sm bg-white hover:border-slate-350 transition-colors">
                  <div className="space-y-0.5 text-left text-xs">
                    <strong className="text-slate-850 block">Dual-Engine Map Vectors</strong>
                    <span className="text-[10px] text-slate-400 block pb-1">Load high performance Maplibre rendering alongside default OSM vector tracks</span>
                  </div>
                  <Layers className="w-5 h-5 text-orange-500" />
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 shadow-sm bg-white hover:border-slate-350 transition-colors">
                  <div className="space-y-0.5 text-left text-xs">
                    <strong className="text-slate-850 block">Hardware Thermal POS handshakes</strong>
                    <span className="text-[10px] text-slate-400 block pb-1">Automatically send compiled client invoice telemetry to standard 58mm receivers</span>
                  </div>
                  <Printer className="w-5 h-5 text-orange-500" />
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* RIDER CALL DIALER VoIP OVERLAY */}
      <AnimatePresence>
        {isDialingRider && activeTrackedOrder && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white max-w-sm w-full text-center space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsDialingRider(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-lg bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-3">
                <span className="text-[9px] text-orange-400 font-mono tracking-widest font-black uppercase block">SmartServe Encrypted VoIP Handshake</span>
                
                <div className="flex items-center justify-center py-4 relative">
                  <div className="absolute w-20 h-20 rounded-full bg-emerald-500/25 animate-ping" />
                  <div className="relative w-16 h-16 rounded-full bg-emerald-600 border border-emerald-400 flex items-center justify-center text-3xl shadow-xl">
                    📞
                  </div>
                </div>

                <div className="space-y-1 font-mono">
                  <h4 className="text-sm font-black">{activeTrackedOrder.riderName || "Rider Captain"}</h4>
                  <p className="text-slate-400 text-xs">+91 98765 43201</p>
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 text-xs text-left font-mono leading-relaxed space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">VoIP CALL CONNECTION:</span>
                  <span className={`font-black uppercase tracking-widest ${callStatus === "connected" ? "text-emerald-400" : "text-amber-400 animate-pulse"}`}>
                    {callStatus}
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-300 italic leading-loose">
                  {callStatus === "dialing" && "Initializing secured VoIP platform handshake..."}
                  {callStatus === "ringing" && "handshake accepted. Ringing receiver unit..."}
                  {callStatus === "connected" && `"Hello sir! Yes, I have your hot thermal meal safely packed inside double-walled heat shields. Traversing Jabalpur-Noida roads cleanly. OTP request ready. Arriving now!"`}
                </p>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => setIsDialingRider(false)}
                  className="w-full bg-red-600 hover:bg-red-750 text-white font-mono text-[10.5px] font-black uppercase py-3 rounded-xl transition-all cursor-pointer"
                >
                  Terminate Call
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC HIGH-FIDELITY THERMAL BILL PRINT DIALOG MODAL Overlay */}
      <AnimatePresence>
        {activeInvoiceOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[380px] flex flex-col transition-all"
            >
              {/* Paper feed chassis loader */}
              <div className="bg-slate-800 text-slate-400 p-3 rounded-t-2xl border-t border-x border-slate-705 shadow-inner text-center font-mono text-[9px] flex items-center justify-between px-6 select-none">
                <span>PRINTER FEED: ACTIVE</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>RECEIPT PRINTER (58MM)</span>
              </div>
              <div className="bg-slate-900 h-2 mx-4 relative z-10 shadow-lg border-b border-slate-950" />

              {/* White thermal receipt rolls downwards */}
              <motion.div
                initial={{ height: 140, y: -20, opacity: 0.5 }}
                animate={{ height: "auto", y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 45, delay: 0.15 }}
                className="bg-[#fcfdfc] text-slate-800 px-6 py-8 shadow-2xl relative overflow-hidden flex flex-col font-mono text-[11px] leading-relaxed border-b-8 border-dashed border-slate-300 rounded-b-2xl select-none"
                style={{ backgroundImage: "repeating-linear-gradient(rgba(0,0,0,0.004), rgba(0,0,0,0.004) 2px, transparent 2px, transparent 4px)" }}
              >
                {/* 3. WATERMARK: Centered brand logogram */}
                <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0 overflow-hidden">
                  <div className="text-slate-900 font-extrabold text-[3.25rem] tracking-[0.22em] opacity-[0.06] rotate-[-12deg] whitespace-nowrap">
                    SMARTSERVE
                  </div>
                </div>

                <div className="relative z-10 w-full">
                  {/* 1. Header Branded blocks */}
                  <div className="text-center space-y-1 mb-3">
                    <h2 className="text-base font-black text-slate-950 tracking-[0.14em]">SMARTSERVE FOODS</h2>
                    <p className="text-[10px] text-slate-500 font-bold italic">"Delicious Food, Delivered Smartly"</p>
                    <p className="text-[9px] text-slate-450 uppercase mt-0.5">{activeInvoiceOrder.branchName}</p>
                    <p className="text-[9.5px] text-slate-650 font-semibold">GSTIN: 07AAACS7841M1ZN</p>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center uppercase tracking-wider mb-2">
                    ------------------------------------------
                  </div>

                  {/* Operational parameters */}
                  <div className="space-y-1 text-slate-700 mt-1 mb-3 text-left">
                    <div className="flex justify-between">
                      <span>Order Ref ID:</span>
                      <span className="font-extrabold text-slate-950">#{activeInvoiceOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date Docket:</span>
                      <span>{new Date(activeInvoiceOrder.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Filed:</span>
                      <span>{new Date(activeInvoiceOrder.createdAt).toLocaleTimeString("en-IN", { timeStyle: "short" })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Mode:</span>
                      <strong className="uppercase text-slate-950">{activeInvoiceOrder.orderMode || "DELIVERY"}</strong>
                    </div>

                    {activeInvoiceOrder.orderMode === "train" && (
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1 text-[10px] text-left mt-2">
                        <div className="flex justify-between">
                          <span>Seat/Berth Spot:</span>
                          <span className="font-bold text-slate-900">{activeInvoiceOrder.seatInfo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Railway PNR:</span>
                          <span className="font-bold text-slate-900">{activeInvoiceOrder.pnr}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Train:</span>
                          <span className="font-bold text-slate-900">{activeInvoiceOrder.trainNumber || "Exp"}</span>
                        </div>
                      </div>
                    )}

                    {activeInvoiceOrder.orderMode !== "train" && activeInvoiceOrder.deliveryAddress && (
                      <div className="mt-2 text-[10px] text-slate-550 border-t border-dashed border-slate-205 pt-1.5 leading-normal text-left">
                        <span>Delivery Address location:</span>
                        <p className="font-extrabold text-slate-950 block leading-tight mt-0.5">{activeInvoiceOrder.deliveryAddress}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 text-center uppercase tracking-wider mb-2">
                    ------------------------------------------
                  </div>

                  {/* Food contents */}
                  <div className="space-y-2 mt-2 font-mono text-left">
                    {activeInvoiceOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs text-slate-800 py-0.5">
                        <span className="flex-1 pr-4 leading-snug">
                          {it.name} <span className="text-[10px] text-slate-400">x{it.qty}</span>
                        </span>
                        <strong className="text-slate-950 shrink-0">₹{it.price * it.qty}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-400 text-center uppercase tracking-wider my-3">
                    ------------------------------------------
                  </div>

                  {/* Accounting checkout matrix */}
                  <div className="space-y-1.5 text-slate-700 text-left">
                    <div className="flex justify-between">
                      <span>Subtotal value:</span>
                      <span>₹{activeInvoiceOrder.total - activeInvoiceOrder.tax - (activeInvoiceOrder.deliveryCharge || 0) + (activeInvoiceOrder.discount || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST 5% Ledger charge:</span>
                      <span>₹{activeInvoiceOrder.tax}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Zero-emission Delivery charge:</span>
                      <span>₹{activeInvoiceOrder.deliveryCharge || 0}</span>
                    </div>
                    {activeInvoiceOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-650">
                        <span>Campaign Discount Coupon:</span>
                        <span>- ₹{activeInvoiceOrder.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1.5 border-t border-dashed border-slate-200 text-xs font-black text-slate-950">
                      <span>GRAND BILL TOTAL DUE:</span>
                      <span className="text-orange-500 font-mono text-xs">₹{activeInvoiceOrder.total}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Transaction statement status:</span>
                      <span className={`font-mono text-[9px] font-extrabold uppercase ${
                        activeInvoiceOrder.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"
                      }`}>
                        {activeInvoiceOrder.paymentStatus === "Paid" ? "✅ Paid Complete" : "⚠️ Payment Due (COD)"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Settlement Channel:</span>
                      <strong className="uppercase text-slate-700">{activeInvoiceOrder.paymentMethod || "COD"}</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center uppercase tracking-wider my-2">
                    ------------------------------------------
                  </div>

                  <div className="text-center text-[10px] text-slate-500 font-bold tracking-wider space-y-1.5 mt-2">
                    <p>"Thank you for dining with SmartServe!"</p>
                    <p className="text-[8px] text-slate-400 font-normal">This thermal ticket is zero-carbon printed.</p>
                  </div>

                  {/* Red stamp */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.85 }}
                    transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.4 }}
                    className="absolute bottom-20 right-5 border-4 border-double border-red-500 text-red-600 font-mono tracking-wider font-extrabold uppercase text-[10px] py-1.5 px-3 rounded-full leading-none shadow-sm flex flex-col items-center select-none pointer-events-none bg-white/95 rotate-[-12deg]"
                  >
                    <span className="text-[7px] tracking-widest text-red-500 font-bold mb-0.5">SMARTSERVE</span>
                    <span className="text-[10px] font-black tracking-tight text-red-600">VERIFIED ✓</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Action buttons completed once print finishes */}
              <div className="flex items-center gap-3.5 mt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-3 rounded-xl font-mono text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md text-center flex items-center justify-center gap-1.5 active:scale-97"
                >
                  📥 Export PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveInvoiceOrder(null);
                  }}
                  className="flex-1 bg-primary hover:bg-orange-650 text-white bg-orange-600 hover:bg-orange-700 py-3 rounded-xl font-mono text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg text-center flex items-center justify-center gap-1.5 active:scale-97"
                >
                  Close Receipt
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
