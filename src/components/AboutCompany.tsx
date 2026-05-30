import React from "react";
import { ChefHat, ShieldCheck, Heart, Award, Cpu, Database } from "lucide-react";

export default function AboutCompany() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4 text-slate-800" id="about-platform-dashboard">
      
      {/* Hero */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-500 bg-opacity-20 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 mx-auto text-xl animate-bounce">
          🏆
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight font-sans">Core Operational Mission</h2>
        <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
          SmartServe is a cloud-native kitchen operating system driving automated convection prep and zero third-party dependency delivery fleet pipelines. Established with high standard sanitation protocols.
        </p>
      </section>

      {/* Grid co-founder leadership profiles */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Company Architects & Directors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-lg font-black shrink-0 font-mono">
              B
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Balakraj</h4>
              <span className="text-[10px] text-emerald-600 uppercase font-mono font-bold tracking-wider">Co-Founder & Chief culinary Architect</span>
              <p className="text-xs text-slate-500 leading-normal pt-1.5 font-sans">
                Drives automated temperature convection deck calibrations, ensures extreme hygienic sanitation matrices and coordinates train-station delivery platform channels.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-lg font-black shrink-0 font-mono">
              M
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Mayank</h4>
              <span className="text-[10px] text-indigo-600 uppercase font-mono font-bold tracking-wider">Co-Founder & Director of fleet operations</span>
              <p className="text-xs text-slate-500 leading-normal pt-1.5 font-sans">
                Oversees raw stock inventories, manages in-house rider commission protocols, and governs database replication setups across the MongoDB clusters.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Core values block cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-tight font-sans">Zero Third-Party Fees</h4>
          <p className="text-xs leading-relaxed text-slate-500">
            By avoiding aggressive 25-30% food portal fee margins, we directly fund fully insured high-pay salaries for chefs and riders alike.
          </p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
          <Cpu className="w-5 h-5 text-teal-500" />
          <h4 className="text-xs font-bold uppercase tracking-tight font-sans">Gemini Predictive OS</h4>
          <p className="text-xs leading-relaxed text-slate-500">
            Smart Dynamic surge multipliers computed instantly through server weather sensors prevents oven overload and prepares riders.
          </p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
          <Database className="w-5 h-5 text-amber-500" />
          <h4 className="text-xs font-bold uppercase tracking-tight font-sans">Integrated Data Logs</h4>
          <p className="text-xs leading-relaxed text-slate-500">
            In-memory Redis performance, transactional PostgreSQL and schema MongoDB are mirrored safely so managers can audit anytime.
          </p>
        </div>
      </section>

    </div>
  );
}
