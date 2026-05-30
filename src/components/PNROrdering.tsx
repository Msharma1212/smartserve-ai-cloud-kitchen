import React, { useState, useEffect } from "react";
import { Franchise, TrainPNR, TrainStop } from "../types";
import { 
  Train, Search, AlertTriangle, ArrowRight, CheckCircle, Clock, 
  Volume2, ShieldCheck, Zap, Compass, RefreshCw, Crosshair, Lock,
  Info, Sparkles, MapPin, Radio
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getTrainPositionInfo, 
  isStationPassed as libIsStationPassed, 
  checkIsServiceable as libCheckIsServiceable 
} from "../lib/trainTracking";

interface Props {
  onSelectStation: (stationInfo: {
    pnr: string;
    trainNo: string;
    trainName: string;
    coach: string;
    seat: number;
    stationCode: string;
    stationName: string;
    routeStops?: any[];
  }) => void;
  simulatedTime?: string;
  addToast?: (msg: string, type: "success" | "error" | "info" | "warning") => void;
  franchises?: Franchise[];
}

export default function PNROrdering({ onSelectStation, simulatedTime = "21:38", addToast, franchises = [] }: Props) {
  const [typedPnr, setTypedPnr] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [trainData, setTrainData] = useState<TrainPNR | null>(null);
  const [selectedStationCode, setSelectedStationCode] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ticker, setTicker] = useState(0);

  // Play synthetic tone using safe browser Web Audio APIs
  const playSynthBeep = (freq = 800, type: OscillatorType = "sine", duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // safe ignore block
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkIsServiceable = (stop: TrainStop) => {
    return libCheckIsServiceable(stop, franchises);
  };

  const isStationPassed = (departureTimeStr: string, stopCode?: string) => {
    return libIsStationPassed(departureTimeStr, simulatedTime, trainData?.routeStops, stopCode);
  };

  const handleLookupPnr = async (pnrToQuery: string) => {
    const clean = pnrToQuery.trim().replace(/\D/g, "");
    if (!/^[0-9]{10}$/.test(clean)) {
      setErrorText("Enter valid 10-digit PNR");
      playSynthBeep(300, "sawtooth", 0.15);
      return;
    }
    setLoading(true);
    setErrorText("");
    setTrainData(null);
    setSelectedStationCode("");
    playSynthBeep(650, "sine", 0.12);

    try {
      // Simulate microwave link lag
      await new Promise(r => setTimeout(r, 900));

      const res = await fetch(`/api/train/pnr?pnrNumber=${clean}`);
      const data = await res.json();
      if (data.success) {
        setTrainData(data.train);
        playSynthBeep(920, "sine", 0.15);

        if (data.fallback) {
          if (addToast) {
            addToast("Unable to fetch live train data", "error");
          }
        }

        const stops = data.train.routeStops || [];
        const bestStop = stops.find((s: TrainStop) => checkIsServiceable(s) && !isStationPassed(s.departureTime, s.stationCode))
          || stops.find((s: TrainStop) => checkIsServiceable(s))
          || stops[0];
        
        if (bestStop) {
          setSelectedStationCode(bestStop.stationCode);
        }
      } else {
        setErrorText(data.message || "PNR reference invalid on secondary registry server.");
        playSynthBeep(350, "triangle", 0.2);
      }
    } catch (e) {
      setErrorText("Temporary operational delay. Ensure backend server is responsive.");
      playSynthBeep(350, "triangle", 0.2);
      if (addToast) addToast("Unable to fetch live train data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSelectStation = () => {
    if (!trainData || !selectedStationCode) return;
    const stop = trainData.routeStops.find((st) => st.stationCode === selectedStationCode);
    if (!stop) return;

    playSynthBeep(1100, "sine", 0.2);
    onSelectStation({
      pnr: trainData.pnr,
      trainNo: trainData.trainNo,
      trainName: trainData.trainName,
      coach: trainData.coach,
      seat: trainData.seat,
      stationCode: stop.stationCode,
      stationName: stop.stationName,
      routeStops: trainData.routeStops
    });
  };

  // Instant validations as user types
  const pnrLength = typedPnr.length;
  const isPnrValid = /^[0-9]{10}$/.test(typedPnr);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 px-2 text-slate-800" id="smart-pnr-train-redesign-root">
      
      {/* 1. HERO SECTION REDESIGN: Premium railway themed canvas cards */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-indigo-900/40 p-6 md:p-8 text-white shadow-2xl">
        
        {/* Dynamic Vector stars & rail nodes */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent" />
        
        {/* Infinite looping rail track line at top margin of hero */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/10 overflow-hidden pointer-events-none">
          <div className="w-[200%] h-full bg-[linear-gradient(90deg,transparent_0%,#4f46e5_50%,transparent_100%)] animate-[shimmer_4s_infinite]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3.5 text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-xs font-mono font-black tracking-wider text-amber-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ★ Active Platform Mode
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black font-sans tracking-tight text-white flex items-center gap-2">
              <span>🚆</span> Smart PNR Train Delivery
            </h1>
            
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans font-medium">
              Track your train, choose a serviceable station, and get fresh food delivered directly to your seat berth at the right junction.
            </p>

            <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-indigo-300">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                No Mid-Journey Starvation
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Live GPS Synchronization
              </span>
            </div>
          </div>

          {/* Interactive animated train illustration preview panel */}
          <div className="hidden lg:block w-64 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center space-y-3 shrink-0 relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]" />
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1.5">
              <span>SECURE RADAR LINK</span>
              <span className="text-emerald-400 font-extrabold flex items-center gap-1 animate-pulse">
                <Radio className="w-3 h-3 text-emerald-400" />
                LIVE
              </span>
            </div>
            
            {/* Visual locomotive carriage sliding */}
            <div className="h-14 bg-slate-950/80 rounded-xl relative overflow-hidden flex items-center border border-slate-850">
              <div className="absolute inset-x-0 bottom-1.5 h-[1.5px] bg-slate-800" />
              
              {/* Loop carriage anims */}
              <motion.div 
                className="absolute flex items-end gap-0.5"
                animate={{ x: ["110%", "-80%"] }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-2.5 h-1.5 bg-indigo-500 rounded-sm" />
                <div className="w-3.5 h-2.5 bg-indigo-500 rounded-sm flex items-center justify-center">
                  <div className="w-1 h-0.5 bg-slate-100 rounded-2xs" />
                </div>
                <div className="w-4 h-2.5 bg-indigo-500 rounded-sm flex items-center justify-center">
                  <div className="w-1 h-0.5 bg-white rounded-2xs" />
                </div>
                <span className="text-sm leading-none -ml-0.5 filter drop-shadow-[0_1px_3px_rgb(99,102,241)]">🚂</span>
              </motion.div>

              {/* Blinking signal nodes */}
              <div className="absolute right-4 top-3 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <div className="absolute right-4 top-3 w-1.5 h-1.5 rounded-full bg-red-600" />
            </div>
            
            <div className="text-[10px] text-slate-300 font-mono flex items-center justify-between">
              <span>Active Speed:</span>
              <span className="text-amber-400 font-bold">110 Km/hr</span>
            </div>
          </div>
        </div>

        {/* Floating Sound controls in hero */}
        <button 
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            setTimeout(() => playSynthBeep(880), 50);
          }}
          className="absolute bottom-3 right-3 text-slate-400 hover:text-white p-1.5 bg-slate-900/50 border border-slate-800/60 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1 font-mono tracking-tighter"
          title="Toggle digital sound cues feedback"
        >
          <Volume2 className={`w-3.5 h-3.5 ${soundEnabled ? "text-amber-400" : "text-slate-500"}`} />
          <span className="text-[9px] uppercase font-bold">{soundEnabled ? "Audio On" : "Muted"}</span>
        </button>
      </section>

      {/* 2. PNR SEARCH UI & DETECTS FORMATTING */}
      <section className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4 text-left relative overflow-hidden">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-mono font-black text-slate-600 uppercase tracking-widest">
            Enter 10-Digit PNR Number
          </label>
          
          {/* Format helper badge */}
          {pnrLength > 0 && (
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-all ${
              isPnrValid 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}>
              {isPnrValid ? "✓ Format Verified" : `Need ${10 - pnrLength} more digits`}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className={`flex-1 border rounded-xl flex items-center gap-3 px-3.5 text-sm transition-all shadow-2xs ${
            isPnrValid 
              ? "border-emerald-400 ring-2 ring-emerald-50" 
              : pnrLength === 10 
              ? "border-rose-400 ring-2 ring-rose-50"
              : "border-slate-200 focus-within:border-slate-400"
          }`}>
            <Train className={`w-4 h-4 shrink-0 transition-colors ${isPnrValid ? "text-emerald-500" : "text-slate-400"}`} />
            <input
              type="text"
              maxLength={10}
              placeholder="Enter Your 10-Digit IRCTC PNR Number..."
              value={typedPnr}
              onChange={(e) => {
                const cleanInput = e.target.value.replace(/\D/g, "");
                setTypedPnr(cleanInput);
                setErrorText("");
                if (cleanInput.length === 10) {
                  playSynthBeep(800, "sine", 0.08);
                }
              }}
              className="w-full bg-transparent font-mono text-slate-800 font-extrabold tracking-widest outline-none py-3.5 placeholder:text-slate-350"
              id="pnr-live-search-input"
            />
          </div>
          
          <button
            onClick={() => handleLookupPnr(typedPnr)}
            disabled={loading || !isPnrValid}
            className={`font-mono text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 select-none cursor-pointer ${
              isPnrValid && !loading
                ? "bg-slate-950 hover:bg-slate-900 text-white shadow-md active:scale-98"
                : "bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>SYNCHRONIZING...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-amber-400" />
                <span>Fetch Details</span>
              </>
            )}
          </button>
        </div>

        {/* Live helper warnings / alerts */}
        {errorText && (
          <div className="p-3 bg-red-100/50 text-xs text-red-700 font-semibold rounded-xl flex items-center gap-2 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-bounce" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Demo Fast Targets triggers inside searching block */}
        <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-450 font-mono text-[9.5px] uppercase font-bold tracking-wider mr-1">Demo Core PNRs:</span>
          {[
            { tag: "Howrah Rajdhani", pnr: "1234567890", num: "12301" },
            { tag: "Shatabdi Exp", pnr: "4567890123", num: "12004" },
            { tag: "Vande Bharat", pnr: "2243622436", num: "22436" }
          ].map((item) => (
            <button
              key={item.pnr}
              type="button"
              onClick={() => {
                setTypedPnr(item.pnr);
                handleLookupPnr(item.pnr);
              }}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold text-slate-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{item.tag} ({item.pnr})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Loading Skeleton Simulation view */}
      {loading && (
        <section className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 border border-slate-800 animate-pulse text-left">
          <div className="h-4 bg-slate-800 w-1/3 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="h-3 bg-slate-800 w-2/3 rounded" />
              <div className="h-4 bg-slate-800 w-1/2 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-slate-800 w-2/3 rounded" />
              <div className="h-4 bg-slate-800 w-1/2 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-slate-800 w-2/3 rounded" />
              <div className="h-4 bg-slate-800 w-1/2 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-slate-800 w-2/3 rounded" />
              <div className="h-4 bg-slate-800 w-1/2 rounded" />
            </div>
          </div>
          <div className="pt-2">
            <div className="h-10 bg-slate-800 rounded-xl" />
          </div>
        </section>
      )}

      {/* 3. FLIGHT TRACKER STYLE ACTIVE TELEMETRY DASHBOARD */}
      {trainData && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-left"
        >
          {/* Metadata Grid */}
          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white border border-slate-800 rounded-2xl p-4 md:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-xl">
            <div className="space-y-0.5">
              <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-widest font-mono">IRCTC Locomotive No</span>
              <strong className="text-white block text-sm font-sans font-black">{trainData.trainNo}</strong>
              <span className="text-[9px] text-amber-400 font-mono block truncate">{trainData.trainName}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-widest font-mono">Assigned Berth / Seat</span>
              <strong className="text-white block text-sm font-sans font-black">Berth {trainData.coach}</strong>
              <span className="text-[9px] text-slate-350 font-mono block">Seat {trainData.seat} (Confirmed)</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-widest font-mono">Journey Departure</span>
              <strong className="text-white block text-sm font-sans font-black">{trainData.journeyDate}</strong>
              <span className="text-[9px] text-emerald-400 font-mono block">Daily Run</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-widest font-mono">Live Clock delay</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black font-mono uppercase tracking-wider ${
                  trainData.currentDelayMins > 0 
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}>
                  {trainData.currentDelayMins > 0 ? `+ ${trainData.currentDelayMins}m Delay` : "On Schedule Time"}
                </span>
              </div>
              <span className="text-[9px] text-indigo-300 font-mono block font-black">GPS Lock Verified</span>
            </div>
          </div>

          {/* Real-time status simulator panel with speedometer */}
          {(() => {
            const stops = trainData.routeStops || [];
            const livePos = getTrainPositionInfo(stops, simulatedTime);
            
            let approachLabel = "";
            let speedEstimate = 0;
            let currentTemp = 74; // thermodynamic hot-box matching target
            let nextStopName = "Platform Hub";
            let nextStopCode = "CNB";
            let etaMinutes = 12;

            if (livePos.atStationIndex !== -1) {
              const st = stops[livePos.atStationIndex];
              approachLabel = `Departing from ${st.stationName} soon.`;
              speedEstimate = 0; // Stopped
              nextStopName = livePos.atStationIndex < stops.length - 1 ? stops[livePos.atStationIndex + 1].stationName : "Terminous Terminal";
              nextStopCode = livePos.atStationIndex < stops.length - 1 ? stops[livePos.atStationIndex + 1].stationCode : "END";
              etaMinutes = 5;
            } else if (livePos.betweenStations) {
              const nextStopObj = stops[livePos.betweenStations.toIndex];
              const fromStopObj = stops[livePos.betweenStations.fromIndex] || stops[0];
              if (nextStopObj) {
                approachLabel = `En-route from ${fromStopObj.stationCode} to ${nextStopObj.stationCode}.`;
                speedEstimate = Number(trainData.trainNo) > 20000 ? 128 : 108; // High speed Vande Bharat matching
                nextStopName = nextStopObj.stationName;
                nextStopCode = nextStopObj.stationCode;
                // dynamic eta minutes
                const segmentTime = 100 - livePos.betweenStations.progressPct;
                etaMinutes = Math.max(5, Math.round(segmentTime * 0.9));
              }
            } else {
              approachLabel = "Train is static outside operational line boundary.";
              speedEstimate = 5;
            }

            return (
              <div className="bg-slate-950 text-white rounded-3xl p-5 md:p-6 border border-slate-900 shadow-2xl relative overflow-hidden space-y-6">
                
                {/* Visual mesh overlay */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#312e81_25%,transparent_25%,transparent_75%,#312e81_75%,#312e81),linear-gradient(45deg,#312e81_25%,transparent_25%,transparent_75%,#312e81_75%,#312e81)] bg-[size:30px_30px]" />

                {/* Radar sweep laser anim */}
                <div className="absolute top-0 right-0 py-1 px-3 bg-indigo-600/30 text-[9px] font-mono rounded-bl-2xl text-amber-300 font-extrabold flex items-center gap-1.5 tracking-widest border-l border-b border-indigo-700/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REAL-TIME MICROWAVE LINK
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10 items-center">
                  
                  {/* Left Column: Speedometer gauge */}
                  <div className="md:col-span-4 flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-850">
                    <div className="relative w-16 h-16 rounded-full border-4 border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                      <div className="absolute inset-0 border-t-4 border-amber-400 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                      <span className="text-lg font-black font-mono text-amber-300 leading-none">{speedEstimate}</span>
                      <span className="text-[7.5px] text-slate-400 font-mono block font-bold mt-1">KM/H</span>
                    </div>
                    <div className="text-left space-y-1">
                      <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">GPS Speedometer</h4>
                      <p className="text-xs font-bold font-sans text-slate-205">
                        {speedEstimate > 0 ? "Cruising High-Speed Grid" : "Tableside Station Hold"}
                      </p>
                      <p className="text-[9px] font-mono text-indigo-300">{approachLabel}</p>
                    </div>
                  </div>

                  {/* Middle: Thermodynamic Temperature matching */}
                  <div className="md:col-span-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-850 flex items-center gap-4">
                    <div className="p-3 bg-red-500/15 border border-red-500/30 text-rose-400 rounded-xl">
                      <Zap className="w-5 h-5 text-red-400 animate-pulse" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <span className="text-[10px] text-slate-450 uppercase font-mono font-black tracking-wider block">Thermo Hot-Hold</span>
                      <strong className="text-sm font-black text-rose-300 block">{currentTemp}°C Target Thermal Lock</strong>
                      <span className="text-[9px] text-slate-400 font-mono block">Convection decks synchronized</span>
                    </div>
                  </div>

                  {/* Right: GPS Position status */}
                  <div className="md:col-span-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-850 flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-xl">
                      <Compass className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div className="text-left space-y-0.5">
                      <span className="text-[10px] text-slate-450 uppercase font-mono font-black tracking-wider block">GPS Satellite Accuracy</span>
                      <strong className="text-sm font-black text-indigo-300 block">&lt; 0.5m Real-time Drift</strong>
                      <span className="text-[9px] text-slate-400 font-mono block">Direct coach door locking link</span>
                    </div>
                  </div>
                </div>

                {/* Animated vector track with moving Train Icon progress bar */}
                <div className="relative mt-2 mb-3 bg-slate-900/65 border border-slate-850 p-4 rounded-2xl">
                  
                  {/* Outer line track */}
                  <div className="absolute left-6 right-6 top-7 h-[3px] bg-slate-800 rounded-full overflow-hidden">
                    {/* Linear color fill depending on transit distance covered */}
                    {(() => {
                      let pct = 0;
                      if (livePos.atStationIndex !== -1) {
                        pct = (livePos.atStationIndex / ((trainData.routeStops?.length || 1) - 1)) * 100;
                      } else if (livePos.betweenStations) {
                        const totalStops = trainData.routeStops?.length || 1;
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

                  {/* Horizontal Sliding Train Locomotive */}
                  {(() => {
                    let pct = 0;
                    if (livePos.atStationIndex !== -1) {
                      pct = (livePos.atStationIndex / ((trainData.routeStops?.length || 1) - 1)) * 100;
                    } else if (livePos.betweenStations) {
                      const totalStops = trainData.routeStops?.length || 1;
                      const fromIndex = livePos.betweenStations.fromIndex;
                      const basePct = fromIndex === -1 ? 0 : (fromIndex / (totalStops - 1)) * 100;
                      const segmentWeight = 100 / (totalStops - 1);
                      pct = basePct + (livePos.betweenStations.progressPct / 100) * segmentWeight;
                    }

                    return (
                      <motion.div 
                        className="absolute top-2 z-20 flex flex-col items-center -ml-3"
                        style={{ left: `${Math.min(Math.max(pct, 4), 96)}%` }}
                        animate={{ y: [0, -1, 0] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                      >
                        <span className="text-base drop-shadow-[0_2px_4px_rgba(251,191,36,0.8)] filter">🚆</span>
                        <span className="text-[6.5px] font-mono leading-none bg-amber-400 text-slate-950 font-black px-1 py-0.5 rounded uppercase mt-0.5 whitespace-nowrap">
                          {speedEstimate > 0 ? "TRANSIT" : "HOLD"}
                        </span>
                      </motion.div>
                    );
                  })()}

                  {/* Circle nodes along horizontal progress track */}
                  <div className="relative flex justify-between">
                    {(trainData.routeStops || []).map((stop: any, idx: number) => {
                      const isSelected = selectedStationCode === stop.stationCode;
                      const isServiceable = checkIsServiceable(stop);
                      const isPassed = isStationPassed(stop.departureTime, stop.stationCode);
                      
                      let dotStyle = "bg-slate-950 border-slate-700 text-slate-400 hover:scale-105";
                      if (isPassed) {
                        dotStyle = "bg-slate-950 border-rose-500 text-rose-500/80";
                      } else if (isServiceable) {
                        dotStyle = isSelected
                          ? "bg-amber-400 border-amber-300 text-slate-950 font-black scale-110 shadow-[0_0_12px_rgba(251,191,36,0.65)]"
                          : "bg-slate-950 border-emerald-400 text-emerald-450 hover:border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
                      }

                      return (
                        <div key={stop.stationCode} className="flex flex-col items-center text-center select-none pt-7 relative z-10">
                          <button
                            type="button"
                            disabled={isPassed || !isServiceable}
                            onClick={() => {
                              setSelectedStationCode(stop.stationCode);
                              setErrorText("");
                              playSynthBeep(850, "sine", 0.08);
                            }}
                            className={`w-6 h-6 rounded-full border-1.5 flex items-center justify-center text-[7.5px] font-mono leading-none cursor-pointer transition-all ${dotStyle}`}
                            title={`${stop.stationName} (Arr: ${stop.arrivalTime})`}
                          >
                            {stop.stationCode.slice(0, 3)}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Clock & Next major serviceable station info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">NEXT KITCHEN HUB DECISION COUNTER:</span>
                    <strong className="text-amber-400 font-extrabold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {nextStopName} ({nextStopCode})
                    </strong>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">ETA APPROACH WINDOW:</span>
                    <strong className="text-emerald-400 font-extrabold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/30">
                      ★ {etaMinutes} Mins Remaining
                    </strong>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 4. STATION SELECTION TIMELINE: Horizontal mobile snap carousel & Vertical desktop list */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b pb-2.5 border-slate-100">
              <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-primary animate-pulse" />
                Select Platform-Side Kitchen Hub Stop
              </h3>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-mono font-bold hidden sm:inline-block">
                Touch swipe for snapping nodes
              </span>
            </div>

            {/* Timelines containing both responsive paths */}
            {/* 4a. Mobile snap horizontal carousel with scroll snaps */}
            <div className="md:hidden flex flex-row overflow-x-auto gap-3.5 snap-x snap-mandatory scrollbar-thin pb-4 pt-1 snap-start relative">
              {trainData.routeStops.map((stop) => {
                const isSelected = selectedStationCode === stop.stationCode;
                const isServiceable = checkIsServiceable(stop);
                const isPassed = isStationPassed(stop.departureTime, stop.stationCode);
                const isClickable = isServiceable && !isPassed;

                let badgeText = "No Service";
                let badgeClass = "bg-slate-100 text-slate-500 border-slate-200/60";

                if (isPassed) {
                  badgeText = "Departed";
                  badgeClass = "bg-rose-50 text-rose-700 border-rose-100";
                } else if (isServiceable) {
                  badgeText = isSelected ? "🎯 Selected Node" : "Available Stop";
                  badgeClass = isSelected 
                    ? "bg-amber-100 text-amber-900 border-amber-300 font-black"
                    : "bg-emerald-50 text-emerald-800 border-emerald-100 shadow-3xs";
                }

                return (
                  <div
                    key={stop.stationCode}
                    onClick={() => {
                      if (isClickable) {
                        setSelectedStationCode(stop.stationCode);
                        setErrorText("");
                        playSynthBeep(850, "sine", 0.08);
                      } else {
                        playSynthBeep(330, "triangle", 0.15);
                        if (isPassed) {
                          setErrorText(`Already departed from ${stop.stationName}. Delivery window closed.`);
                        } else {
                          setErrorText(`Kitchen Hub is inactive at ${stop.stationName}. Pick NDLS or CNB.`);
                        }
                      }
                    }}
                    className={`min-w-[260px] max-w-[260px] snap-center p-4 rounded-2xl border transition-all shrink-0 flex flex-col justify-between select-none ${
                      isClickable
                        ? isSelected 
                          ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400 shadow-md scale-[1.01]" 
                          : "bg-white border-slate-150 hover:border-slate-350 shadow-3xs" 
                        : "bg-slate-50/70 border-slate-100 opacity-65"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black font-sans text-slate-800">{stop.stationCode}</span>
                        <span className={`text-[8.5px] font-mono leading-none py-0.5 px-2 rounded-full border uppercase ${badgeClass}`}>
                          {badgeText}
                        </span>
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-600 truncate text-left">{stop.stationName}</h4>
                      
                      <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-1 text-left">
                        <p>Arrival: <span className="font-extrabold text-slate-700">{stop.arrivalTime}</span></p>
                        <p>Departure: <span className="font-extrabold text-slate-700">{stop.departureTime}</span></p>
                        <p>Cumulative: <span className="font-extrabold text-slate-700">{stop.distanceKm} Km ran</span></p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100/50 mt-3 pt-2">
                      <span className="text-[8.5px] font-mono text-slate-400 uppercase font-black">
                        {isPassed ? "Past Node" : isServiceable ? "Berth Serviced" : "Locker Lock"}
                      </span>
                      {isClickable ? (
                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-amber-500 bg-amber-400" : "border-slate-300"}`}>
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                      ) : (
                        <Lock className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4b. Desktop timeline layout (remains vertical, spacious and stunning) */}
            <div className="hidden md:block space-y-2.5 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-150">
              {trainData.routeStops.map((stop) => {
                const isSelected = selectedStationCode === stop.stationCode;
                const isServiceable = checkIsServiceable(stop);
                const isPassed = isStationPassed(stop.departureTime, stop.stationCode);
                const isClickable = isServiceable && !isPassed;

                let badgeText = "Unserviceable Block";
                let badgeStyle = "bg-slate-55 text-slate-400 border-slate-205/60";
                
                if (isPassed) {
                  badgeText = "Departed Stop";
                  badgeStyle = "bg-rose-50 text-rose-600 border-rose-100";
                } else if (isServiceable) {
                  badgeText = isSelected ? "🎯 Selected Delivery Station" : "Available Service Hub";
                  badgeStyle = isSelected 
                    ? "bg-amber-100 text-amber-900 border-amber-300 font-extrabold"
                    : "bg-emerald-50 text-emerald-800 border-emerald-100 shadow-3xs";
                }

                return (
                  <div
                    key={stop.stationCode}
                    onClick={() => {
                      if (isClickable) {
                        setSelectedStationCode(stop.stationCode);
                        setErrorText("");
                        playSynthBeep(855, "sine", 0.08);
                      } else {
                        playSynthBeep(330, "triangle", 0.15);
                        if (isPassed) {
                          setErrorText(`Train already passed ${stop.stationName}. Cannot deliver behind schedule.`);
                        } else {
                          setErrorText(`Station ${stop.stationName} is not an authorized platforms thermal franchise.`);
                        }
                      }
                    }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-300 select-none ${
                      isClickable
                        ? isSelected 
                          ? "bg-gradient-to-r from-amber-50 to-orange-50/30 border-amber-400 shadow-sm scale-[1.002]" 
                          : "bg-white border-slate-150 hover:border-amber-250 hover:bg-slate-50/50 cursor-pointer" 
                        : "bg-slate-50/50 border-slate-100 opacity-65 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 shrink-0 transition-colors ${
                        isSelected 
                          ? "bg-amber-500 border-amber-600 text-white shadow-sm" 
                          : isClickable 
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                            : "bg-slate-200 border-slate-350 text-slate-400"
                      }`}>
                        {isSelected ? "✓" : isClickable ? "✓" : <Lock className="w-2.5 h-2.5 text-slate-400" />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-800 font-sans">{stop.stationCode} - {stop.stationName}</span>
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono leading-none font-bold border uppercase ${badgeStyle}`}>
                            {badgeText}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                          <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span>Arrival: {stop.arrivalTime}</span>
                          <span>|</span>
                          <span>Departure: {stop.departureTime}</span>
                          <span>|</span>
                          <span>{stop.distanceKm} Km segment stop</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right mt-2 sm:mt-0 flex items-center gap-2.5 sm:self-center justify-end">
                      <span className="text-[10px] text-slate-400 font-mono italic block">
                        {isPassed ? "Already passed" : isServiceable ? "Hot Delivery Platform" : "Platform Locked"}
                      </span>
                      {isClickable && (
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-amber-500 bg-amber-500 text-white" : "border-slate-350 bg-white"}`}>
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm Call to Action trigger */}
          {selectedStationCode && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div>
                <span className="text-[9px] text-amber-400 font-bold block uppercase tracking-widest font-mono">Confirmed Delivery Station Stop</span>
                <strong className="text-slate-100 text-xs mt-0.5 block">
                  Deliver on arrival at {trainData.routeStops.find(s => s.stationCode === selectedStationCode)?.stationName || "your station"} Stop (Platform-Side)
                </strong>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Assigned: Coach {trainData.coach} / Seat {trainData.seat}</p>
              </div>
              <button
                onClick={handleConfirmSelectStation}
                className="bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99] hover:shadow-lg hover:shadow-emerald-900/10 text-white font-mono text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                id="pnr-btn-confirm-station"
              >
                <span>Browse Menu to Order Food</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

        </motion.div>
      )}

    </div>
  );
}
