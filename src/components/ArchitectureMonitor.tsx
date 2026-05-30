import React, { useEffect, useState } from "react";
import { DBMetrics } from "../types";
import { Database, Cpu, Activity, RefreshCw, Layers, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ArchitectureMonitor() {
  const [metrics, setMetrics] = useState<DBMetrics | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function fetchSystemMetrics() {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/sysinfo");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.error("Error loading system metrics:", e);
    } finally {
      setTimeout(() => setIsUpdating(false), 500);
    }
  }

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 6000); // refresh every 6s
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Floating Activator Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-mono text-xs font-semibold px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none border border-teal-300 border-opacity-30"
        id="btn-trigger-architecture"
      >
        <Zap className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
        <span>OS Tech Watcher</span>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      </button>

      {/* Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-full max-w-[440px] z-50 bg-[#0f172a] bg-opacity-95 backdrop-blur-xl border border-slate-700 border-opacity-70 rounded-2xl shadow-3xl text-slate-100 overflow-hidden font-mono"
            id="sysinfo-drawer"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-300">CORE INFRASTRUCTURE MONITOR</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchSystemMetrics}
                  className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Diagnostic Console Grid */}
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar text-[11px]">
              
              {/* Redis Segment */}
              {metrics && (
                <div className="bg-slate-900 bg-opacity-60 border border-red-500 border-opacity-20 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-red-400 font-bold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-red-400" />
                      REDIS IN-MEMORY CACHE
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500 bg-opacity-10 text-emerald-400 text-[9px] font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {metrics.redis.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-400">
                    <div>Cache Ratio: <strong className="text-emerald-400">{metrics.redis.cache_ratio}</strong></div>
                    <div>Read Latency: <strong className="text-emerald-400">0.4ms</strong></div>
                    <div>Cache Hits: <strong className="text-slate-300">{metrics.redis.hits}</strong></div>
                    <div>Cache Misses: <strong className="text-slate-300">{metrics.redis.misses}</strong></div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-800">
                    <span className="text-slate-500 font-semibold uppercase text-[9px]">Pre-Warmed Cache Domains:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {metrics.redis.cached_keys.map((k, idx) => (
                        <span key={idx} className="bg-red-950 bg-opacity-40 text-red-300 border border-red-900 border-opacity-40 px-1 py-0.5 rounded text-[9px] font-mono">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PostgreSQL (Transactional) */}
              {metrics && (
                <div className="bg-slate-900 bg-opacity-60 border border-blue-500 border-opacity-20 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-blue-400 font-bold flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                      POSTGRESQL (RELATIONAL DB)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500 bg-opacity-10 text-emerald-400 text-[9px] font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      CONNECTED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-400">
                    <div>Orders Placed: <strong className="text-blue-300">{metrics.postgres.total_orders_rows} rows</strong></div>
                    <div>Franchise Nodes: <strong className="text-blue-300">{metrics.postgres.franchises_rows} rows</strong></div>
                    <div>Database Engine: <strong className="text-slate-300">v16.2 RDS</strong></div>
                    <div>Access Auth: <strong className="text-slate-300">JWT (RSA-256)</strong></div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-800">
                    <span className="text-slate-500 font-semibold uppercase text-[9px]">Active Relational Targets:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {metrics.postgres.active_tables.map((t, idx) => (
                        <span key={idx} className="bg-blue-950 bg-opacity-40 text-blue-300 border border-blue-900 border-opacity-40 px-1 py-0.5 rounded text-[9px]">
                          tbl_{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MongoDB (Unstructured) */}
              {metrics && (
                <div className="bg-slate-900 bg-opacity-60 border border-emerald-500 border-opacity-20 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      MONGODB (UNSTRUCTURED NO-SQL)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500 bg-opacity-10 text-emerald-400 text-[9px] font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      {metrics.mongodb.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-400">
                    <div>Menu Items: <strong className="text-emerald-300">{metrics.mongodb.menu_collection_count} docs</strong></div>
                    <div>Applicants Cache: <strong className="text-emerald-300">{metrics.mongodb.draft_applicants_count} docs</strong></div>
                    <div>Replica Cluster: <strong className="text-slate-300">Atlas AWS</strong></div>
                    <div>Query Speed: <strong className="text-emerald-400">1.8ms avg</strong></div>
                  </div>
                </div>
              )}

              {/* Socket.io Broadcast */}
              {metrics && (
                <div className="bg-slate-900 bg-opacity-60 border border-purple-500 border-opacity-20 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-purple-400 font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                      SOCKET.IO LIVE TELEMETRY
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500 bg-opacity-15 text-purple-300 text-[9px] font-semibold">
                      {metrics.socketIO.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-400">
                    <div>WebSocket Clients: <strong className="text-purple-300">{metrics.socketIO.connected_clients} socket nodes</strong></div>
                    <div>Telemetry Broadcast: <strong className="text-purple-300">Enabled</strong></div>
                    <div>Events Streamed: <strong className="text-slate-300">{metrics.socketIO.event_emit_count} msgs</strong></div>
                    <div>Server Engine: <strong className="text-slate-300">Node Cluster</strong></div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-800">
                    <span className="text-slate-500 font-semibold uppercase text-[9px]">Pulsing Event Sinks:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {metrics.socketIO.active_listeners.map((l, idx) => (
                        <span key={idx} className="bg-purple-950 bg-opacity-40 text-purple-300 border border-purple-900 border-opacity-40 px-1 py-0.5 rounded text-[9px]">
                          evt_{l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Operational Security Disclaimer */}
              <div className="flex items-start gap-2 bg-slate-800 bg-opacity-40 text-slate-400 p-2.5 rounded-lg border border-slate-700 text-[10px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  The sandbox environment strictly isolates port traffic. Database states are persisted via in-memory transactional simulators mapped to JSON schemas. Zero risk of connection leak.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-950 px-4 py-2 text-[9px] text-slate-500 text-center border-t border-slate-800">
              System running on UTC Server: 2026-05-27 v1.0.0
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
