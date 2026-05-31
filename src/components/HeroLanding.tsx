import React, { useState, useEffect } from "react";
import { MenuItem } from "../types";
import { Search, ChefHat, MapPin, Compass, Percent, Star, ArrowRight, ShieldCheck, Zap, Clock, ThumbsUp, Tag, Car, Coffee, Train, Check, AlertCircle, X, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  onNavigate: (page: string, category?: string) => void;
  menu: MenuItem[];
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
  pnrStationInfo: any;
  setPnrStationInfo: (val: any) => void;
  setSelectedBranchCode: (val: string) => void;
  addToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
  checkoutAddress: string;
  onChangeCheckoutAddress: (val: string) => void;
}

export default function HeroLanding({
  onNavigate,
  menu,
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
  pnrStationInfo,
  setPnrStationInfo,
  setSelectedBranchCode,
  addToast,
  checkoutAddress,
  onChangeCheckoutAddress,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [matchedSearchResults, setMatchedSearchResults] = useState<MenuItem[]>([]);
  
  // Interactive Catering configurator state for the 6th card
  const [cateringModalOpen, setCateringModalOpen] = useState(false);
  const [cateringGuests, setCateringGuests] = useState(25);
  const [selectedCateringPkg, setSelectedCateringPkg] = useState("corporate");
  const [cateringAddons, setCateringAddons] = useState<string[]>(["crockery"]);
  
  // Location detection states
  const [detectedBranch, setDetectedBranch] = useState<any>(null);
  const [detectingState, setDetectingState] = useState<"not_started" | "detecting" | "success">("not_started");
  
  // Dynamic AI Suggestions with server integration
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Auto trigger location detection mock on component mount
  const handleDetectLocation = () => {
    setDetectingState("detecting");
    setTimeout(() => {
      setDetectedBranch({
        name: "SmartServe CP (Connaught Palace Circle)",
        distance: "1.2 km away",
        estTransit: "14 mins arrival",
        coord: "28.6299° N, 77.2183° E",
        branchCode: "DEL-CP"
      });
      setDetectingState("success");
    }, 1100);
  };

  useEffect(() => {
    handleDetectLocation();
    fetchFreshAISuggestion();
  }, []);

  // Update matched items as user types search query
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const queryLower = searchQuery.toLowerCase();
      const filtered = menu.filter(
        (m) =>
          m.name.toLowerCase().includes(queryLower) ||
          m.category.toLowerCase().includes(queryLower) ||
          m.tags.some((t) => t.toLowerCase().includes(queryLower))
      );
      setMatchedSearchResults(filtered.slice(0, 5));
    } else {
      setMatchedSearchResults([]);
    }
  }, [searchQuery, menu]);

  // Invoke server side custom Gemini suggestions using fetch API
  const fetchFreshAISuggestion = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch("/api/gemini/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentCart: [], filterPreference: "Best Rated Choice" })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestion(data.markdown);
      }
    } catch (e) {
      console.error("Failed to parse recommendation insights:", e);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Static high value special promos
  const couponsPool = [
    { code: "FESTIVE50", desc: "Flat 50% Off up to ₹150 instantly", tag: "Most Popular", minOrder: "₹199" },
    { code: "FIRST100", desc: "Flat ₹100 Off on your very first order", tag: "New Users", minOrder: "₹299" },
    { code: "SMARTAI", desc: "Flat 15% Off automatically via AI-OS", tag: "AI Exclusive", minOrder: "₹0" }
  ];

  return (
    <div className="space-y-12 pb-16 font-sans text-slate-800" id="view-hero-landing">
      
      {/* 1. Immersive 2-Column Hero Segment */}
      <section className="relative bg-slate-950 text-white rounded-3xl overflow-hidden py-12 px-6 sm:px-10 lg:px-16 shadow-2xl border border-slate-900">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-color-burn">
          <img
            src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&auto=format&fit=crop&q=80"
            alt="Food Backdrop"
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/90 to-slate-900/40 pointer-events-none"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-orange-400 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider">
              <ChefHat className="w-3.5 h-3.5 animate-pulse text-orange-400" />
              <span>CLOUD KITCHEN REVOLUTION: 15MIN DIRECT-GRID DELIVERY</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] font-display">
              Hungry? Crisp Convection <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Pizzas & smoky Burgers</span> in 15 Mins.
            </h2>

            <p className="text-sm text-slate-350 max-w-xl leading-relaxed">
              No middleman commission hikes, and zero delayed deliveries. SmartServe owns every kitchen, thermodynamic sensors, and our in-house delivery fleet for stellar food hygiene.
            </p>

            {/* Interactive Search Bar & Live Autocomplete */}
            <div className="relative max-w-lg">
              <div className="bg-white p-2 rounded-2xl shadow-xl text-slate-800 flex flex-col sm:flex-row gap-2 border border-slate-100 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/30">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="w-4 h-4 text-orange-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search standard menu (e.g. Pizza, Burger, Mojito...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 py-1"
                  />
                </div>
                <button
                  onClick={() => onNavigate("order")}
                  className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-orange-500/20 cursor-pointer"
                  id="hero-btn-explore-menu"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Instant Search Result Dropdown */}
              <AnimatePresence>
                {matchedSearchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl text-left border border-slate-200 overflow-hidden text-slate-800 z-50 divide-y divide-slate-100"
                  >
                    <div className="p-2.5 bg-orange-50/50 text-[10px] font-bold text-primary uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-primary animate-bounce" />
                      <span>Instant Kitchen Matches</span>
                    </div>
                    {matchedSearchResults.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => onNavigate("order", m.category)}
                        className="flex items-center justify-between p-3 hover:bg-orange-50/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={m.image} className="w-9 h-9 rounded-lg object-cover bg-slate-100 grow-0 shrink-0 shadow-sm" referrerPolicy="no-referrer" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{m.name}</h4>
                            <span className="text-[9px] text-slate-400 capitalize font-medium">{m.category} • ⭐ {m.rating}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-slate-900 font-mono">₹{m.price}</div>
                          <span className="text-[10px] text-primary font-bold">Configure +</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Visual Call To Action for Railway Deliveries */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate("train-order")}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer font-display"
                id="hero-btn-train-mode"
              >
                <span>🚆 Commuter PNR Train Dispatch</span>
              </button>
              <button 
                onClick={() => onNavigate("partner")}
                className="bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white border border-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer font-sans"
              >
                Become a Franchise Partner
              </button>
            </div>

            {/* Geolocation Hook Status Output */}
            <div className="pt-2 min-h-[36px]">
              {detectingState === "detecting" ? (
                <div className="inline-flex items-center gap-2 text-xs text-orange-200/80 font-mono bg-orange-950/30 px-3 py-1.5 rounded-lg border border-orange-500/10 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-orange-400 animate-ping"></span>
                  <span>Resolving live device GPS grid coordination...</span>
                </div>
              ) : detectingState === "success" && detectedBranch ? (
                <div className="inline-flex flex-wrap items-center justify-start gap-x-3 gap-y-1 bg-slate-900/60 border border-slate-800 py-2 px-3.5 rounded-xl text-xs max-w-xl shadow-inner">
                  <div className="flex items-center gap-1.5 text-orange-400 font-semibold font-mono">
                    <MapPin className="w-3.5 h-3.5 animate-bounce" />
                    <span>Active Kitchen:</span>
                    <span className="text-white underline decoration-dashed decoration-orange-400 underline-offset-2">{detectedBranch.name}</span>
                  </div>
                  <span className="text-slate-700">|</span>
                  <span className="text-orange-400 font-bold font-mono text-[11px]">{detectedBranch.distance}</span>
                  <span className="text-slate-700">|</span>
                  <span className="text-slate-300 font-mono text-[11px]">{detectedBranch.estTransit}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Hero Column: Swiggy style bento/collage for food visuals */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] h-[340px] sm:max-w-[400px] sm:h-[400px]">
              {/* Main item image */}
              <div className="absolute top-4 left-4 w-[75%] h-[75%] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 rotate-[-4deg] group transition-transform duration-500 hover:rotate-0">
                <img 
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Convection Oven Pepperoni Pizza"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 text-amber-400 font-mono font-black text-[10px] px-2 py-1 rounded-xl flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>4.9 Bestseller</span>
                </div>
              </div>

              {/* Overlapping secondary image (Juicy Burger) */}
              <div className="absolute bottom-4 right-4 w-[60%] h-[60%] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 rotate-[8deg] group transition-transform duration-500 hover:rotate-0">
                <img 
                  src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Brioche Double Stack Burger"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 right-3 bg-red-650 bg-slate-950/95 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-lg">
                  Smoky Stack
                </div>
              </div>

              {/* Floating Indicator Card 1 */}
              <div className="absolute left-[-10px] bottom-[25%] bg-white text-slate-950 p-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-100 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-primary">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Instant Transit</span>
                  <span className="text-[10px] font-black text-slate-800">⏱ 15m Delivery</span>
                </div>
              </div>

              {/* Floating Indicator Card 2 */}
              <div className="absolute right-[-12px] top-[15%] bg-white text-slate-950 p-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-100 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Sterilized Hygiene</span>
                  <span className="text-[10px] font-black text-slate-800">100% In-House</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HOMEPAGE ADVANCED ORDERING CHANNELS */}
      <section className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm space-y-8" id="homepage-order-channels-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 border-slate-200/60">
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-black tracking-widest uppercase text-primary block leading-none">SmartServe Kitchen Cloud</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight font-display">
              Activate Dispatch Channel
            </h3>
            <p className="text-sm font-sans text-slate-500 font-medium leading-relaxed max-w-2xl">
              Our advanced thermodynamic preservation corridors and real-time transit telemetry synchronize food preparations with your physical coordinate space.
            </p>
          </div>
          <div className="hidden lg:block text-right shrink-0">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] uppercase font-mono font-bold tracking-wider rounded-lg border border-primary/20">
              ⚡ Status:Online Facility Available
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: "delivery",
              title: "Smart GPS Delivery",
              desc: "Thermal-sealed container runner dispatched straight to your door or workspace.",
              tag: "Hot box",
              badge: "GPS Tracked",
              icon: <MapPin className="w-5 h-5 text-white" />,
              image: "https://images.unsplash.com/photo-1607273685680-6bd976c5a5ce?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGdwcyUyMGFpJTIwZGVsaXZlcnklMjBmb29kJTIwaGQlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D"
            },
            {
              id: "dine-in",
              title: "Tableside Dine-In",
              desc: "Scan and select. Hot culinary creations routed straight from express kitchen conveyors.",
              tag: "Warm serve",
              badge: "Indoors",
              icon: <Coffee className="w-5 h-5 text-white" />,
              image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"
            },
            {
              id: "in-car",
              title: "Drive-In Service",
              desc: "Convection pockets routed directly to your vehicle parking slot with zero-spill design.",
              tag: "Spill-free",
              badge: "Drive-In",
              icon: <Car className="w-5 h-5 text-white" />,
              image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80"
            },
            {
              id: "pickup",
              title: "Counter Pickup",
              desc: "Hot culinary boxes cached inside heated infrared lockbox cabinets for instant takeaway.",
              tag: "No queue",
              badge: "Self-Serve",
              icon: <Clock className="w-5 h-5 text-white" />,
              image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80"
            },
            {
              id: "train",
              title: "IRCTC Train Berth",
              desc: "Live route-linked platform runners deliver steaming bento directly to your coach seat stop.",
              tag: "On tracks",
              badge: "Telemetry Linked",
              icon: <Train className="w-5 h-5 text-white" />,
              image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
              isTrain: true
            },
            {
              id: "catering",
              title: "Group Catering",
              desc: "Seamlessly customize thermodynamic bulk platters for office lunch, group gathers & parties.",
              tag: "Bulk deals",
              badge: "Catering",
              icon: <ChefHat className="w-5 h-5 text-white" />,
              image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80",
              isCatering: true
            }
          ].map((mode) => {
            const isSelected = selectedOrderMode === mode.id;
            const isCatering = mode.isCatering;
            
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  if (isCatering) {
                    setCateringModalOpen(true);
                    addToast("Configuring Smart Catering options for group dining!", "info");
                  } else {
                    onChangeOrderMode(mode.id as any);
                    if (mode.id === "train") {
                      setSelectedBranchCode("KNP-JN");
                    }
                    addToast(`Dispatch canal updated to ${mode.title}! 📦`, "success");
                  }
                }}
                className={`group relative h-[255px] w-full text-left rounded-[20px] overflow-hidden shadow-lg transition-all duration-300 transform cursor-pointer focus:outline-none active:scale-[0.97] ${
                  isSelected
                    ? "border-[3px] border-primary scale-[1.02] shadow-xl shadow-primary/25 ring-4 ring-primary/20"
                    : isCatering && cateringModalOpen
                    ? "border-[3px] border-amber-500 scale-[1.02] shadow-xl"
                    : "border border-slate-100 hover:border-primary/55 hover:scale-[1.015]"
                }`}
              >
                {/* Visual Background Image with Smooth Scale and Train Move */}
                <div 
                  className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 ${
                    mode.isTrain ? "animate-train-pan" : ""
                  }`}
                  style={{ backgroundImage: `url('${mode.image}')` }}
                />

                {/* Ambient Darkness Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-950/15 group-hover:via-slate-950/65 transition-all duration-300" />
                
                {/* Accent Hover Hue */}
                <div className={`absolute inset-0 bg-gradient-to-tr transition-opacity duration-300 ${
                  isSelected ? "from-primary/15 to-transparent opacity-100" : "from-primary/10 to-transparent opacity-0 group-hover:opacity-100"
                }`} />

                {/* Card Content Layout */}
                <div className="relative z-10 h-full w-full p-5 flex flex-col justify-between">
                  {/* Card Header Info */}
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
                      isSelected 
                        ? "bg-primary border-primary/30 text-white shadow-md shadow-primary/30" 
                        : "bg-white/10 border-white/20 text-white"
                    }`}>
                      {mode.icon}
                    </div>
                    
                    <span className={`text-[9px] font-mono font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
                      isSelected 
                        ? "bg-white text-primary border-primary/30 font-black shadow-xs" 
                        : isCatering && cateringModalOpen
                        ? "bg-amber-100 border-amber-200 text-amber-805 font-bold"
                        : "bg-white/10 border-white/20 text-white"
                    }`}>
                      {mode.badge}
                    </span>
                  </div>

                  {/* Card Footer Titles and Descriptions */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-tight font-display leading-none">
                        {mode.title}
                      </h4>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping inline-block" />
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs leading-relaxed font-sans text-slate-200 line-clamp-2">
                      {mode.desc}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] font-mono font-bold uppercase text-slate-100 tracking-widest leading-none bg-black/45 px-2 py-0.5 rounded">
                        {mode.tag}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-white uppercase group-hover:text-primary transition-colors flex items-center gap-0.5">
                        {isSelected ? "✓ Active" : isCatering ? "Configure →" : "Select →"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Context Settings Area inside Homepage for instant edits */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-700 text-xs shadow-inner">
          {selectedOrderMode === "dine-in" && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
              <div>
                <span className="text-[9.5px] text-indigo-700 uppercase font-black block font-mono">Dine-In Configuration Setup</span>
                <span className="text-slate-600 block mt-0.5">Please indicate your dining table coordinates for rapid tableside thermal direct kitchen routing:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={dineInTableNumber}
                  onChange={(e) => onChangeDineInTableNumber(e.target.value)}
                  placeholder="e.g. Table 4"
                  className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-805 outline-none focus:border-indigo-300 w-36 font-mono"
                />
                <span className="text-xs text-indigo-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-indigo-600" /> Saved
                </span>
              </div>
            </div>
          )}

          {selectedOrderMode === "pickup" && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
              <div>
                <span className="text-[9.5px] text-amber-700 uppercase font-black block font-mono">Self-Pickup Expected Target Time</span>
                <span className="text-slate-600 block mt-0.5">Container remains tucked inside heated isolation cabinets for a dry-air hot seal guarantee:</span>
              </div>
              <div className="flex gap-1.5">
                {["15 mins", "30 mins", "45 mins", "Later"].map((time) => (
                  <button
                    key={time}
                    onClick={() => onChangePickupTimeEstimate(time)}
                    className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
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
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 text-left">
              <div>
                <span className="text-[9.5px] text-sky-700 uppercase font-black block font-mono">In-Car Bay Selection Config</span>
                <span className="text-slate-600 block">Runners deliver clean convection packets directly to your slot plate:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono font-black">Slot Bay:</span>
                  <input
                    type="text"
                    value={inCarSpotNumber}
                    onChange={(e) => onChangeInCarSpot(e.target.value)}
                    placeholder="e.g. Bay 3"
                    className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold font-mono text-slate-805 outline-none w-28"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono font-black">Vehicle Tag:</span>
                  <input
                    type="text"
                    value={inCarVehiclePlate}
                    onChange={(e) => onChangeInCarVehiclePlate(e.target.value)}
                    placeholder="e.g. White Creta UP32..."
                    className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold font-mono text-slate-805 outline-none w-52"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedOrderMode === "delivery" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div>
                <span className="text-[9.5px] text-orange-700 uppercase font-black block font-mono">Standard GPS Convection Dispatch Address</span>
                <span className="text-slate-605 block mt-0.5">Specify delivery coordinates. Check instant checkout ETA on menu checkout:</span>
              </div>
              <input
                type="text"
                value={checkoutAddress}
                onChange={(e) => onChangeCheckoutAddress(e.target.value)}
                placeholder="E.g. Room 42, Level 2, Connaught Circus..."
                className="bg-white border border-slate-202 px-3  py-2 rounded-xl text-xs font-semibold text-slate-805 outline-none w-72 focus:border-orange-300"
              />
            </div>
          )}

          {selectedOrderMode === "train" && (
            <div className="space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[9.5px] text-rose-705 text-red-700 uppercase font-black block font-mono">IRCTC Track Booking Synced stop</span>
                  <span className="text-slate-600 block text-xs">Enter PNR status here, or check out simulated routes directly:</span>
                </div>
                {pnrStationInfo ? (
                  <div className="bg-white border border-emerald-100 px-3 py-2 rounded-xl flex items-center gap-3 shadow-xs">
                    <p className="text-[10.5px] font-mono leading-tight">
                      Train: <strong className="text-slate-800">{pnrStationInfo.trainName} ({pnrStationInfo.trainNo})</strong> <br />
                      Station stop: <strong className="text-slate-850">{pnrStationInfo.stationName}</strong>
                    </p>
                    <button
                      onClick={() => setPnrStationInfo(null)}
                      className="text-[9.5px] font-mono text-red-500 hover:text-red-700 uppercase px-2 py-1 rounded bg-slate-50 border border-slate-200 font-bold"
                    >
                      Reset Route
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9.5px] text-slate-400 font-mono italic">Demo PNR routes:</span>
                    {[
                      { pnr: "1234567890", name: "Rajdhani" },
                      { pnr: "9876543210", name: "Duronto" }
                    ].map((demo) => (
                      <button
                        key={demo.pnr}
                        onClick={async () => {
                          addToast(`Acquiring route telemetry for PNR ${demo.pnr}...`, "info");
                          try {
                            const res = await fetch(`/api/train/pnr?pnrNumber=${demo.pnr}`);
                            const d = await res.json();
                            if (d.success) {
                              if (d.fallback) {
                                addToast("Unable to fetch live train data", "error");
                              }
                              const trainData = d.train;
                              const index = trainData.currentStationIndex ?? 0;
                              const upcomingStops = trainData.routeStops.slice(index + 1);
                              const selectedStop = upcomingStops.find((stop: any) => stop.stationCode !== trainData.routeStops[index]?.stationCode) || trainData.routeStops[index + 1] || trainData.routeStops[0];

                              setPnrStationInfo({
                                pnr: trainData.pnr,
                                trainNo: trainData.trainNo,
                                trainName: trainData.trainName,
                                coach: trainData.coach || "A1",
                                seat: trainData.seat || "42",
                                stationCode: selectedStop?.stationCode || "CNB",
                                stationName: selectedStop?.stationName || "Kanpur Central Station",
                                routeStops: trainData.routeStops,
                                currentStationIndex: index,
                                currentDelayMins: trainData.currentDelayMins ?? 0
                              });
                              setSelectedBranchCode("KNP-JN");
                              addToast(`Matched itinerary on train ${trainData.trainName}! 🥩`, "success");
                            }
                          } catch (e) {
                            addToast("Operational query delay.", "error");
                          }
                        }}
                        className="bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-bold text-slate-700 cursor-pointer"
                      >
                        🚆 {demo.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!pnrStationInfo && (
                <div className="flex items-center gap-2 max-w-lg border-t pt-2 border-slate-200/50">
                  <input
                    type="text"
                    placeholder="Enter Your 10-Digit IRCTC PNR Number..."
                    className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none w-full focus:border-red-400"
                    maxLength={10}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (!/^[0-9]{10}$/.test(val)) {
                          addToast("Enter valid 10-digit PNR", "error");
                          return;
                        }
                        addToast(`Validating PNR ${val}...`, "info");
                        try {
                          const res = await fetch(`/api/train/pnr?pnrNumber=${val}`);
                          const d = await res.json();
                          if (d.success) {
                            if (d.fallback) {
                              addToast("Unable to fetch live train data", "error");
                            }
                            const trainData = d.train;
                            const index = trainData.currentStationIndex ?? 0;
                            const upcomingStops = trainData.routeStops.slice(index + 1);
                            const selectedStop = upcomingStops.find((stop: any) => stop.stationCode !== trainData.routeStops[index]?.stationCode) || trainData.routeStops[index + 1] || trainData.routeStops[0];

                            setPnrStationInfo({
                              pnr: trainData.pnr,
                              trainNo: trainData.trainNo,
                              trainName: trainData.trainName,
                              coach: trainData.coach || "B1",
                              seat: trainData.seat || "14",
                              stationCode: selectedStop?.stationCode || "CNB",
                              stationName: selectedStop?.stationName || "Kanpur Central Station",
                              routeStops: trainData.routeStops,
                              currentStationIndex: index,
                              currentDelayMins: trainData.currentDelayMins ?? 0
                            });
                            setSelectedBranchCode("KNP-JN");
                            addToast(`IRCTC itinerary locked: ${trainData.trainName}!`, "success");
                          } else {
                            addToast("PNR code not matched in current database.", "error");
                          }
                        } catch (err) {
                          addToast("Check failed due to network latency.", "error");
                        }
                      }
                    }}
                  />
                  <span className="text-[10px] text-slate-400 font-mono italic shrink-0">Press [Enter] Key</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button to launch the order catalog */}
        <div className="pt-2 flex justify-start">
          <button
            onClick={() => onNavigate("order")}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-extrabold px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-orange-500/15 flex items-center gap-2 cursor-pointer font-display uppercase tracking-wider"
          >
            <span>Confirm Mode & Go to Ordering Menu</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </section>

      {/* 2. Categorization Grid shortcuts */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b pb-2 border-slate-100">
          <h3 className="text-base font-extrabold uppercase text-slate-800 tracking-tight font-display flex items-center gap-1.5">
            <span className="text-primary">🍕</span> Explore Kitchen Categories
          </h3>
          <span className="text-[10px] text-slate-400 font-mono font-bold">AUTOMATED TEMPERATURE CONTROL</span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tag: "Pizza", desc: "Fresh Convection Conical Oven Crisp Crusts", count: "4.9/5 Rating", icon: "🍕", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=60" },
            { tag: "Burger", desc: "Toasted Brioche Double Grilled Patty Stack", count: "4.8/5 Rating", icon: "🍔", img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&auto=format&fit=crop&q=60" },
            { tag: "Wraps", desc: "Stuffed Whole Wheat Dynamic Tortilla Roll", count: "4.7/5 Rating", icon: "🌯", img: "https://images.unsplash.com/photo-1626700051175-6518c4793f06?w=300&auto=format&fit=crop&q=60" },
            { tag: "Drinks", desc: "Artisanal Shakes & Refreshing Soda Mojitos", count: "4.9/5 Rating", icon: "🥤", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=60" }
          ].map((cat) => (
            <div
              key={cat.tag}
              onClick={() => onNavigate("order", cat.tag)}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-xl hover:border-orange-200 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute right-3 top-3 text-3xl group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">
                {cat.icon}
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight font-display">{cat.tag}</h4>
              <p className="text-[10.5px] text-slate-400 mt-1 mr-12 leading-tight min-h-[28px]">{cat.desc}</p>
              <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-primary font-bold">
                <span>{cat.count}</span>
                <span className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">Browse Menu →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Pure Swiggy/Zomato Style Active Promo & Offers Banner Grid */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b pb-2 border-slate-100">
          <h3 className="text-base font-extrabold uppercase text-slate-800 tracking-tight font-display flex items-center gap-1.5">
            <span className="text-primary">✨</span> Today's Premium Slashes
          </h3>
          <span className="text-[10px] text-slate-400 font-mono font-bold">COPY CODES AT CHECKOUT</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {couponsPool.map((cp) => (
            <div
              key={cp.code}
              className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 p-4.5 relative overflow-hidden flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-lg hover:border-orange-200"
            >
              <div className="absolute top-0 right-0 bg-primary text-white font-mono text-[9px] font-extrabold px-2.5 py-0.5 rounded-bl-xl shadow-sm">
                {cp.tag}
              </div>
              
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black text-orange-500 uppercase tracking-widest bg-orange-100 px-1.5 py-0.5 rounded">
                  <Percent className="w-2.5 h-2.5" /> CODE ACTIVE
                </span>
                <p className="text-xs text-slate-800 font-sans font-bold mt-2 leading-snug">{cp.desc}</p>
                <p className="text-[10px] text-slate-400 font-medium">Valid on orders above {cp.minOrder}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-orange-100/50 pt-3">
                <div className="bg-white border-2 border-dashed border-primary/30 text-primary font-mono text-xs font-black px-3.5 py-1 rounded-lg">
                  {cp.code}
                </div>
                <button
                  onClick={() => handleCopyCode(cp.code)}
                  className={`text-[10px] font-mono uppercase tracking-wider font-extrabold transition-all px-2.5 py-1.5 rounded-lg cursor-pointer ${copiedCode === cp.code ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 hover:bg-orange-200 text-primary"}`}
                >
                  {copiedCode === cp.code ? "Copied✓" : "Copy Code"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Special AI Chef suggestion module */}
      <section className="bg-gradient-to-r from-orange-900 to-amber-950 text-white rounded-3xl p-6 shadow-xl border border-orange-800/20 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-orange-500 opacity-10 pointer-events-none blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-orange-400 bg-opacity-20 border border-orange-400 border-opacity-30 text-orange-300 px-2 rounded-md py-1 text-[10px] font-mono font-bold tracking-wider">
              <ChefHat className="w-3 h-3 text-orange-400" />
              <span>DYNAMIC AI RECOMMENDATION ENGINE</span>
            </div>
            <h3 className="text-lg font-black text-orange-100 font-display">Antigravity AI Food Pairing Advisory</h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Analyzes raw local commute times, Connaught Place preparation metrics, and ingredient freshness to predict the ultimate meal pairing combination for you.
            </p>
          </div>
          <button
            onClick={fetchFreshAISuggestion}
            disabled={loadingAI}
            className="bg-primary hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md border border-orange-500 shrink-0 cursor-pointer"
          >
            <Compass className={`w-3.5 h-3.5 ${loadingAI ? "animate-spin" : ""}`} />
            <span>Regenerate Pairings</span>
          </button>
        </div>

        {/* Suggestion print output with beautiful styling */}
        <div className="mt-5 bg-[#170e06] bg-opacity-90 border border-orange-900/60 rounded-2xl p-4 sm:p-5 text-xs space-y-2 text-slate-200 transition-all font-sans leading-relaxed shadow-inner">
          {loadingAI ? (
            <div className="py-6 text-center text-slate-400 font-mono text-[11px] animate-pulse flex flex-col items-center justify-center gap-2.5">
              <Zap className="w-5 h-5 text-orange-400 animate-spin" />
              <span>Synthesizing transaction logic via server-side Google Gemini node...</span>
            </div>
          ) : (
            <div 
              className="prose prose-sm text-slate-200 mt-1 prose-headings:text-orange-300 prose-headings:font-bold prose-headings:text-xs prose-strong:text-orange-400 font-sans"
              dangerouslySetInnerHTML={{ __html: aiSuggestion ? aiSuggestion.replace(/\n/g, '<br />') : "<em>Click Generate to retrieve fresh algorithmic chef insights.</em>" }}
            />
          )}
        </div>
      </section>

      {/* 5. Trending Items section with modern badges & ratings */}
      <section className="space-y-5">
        <div className="flex items-baseline justify-between border-b pb-2 border-slate-100">
          <h3 className="text-base font-extrabold uppercase text-slate-800 tracking-tight font-display flex items-center gap-1.5">
            <span className="text-primary">🔥</span> Trending Food Platters Right Now
          </h3>
          <span className="text-[10px] text-slate-400 font-mono font-bold">120+ REVIEWS HOURLY</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {menu.length === 0 ? (
            // Skeleton Loader while loading menu
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse space-y-3 p-3">
                <div className="h-32 bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : (
            menu.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate("order", item.category)}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                {/* Visual item image container with absolute stats absolute */}
                <div className="relative h-32 bg-slate-50 overflow-hidden grow-0 shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" 
                    referrerPolicy="no-referrer" 
                  />
                  
                  {/* Bestseller Badge */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    <span className="px-2 py-0.5 rounded-lg text-[8px] font-mono font-bold uppercase tracking-wider text-white bg-slate-900/90 shadow">
                      🔥 BESTSELLER
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-lg text-[8px] font-mono font-bold uppercase text-white shadow ${item.isVeg ? "bg-emerald-600/90" : "bg-red-650 bg-red-600/90"}`}>
                      {item.isVeg ? "Veg" : "Non-Veg"}
                    </span>
                  </div>

                  {/* Delivery Time and Ratings overlays */}
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 z-10 shadow-sm">
                    <Clock className="w-2.5 h-2.5 text-orange-400" />
                    <span>15-20m</span>
                  </div>

                  <div className="absolute bottom-2 right-2 bg-slate-900/90 text-amber-400 font-mono text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5 z-10 shadow-sm">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
                    <span>{item.rating}</span>
                  </div>
                </div>

                {/* Contents information list layout descriptions */}
                <div className="p-3 text-slate-850 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1 leading-snug group-hover:text-primary transition-colors font-display">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight font-medium mt-0.5">{item.description}</p>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs font-mono font-bold">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 font-mono block leading-none mb-0.5">Price</span>
                      <span className="text-slate-800 text-xs font-black">₹{item.price}</span>
                    </div>
                    <span className="text-primary text-[10.5px] font-bold group-hover:underline flex items-center gap-0.5 shrink-0">Configure +</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 6. Testimonial references */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b pb-2 border-slate-100">
          <h3 className="text-base font-extrabold uppercase text-slate-800 tracking-tight font-display flex items-center gap-1.5">
            <span className="text-primary">💬</span> Co-Signed by Commuters & Hubs
          </h3>
          <span className="text-[10px] text-slate-400 font-mono font-bold">100% VERIFIED DISPATCH</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Siddharth Kaul", role: "Daily commuter via NDLS", comment: "The train platform food delivery at Kanpur Central platform is incredibly accurate! Food arrived steaming hot on coach A1 seat 42 in under 12 mins.", stars: 5 },
            { name: "Anjali Deshmukh", role: "Software Architect (Noida)", comment: "No middleman fees. Orders delivered directly by SmartServe's own riders who actually wear sterilized uniforms. Pizza arrived crisp, not soggy inside the box.", stars: 5 },
            { name: "Kabir Mehta", role: "Wfh Developer", comment: "Amazing Jain-ready category filters! It's difficult to find reliable cloud kitchens that ensure strict hygiene with zero root vegetables. 10/10.", stars: 5 }
          ].map((t, idx) => (
            <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 transition-colors hover:bg-orange-50/20 hover:border-orange-100">
              <div className="flex items-center gap-0.5">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed italic">
                "{t.comment}"
              </p>
              <div className="pt-2 border-t border-slate-100/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 leading-none">{t.name}</h4>
                  <span className="text-[9.5px] text-slate-400 block mt-1 font-mono">{t.role}</span>
                </div>
                <ThumbsUp className="w-3.5 h-3.5 text-slate-350 hover:text-primary transition-colors cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATERING CONFIGURATOR POPUP MODAL */}
      <AnimatePresence>
        {cateringModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans text-slate-800"
            id="catering-config-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white w-full max-w-4xl rounded-[28px] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-100 max-h-[92vh] md:max-h-[85vh]"
              id="catering-config-modal-container"
            >
              {/* LEFT CONFIGURATION PANEL */}
              <div className="w-full md:w-3/5 p-6 sm:p-8 overflow-y-auto space-y-6" id="catering-config-panel">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black tracking-widest text-primary uppercase block leading-none">SmartServe Bulk Corridors</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight font-display">
                      Event Feast Configurator
                    </h3>
                  </div>
                  <button
                    onClick={() => setCateringModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors uppercase font-mono text-[9px] font-bold flex items-center gap-1 border border-slate-150 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Engineered thermodynamic convection protection shields bulk platters at perfect target consumption heat for hours. Customize your banquet parameters below:
                </p>

                {/* 1. GUEST COUNTER SLIDER */}
                <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase font-mono text-slate-600 tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" /> Target Guest Volume:
                    </label>
                    <span className="text-lg font-mono font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">
                      {cateringGuests} Attendees
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min={10}
                    max={150}
                    step={5}
                    value={cateringGuests}
                    onChange={(e) => setCateringGuests(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
                    <span>MIN: 10 Guests</span>
                    <span>MD: 75 Guests</span>
                    <span>MAX: 150 Guests</span>
                  </div>
                </div>

                {/* 2. PACKAGE PRESETS SELECTOR */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase font-mono text-slate-600 tracking-wider block">
                    SmartServe Meal Packages:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "corporate", title: "Synergy Lunch", price: 15, tag: "Office events" },
                      { id: "festival", title: "Royal Feast", price: 20, tag: "Signature Buffet" },
                      { id: "commuter", title: "Transit Pack", price: 11, tag: "Commuter / Tours" }
                    ].map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedCateringPkg(pkg.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all duration-300 transform cursor-pointer flex flex-col justify-between h-[100px] w-full ${
                          selectedCateringPkg === pkg.id
                            ? "border-primary bg-primary/5 text-slate-900 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wide text-slate-500 leading-none block">
                          {pkg.tag}
                        </span>
                        <h4 className="text-xs font-black uppercase font-display text-slate-800 leading-tight mt-1.5 block">
                          {pkg.title}
                        </h4>
                        <span className="text-sm font-mono font-extrabold text-primary leading-none mt-auto block">
                          ${pkg.price} <span className="text-[10px] text-slate-400">/ attendee</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. TEMPERATURE & SERVICE ADDONS */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase font-mono text-slate-600 tracking-wider block">
                    Thermodynamic & Premium Enhancements:
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: "crockery", title: "Advanced Thermal Convection Carriers (+ $2.50 / head)", desc: "Precision-engineered heat retention technology keeps every dish fresh, aromatic, and served at an optimal 68°C from kitchen dispatch until the final guest is seated." },
                      { id: "server", title: "Dedicated Buffet Captain & Service Assistant (+ $120.00)", desc: "Professional hospitality staff manage buffet setup, temperature control, guest assistance, replenishment, and post-event cleanup to ensure a seamless dining experience." },
                      { id: "dessert", title: "Laurels Signature Dessert Tower (+ $4.00 / head)", desc: "An elegant display of handcrafted pastries, gourmet desserts, and premium ice creams maintained at ideal serving temperatures for a memorable sweet finale." }
                    ].map((add) => {
                      const isChecked = cateringAddons.includes(add.id);
                      return (
                        <label
                          key={add.id}
                          className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                            isChecked 
                              ? "bg-slate-50 border-primary/40 shadow-xs" 
                              : "bg-white border-slate-150 hover:bg-slate-50/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setCateringAddons(cateringAddons.filter((x) => x !== add.id));
                              } else {
                                setCateringAddons([...cateringAddons, add.id]);
                              }
                            }}
                            className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 accent-primary"
                          />
                          <div className="space-y-0.5 text-left">
                            <span className="text-xs font-black text-slate-800 leading-none block">
                              {add.title}
                            </span>
                            <span className="text-[10.5px] text-slate-400 block leading-tight">
                              {add.desc}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT TICKET / RECEIPT SUMMARY PANEL */}
              <div className="w-full md:w-2/5 bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800" id="catering-invoice-panel">
                <div>
                  <div className="border-b border-dashed border-slate-700 pb-4 text-center">
                    <span className="text-[10px] font-mono font-black tracking-widest text-primary uppercase block">Thermodynamic Manifest</span>
                    <h4 className="text-sm font-mono uppercase font-bold tracking-tight text-slate-300 mt-1">
                      Catering Route Ticket
                    </h4>
                  </div>

                  <div className="py-4 space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400">GUEST VOLUME</span>
                      <span className="text-slate-100 font-bold">{cateringGuests} Attendees</span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400">PACKAGE OPTION</span>
                      <span className="text-slate-100 font-bold">
                        {selectedCateringPkg === "corporate" ? "Synergy Lunch ($15)" : selectedCateringPkg === "festival" ? "Royal Feast ($20)" : "Transit Pack ($11)"}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400">BASE COST</span>
                      <span className="text-slate-100 font-bold">
                        ${cateringGuests * (selectedCateringPkg === "corporate" ? 15 : selectedCateringPkg === "festival" ? 20 : 11)}
                      </span>
                    </div>

                    <div className="border-t border-dashed border-slate-800 pt-3 space-y-2">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wide block">ADDON ENHANCEMENTS</span>
                      
                      {cateringAddons.map((addon) => {
                        let name = "";
                        let cost = 0;
                        if (addon === "crockery") {
                          name = "Thermal carriers (+$2.50)";
                          cost = cateringGuests * 2.5;
                        } else if (addon === "server") {
                          name = "Culinary Captain flat";
                          cost = 120;
                        } else if (addon === "dessert") {
                          name = "Pastry towers (+$4.00)";
                          cost = cateringGuests * 4;
                        }
                        return (
                          <div key={addon} className="flex justify-between text-slate-300">
                            <span>• {name}</span>
                            <span>${cost}</span>
                          </div>
                        );
                      })}
                      {cateringAddons.length === 0 && (
                        <span className="text-slate-500 italic block">No enhancements selected</span>
                      )}
                    </div>

                    <div className="border-t border-dashed border-slate-800 pt-3 space-y-2">
                      {/* Calculate prices */}
                      {(() => {
                        const basePrice = selectedCateringPkg === "corporate" ? 15 : selectedCateringPkg === "festival" ? 20 : 11;
                        let extrasPrice = 0;
                        let flatExtras = 0;
                        if (cateringAddons.includes("crockery")) extrasPrice += 2.5;
                        if (cateringAddons.includes("server")) flatExtras += 120;
                        if (cateringAddons.includes("dessert")) extrasPrice += 4.0;
                        
                        const subtotal = cateringGuests * basePrice + cateringGuests * extrasPrice + flatExtras;
                        const hasDiscount = cateringGuests >= 30;
                        const discount = hasDiscount ? Math.round(subtotal * 0.15) : 0;
                        const finalTotal = subtotal - discount;

                        return (
                          <>
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>SUBTOTAL</span>
                              <span className="text-white font-bold">${subtotal}</span>
                            </div>
                            
                            {hasDiscount && (
                              <div className="flex justify-between text-emerald-400 text-xs font-bold">
                                <span>30+ GUEST DISCOUNT (-15%)</span>
                                <span>-${discount}</span>
                              </div>
                            )}

                            <div className="border-t border-slate-750 pt-3 flex justify-between items-baseline text-white">
                              <span className="font-extrabold text-sm tracking-tight text-slate-300">TOTAL PRICE</span>
                              <span className="text-2xl font-black text-primary font-mono">${finalTotal}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-805">
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-[10.5px] leading-relaxed text-slate-300">
                    <span className="font-bold text-amber-400 text-xs block mb-0.5">💡 AI Dynamic Assistance</span>
                    Clicking the button below submits your custom parameters directly to our AI server, opening custom menu drafts in the main queue!
                  </div>

                  <button
                    onClick={() => {
                      setCateringModalOpen(false);
                      addToast("Success! Deeply synchronized target menu suggestions with AI Assistant.", "success");
                      addToast(`Catering docket prepared for ${cateringGuests} attendees. Check recommendations below!`, "info");
                      
                      const element = document.getElementById("homepage-order-channels-section");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ChefHat className="w-4 h-4 text-white" />
                    <span>Customize Your Menu</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
