import React from "react";
import { Order } from "../types";
import { RefreshCw, ClipboardList, Clock, Flame, CheckSquare, Zap } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  orders: Order[];
  onUpdateStage: (orderId: string, stage: number) => void;
}

export default function EnterpriseKitchen({ orders, onUpdateStage }: Props) {
  // Sort and filter active kitchen preparation orders (stages 1 to 4)
  const kitchenQueue = orders.filter((o) => o.stage >= 1 && o.stage <= 4);

  const getStageTitle = (stage: number) => {
    switch (stage) {
      case 1: return "Pending prep start";
      case 2: return "Preparing toppings";
      case 3: return "Baking in convection decks";
      case 4: return "Packing thermal packets";
      default: return "Ready";
    }
  };

  const getStageBtnLabel = (stage: number) => {
    switch (stage) {
      case 1: return "Begin preparing standard base";
      case 2: return "Push inside Convection Oven";
      case 3: return "Complete Oven Bake, Begin packing";
      case 4: return "Pack & Assign thermal Rider";
      default: return "Ready for fleet";
    }
  };

  return (
    <div className="space-y-6 py-4 text-slate-800" id="convection-kitchen-workspace">
      
      {/* Header bar alerts */}
      <section className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Flame className="w-4 h-4 animate-pulse fill-emerald-400" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold">Cloud Convection Kitchen Live Monitor</span>
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight mt-1 font-sans">Kitchen Orders Baking Queue</h2>
          <p className="text-xs text-slate-300 leading-normal max-w-xl">
            Live food ticket logs. Filtered dynamically by active oven stages. Check toppings metadata, separate Jain batches, and press action stamps to dispatch thermal packs.
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg py-2 px-3.5 border border-slate-700 text-right">
          <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase">Active Kitchen queue load</span>
          <strong className="text-base text-emerald-400 font-mono font-black">{kitchenQueue.length} Active Tickets</strong>
        </div>
      </section>

      {/* Grid checklist tickets */}
      {kitchenQueue.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-16 text-center text-slate-400 max-w-md mx-auto shadow-sm">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-750 uppercase font-mono">No active preparations</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-normal italic">
            All previously placed orders have been successfully heated, packed, and transferred to delivery flight crews.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchenQueue.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border-t-4 border-t-indigo-600 border border-slate-200 p-4.5 p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                
                {/* ID Header card */}
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Ticket Reference</span>
                    <strong className="text-xs text-slate-800 font-mono font-black uppercase">{order.id}</strong>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase ${order.stage === 3 ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse" : "bg-indigo-50 text-indigo-700 border border-indigo-205"}`}>
                    {getStageTitle(order.stage)}
                  </span>
                </div>

                {/* Relational details: location, time, target */}
                <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                  <div>Prepare Branch: <strong>{order.branchCode}</strong></div>
                  {order.pnr ? (
                    <div className="text-amber-700 font-bold">Delivery Station stop: {order.deliveryStation} (Seat {order.seatInfo})</div>
                  ) : (
                    <div className="truncate">Address Destination: {order.deliveryAddress}</div>
                  )}
                  <div>Placed: <span>{new Date(order.createdAt).toLocaleTimeString()}</span></div>
                </div>

                {/* Items and customization breakdown! */}
                <div className="bg-slate-50 rounded-lg p-2.5 space-y-2 border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Ingredients Recipe Checklist</span>
                  <ul className="space-y-1.5 divide-y divide-slate-150">
                    {order.items.map((it, idx) => (
                      <li key={idx} className="text-[11px] font-sans text-slate-700 pt-1.5 first:pt-0">
                        <div className="flex justify-between font-bold">
                          <span>{it.name} <span className="font-mono text-indigo-600 font-extrabold">x{it.qty}</span></span>
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded uppercase tracking-wide font-mono">{it.category}</span>
                        </div>
                        {it.customizations && it.customizations.length > 0 && (
                          <div className="text-[9px] text-slate-450 mt-0.5 pl-2 border-l border-indigo-400 border-opacity-40 font-mono space-y-0.5">
                            {it.customizations.map((c, cIdx) => (
                              <div key={cIdx} className="text-slate-500">• {c}</div>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Action advancement button */}
              <button
                onClick={() => onUpdateStage(order.id, order.stage + 1)}
                className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-[10px] font-extrabold uppercase py-2 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>{getStageBtnLabel(order.stage)} →</span>
              </button>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
