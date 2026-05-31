import React, { useState, useEffect } from "react";
import { Franchise, Order, Rider } from "../types";
import { 
  Building, ChefHat, Send, Target, Compass, RefreshCw, 
  BarChart, Users, AlertCircle, PlusCircle, ShieldAlert,
  TrendingUp, Truck, MapPin, DollarSign, Award, Radio
} from "lucide-react";
import { motion } from "motion/react";
import MultiRiderMap from "./MultiRiderMap";

interface Props {
  franchises: Franchise[];
  orders: Order[];
  onAddFranchise: (newFr: Franchise) => void;
}

export default function EnterpriseHQ({ franchises, orders, onAddFranchise }: Props) {
  const [currentWeather, setCurrentWeather] = useState("Rainy");
  const [newFrName, setNewFrName] = useState("");
  const [newFrEmail, setNewFrEmail] = useState("");
  const [newFrAddr, setNewFrAddr] = useState("");
  
  // Dynamic AI forecasting states with server integration
  const [demandForecast, setDemandForecast] = useState("");
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [pricingAdv, setPricingAdv] = useState("");
  const [loadingPricing, setLoadingPricing] = useState(false);

  // Live Riders State for Logistics Subsystem Monitor
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loadingRiders, setLoadingRiders] = useState(false);

  // Stats calculate
  const totalRevenues = orders.reduce((acc, curr) => acc + curr.total, 0) + franchises.reduce((acc, f) => acc + f.sales, 0);
  const activePreparingOrdersCount = orders.filter((o) => o.stage < 6).length;

  const triggerAIPredict = async () => {
    setLoadingForecast(true);
    setDemandForecast("");
    try {
      const res = await fetch("/api/gemini/predict-demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weather: currentWeather,
          activeOrdersCount: activePreparingOrdersCount,
          hour: new Date().getHours()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDemandForecast(data.markdown);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingForecast(false);
    }
  };

  const triggerAIPricing = async () => {
    setLoadingPricing(true);
    setPricingAdv("");
    try {
      const res = await fetch("/api/gemini/smart-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPrice: 349,
          multiplier: currentWeather === "Rainy" ? 1.25 : 1.10,
          contextDesc: `Weather context is ${currentWeather} with ${activePreparingOrdersCount} active kitchen queue bookings.`
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPricingAdv(data.markdown);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPricing(false);
    }
  };

  // Fetch Live Fleet Logs and driver logs dynamically from backend server
  const fetchRidersList = async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setRiders(data.activePool || []);
      }
    } catch (e) {
      console.error("Logistics pull routine err:", e);
    }
  };

  useEffect(() => {
    triggerAIPredict();
    triggerAIPricing();
    fetchRidersList();

    // Setup active ticks polling for real-time rider updates
    const riderPollTimer = setInterval(fetchRidersList, 5000);
    return () => clearInterval(riderPollTimer);
  }, [currentWeather]);

  const handleCreateFranchise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFrName || !newFrEmail || !newFrAddr) {
      alert("Missing name or email.");
      return;
    }

    try {
      const res = await fetch("/api/franchises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFrName,
          address: newFrAddr,
          adminEmail: newFrEmail,
          latitude: 28.6 + Math.random() * 0.1,
          longitude: 77.2 + Math.random() * 0.1,
        })
      });

      if (res.ok) {
        const data = await res.json();
        onAddFranchise(data.franchise);
        setNewFrName("");
        setNewFrEmail("");
        setNewFrAddr("");
        alert(`New branch code generated successfully: ${data.franchise.code}`);
      }
    } catch (e) {
      alert("Error adding franchise.");
    }
  };

  return (
    <div className="space-y-6 py-4 text-slate-800" id="executive-hq-analytics-view">
      
      {/* 1. Header segment */}
      <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">Executive Command Room (Level Admin)</span>
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight leading-tight mt-1 font-sans">
            Central Command & Fleet Dispatch Radar
          </h2>
          <p className="text-[11px] text-slate-300 leading-normal max-w-xl mt-1">
            Real-time tracking console. Monitor and coordinate local sub-branches, optimize elastic dynamic surge pricing, and audit in-prep couriers with precision.
          </p>
        </div>

        {/* Weather condition simulator */}
        <div className="bg-slate-800 p-2 rounded-xl border border-slate-705 flex items-center gap-2 self-start md:self-auto flex-wrap">
          <span className="text-[9.5px] uppercase font-mono font-bold text-slate-400 px-2">SIMULATE METEO CONGESTION:</span>
          {["Rainy", "Sunny", "Peak Congested"].map((w) => (
            <button
              key={w}
              onClick={() => setCurrentWeather(w)}
              className={`text-[9.5px] font-mono uppercase font-black px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                currentWeather === w 
                  ? "bg-orange-600 text-white shadow-md font-black" 
                  : "hover:bg-slate-700 text-slate-300"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Central aggregate KPI cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">Enterprise Revenue (INR)</span>
          <strong className="text-base font-black text-slate-800 font-mono">₹{totalRevenues.toLocaleString()}</strong>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">Aggregate Transactions</span>
          <strong className="text-base font-black text-slate-800 font-mono">{orders.length} orders</strong>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">Active Kitchen Queues</span>
          <strong className="text-base font-black text-emerald-600 font-mono">{activePreparingOrdersCount} pending</strong>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">Operating Branches</span>
          <strong className="text-base font-black text-slate-800 font-mono">{franchises.length} outlets</strong>
        </div>
      </section>

      {/* 3. GEMINI DYNAMIC ADVISORS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Predict Demand forecasting block */}
        <div className="bg-gradient-to-r from-emerald-950 to-[#0c2e22] border border-emerald-900 rounded-2xl p-5 text-white space-y-3 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 bg-emerald-800 bg-opacity-40 border border-emerald-700 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-300 w-fit font-bold uppercase">
              <ChefHat className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>GEMINI DEMAND PREDICTOR</span>
            </div>
            <h3 className="text-sm font-bold text-emerald-100 mt-2">Active Meteorological Ingress Forecast</h3>
            
            <div className="mt-2.5 bg-emerald-950/60 p-3.5 border border-emerald-900 rounded-xl leading-relaxed text-xs text-slate-250 min-h-[140px] text-slate-200">
              {loadingForecast ? (
                <div className="text-center py-10 font-mono text-slate-400 text-[10px] animate-pulse">Running server simulation modeling...</div>
              ) : (
                <div 
                  className="prose prose-invert prose-xs text-slate-200 prose-headings:text-emerald-300 prose-headings:font-bold prose-headings:text-[11px]"
                  dangerouslySetInnerHTML={{ __html: demandForecast.replace(/\n/g, '<br />') }}
                />
              )}
            </div>
          </div>
          <button
            onClick={triggerAIPredict}
            className="w-full bg-[#0a231b] hover:bg-[#0f3529] text-emerald-400 font-mono text-[10px] py-2 rounded-xl transition-all border border-emerald-800 uppercase font-bold cursor-pointer"
          >
            Force Recalculate
          </button>
        </div>

        {/* Dynamic Pricing adviser block */}
        <div className="bg-gradient-to-r from-indigo-950 to-[#12193b] border border-indigo-900 rounded-2xl p-5 text-white space-y-3 relative overflow-hidden flex flex-col justify-between" id="surging-advice-gemini">
          <div>
            <div className="flex items-center gap-1 bg-indigo-900/60 px-2 py-0.5 rounded text-[9px] font-mono text-indigo-300 w-fit font-bold uppercase border border-indigo-800 bg-indigo-805">
              <ChefHat className="w-3 h-3 text-indigo-400 animate-pulse" />
              <span>DYNAMIC SURGE PRICING MULTIPLIER</span>
            </div>
            <h3 className="text-sm font-bold text-indigo-100 mt-2">Real-time Elastic Valuation Advisory</h3>
            
            <div className="mt-2.5 bg-indigo-950/60 p-3.5 border border-indigo-900 rounded-xl leading-relaxed text-xs text-slate-250 min-h-[140px] text-slate-200">
              {loadingPricing ? (
                <div className="text-center py-10 font-mono text-slate-400 text-[10px] animate-pulse">Computing hazard offsets pricing...</div>
              ) : (
                <div 
                  className="prose prose-invert prose-xs text-slate-200 prose-headings:text-indigo-300 prose-headings:font-bold prose-headings:text-[11px]"
                  dangerouslySetInnerHTML={{ __html: pricingAdv.replace(/\n/g, '<br />') }}
                />
              )}
            </div>
          </div>
          <button
            onClick={triggerAIPricing}
            className="w-full bg-[#0d122c] hover:bg-[#121c45] text-indigo-400 font-mono text-[10px] py-2 rounded-xl transition-all border border-indigo-800 uppercase font-bold cursor-pointer"
          >
            Adjust Multipliers
          </button>
        </div>

      </section>

      {/* 4. PREMIUM RIDER MONITORING CONSOLE (ADMIN TRACKER DISPATCH AREA) */}
      <section className="bg-slate-950 border border-slate-900 rounded-2xl p-5 text-white space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-orange-400 font-mono font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              <span>LIVE FLEET GPS LOGISTICS MATRIX</span>
            </div>
            <h3 className="text-base font-black font-sans tracking-tight mt-0.5 text-white">Advanced Active Driver Dispatch Board</h3>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded">
              Active Transits: <strong>{riders.filter(r => r.status === "delivering").length}</strong>
            </span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2.5 py-1 rounded font-bold animate-pulse">
              System: STABLE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Active List of Riders and Performance Metadata */}
          <div className="lg:col-span-4 space-y-3 text-left">
            <span className="text-[9.5px] font-bold tracking-widest uppercase text-slate-500 font-mono block">Rider Roster Registry</span>
            
            {riders.length === 0 ? (
              <div className="p-8 bg-slate-900 rounded-xl text-center text-xs italic text-slate-500 border border-slate-850">
                No dispatch riders checked in.
              </div>
            ) : (
              <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
                {riders.map((r) => {
                  const isDelivering = r.status === "delivering";
                  
                  return (
                    <div 
                      key={r.id} 
                      className="bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-xl p-3 text-white space-y-2 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">👤</span>
                          <strong className="text-[11.5px] font-bold font-mono text-white leading-tight block">{r.name}</strong>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold uppercase ${
                          isDelivering 
                            ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800/60" 
                            : "bg-slate-850 text-slate-400 border border-slate-700"
                        }`}>
                          {r.status}
                        </span>
                      </div>

                      {/* Coordinates and status fields */}
                      <div className="grid grid-cols-2 gap-1.5 py-1.5 border-t border-b border-slate-850 font-mono text-[9.5px] text-slate-400 leading-none">
                        <div>
                          Coord: <strong className="text-white">{r.currentLat?.toFixed(4)}, {r.currentLon?.toFixed(4)}</strong>
                        </div>
                        <div>
                          Vehicle: <strong className="text-white">DL-3S-HQ</strong>
                        </div>
                      </div>

                      {/* Performance Indicators */}
                      <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
                        <span className="flex items-center gap-0.5">
                          <Award className="w-3 h-3 text-amber-500" />
                          Deliveries: <strong className="text-white font-black">{r.totalDeliveries || 10}</strong>
                        </span>
                        <span className="flex items-center gap-0.5 text-emerald-400">
                          <DollarSign className="w-3 h-3 text-emerald-400" />
                          Earned: <strong className="font-black text-white">₹{r.totalEarnings || 450}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Multi Rider Map Area */}
          <div className="lg:col-span-8 h-[340px] w-full">
            <MultiRiderMap orders={orders} riders={riders} />
          </div>

        </div>
      </section>

      {/* 5. Active Franchise nodes list & Generator form */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Franchise map lists */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Territorial Franchise Networks</span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-extrabold">Active Cluster</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {franchises.map((f) => (
              <div key={f.code} className="bg-slate-50 rounded-xl border border-slate-150 p-3.5 space-y-2 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-800 block truncate uppercase">{f.name}</strong>
                  <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {f.code}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 leading-normal line-clamp-1">{f.address}</div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-[10px] font-mono text-slate-500 animate-none">
                  <span>GPS Lat/Lon: <strong>{f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}</strong></span>
                  <span>Store Sales: <strong className="text-emerald-700">₹{f.sales.toLocaleString()}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Franchise Panel form */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono block border-b pb-2">HQ Node Generator</span>
          
          <form onSubmit={handleCreateFranchise} className="space-y-3 text-xs">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">Franchise Outlet Title</label>
              <input
                type="text"
                required
                placeholder="SmartServe Mumbai Hub"
                value={newFrName}
                onChange={(e) => setNewFrName(e.target.value)}
                className="w-full bg-slate-50 border p-2 rounded text-xs select-none outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">Admin Email Credentials</label>
              <input
                type="email"
                required
                placeholder="mumbai.admin@smartserve.ai"
                value={newFrEmail}
                onChange={(e) => setNewFrEmail(e.target.value)}
                className="w-full bg-slate-50 border p-2 rounded text-xs select-none outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">Registered Address</label>
              <input
                type="text"
                required
                placeholder="Platform 2, Dadar Station, Mumbai"
                value={newFrAddr}
                onChange={(e) => setNewFrAddr(e.target.value)}
                className="w-full bg-slate-50 border p-2 rounded text-xs select-none outline-none focus:border-slate-400"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-[10px] font-extrabold uppercase py-2.5 rounded-lg transition-transform shadow-md cursor-pointer"
            >
              Generate Franchise Credentials
            </button>
          </form>
        </div>

      </section>

    </div>
  );
}
