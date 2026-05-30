import React from "react";
import { Order, Rider } from "../types";
import { Truck, Navigation, DollarSign, CheckCircle, Smartphone, MapPin, ExternalLink } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  activeRider: Rider;
  orders: Order[];
  onCompleteDelivery: (orderId: string) => void;
}

export default function EnterpriseRider({ activeRider, orders, onCompleteDelivery }: Props) {
  // Find active deliveries assigned to this rider that are "Out for delivery" (stage 5)
  const activeDelivery = orders.find((o) => o.riderId === activeRider.id && o.stage === 5);

  return (
    <div className="space-y-6 py-4 text-slate-800" id="rider-fleet-workspace">
      
      {/* Rider Status and earnings banner */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 bg-opacity-20 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center text-xl">
            🚴
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-tight">{activeRider.name}</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {activeRider.id} | Phone: {activeRider.phone}</p>
          </div>
        </div>

        <div className="bg-slate-850 p-4 rounded-xl border border-slate-750 bg-slate-820 flex items-center justify-between col-span-2">
          <div className="text-center md:text-left">
            <span className="text-[9px] text-slate-400 font-mono uppercase font-bold block">Deliveries Completed</span>
            <strong className="text-lg text-emerald-400 font-mono font-black">{activeRider.totalDeliveries} trips</strong>
          </div>
          <span className="text-slate-500">|</span>
          <div className="text-center md:text-left">
            <span className="text-[9px] text-slate-400 font-mono uppercase font-bold block">Consolidated Rider Pay</span>
            <strong className="text-lg text-emerald-400 font-mono font-black">₹{activeRider.totalEarnings}</strong>
          </div>
          <span className="text-slate-500">|</span>
          <div className="text-center md:text-left">
            <span className="text-[9px] text-slate-400 font-mono uppercase font-bold block">Duty Status</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500 bg-opacity-25 border border-emerald-500 text-emerald-300 font-mono text-[9px] font-bold">
              {activeRider.status.toUpperCase()}
            </span>
          </div>
        </div>

      </section>

      {/* Primary Dispatch Content */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left active navigation details card */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Assigned Cargo Flight</h3>

          {!activeDelivery ? (
            <div className="bg-white rounded-xl border border-slate-100 p-16 text-center text-slate-450 shadow-sm">
              <Truck className="w-10 h-10 text-slate-350 mx-auto mb-2" />
              <h4 className="text-xs font-bold uppercase tracking-tight">Idle State: Awaiting Next Batch</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal italic">
                SmartServe kitchens are currently baking dishes. As soon as cooking is dispatched, your thermal pouch console alerts automatically with GPS target directions.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-5 shadow-sm">
              
              {/* Card Meta */}
              <div className="flex items-center justify-between border-b pb-3 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold font-mono uppercase block">Active Delivery Task</span>
                  <strong className="text-slate-805 font-mono text-xs mt-0.5 block font-black">{activeDelivery.id}</strong>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-500">
                  <div>Kitchen Node: {activeDelivery.branchName}</div>
                  <div>Recipient: {activeDelivery.customerName} ({activeDelivery.customerPhone})</div>
                </div>
              </div>

              {/* Delivery info segment */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-150 space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    {activeDelivery.pnr ? (
                      <>
                        <h4 className="text-xs font-bold text-slate-800 uppercase">Coach platform delivery stop</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Train Name: <strong>{activeDelivery.trainNumber} - {activeDelivery.trainName}</strong> <br />
                          Delivery Station: <strong>{activeDelivery.deliveryStation} platform berth</strong> <br />
                          Seat Location: <strong>{activeDelivery.seatInfo}</strong>
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-xs font-bold text-slate-800 uppercase">Office / Residential Door Address</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Address Details: <strong className="text-slate-800">{activeDelivery.deliveryAddress}</strong>
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-450 font-mono text-slate-500">
                  <span>Target GPS Coordinates: <strong>{activeDelivery.targetLat.toFixed(4)}°N, {activeDelivery.targetLon.toFixed(4)}°E</strong></span>
                </div>
              </div>

              {/* Navigation simulated dashboard panel map directions */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 relative overflow-hidden h-44">
                <div className="absolute top-3 left-3 bg-slate-950 px-2 py-0.5 rounded text-[8.5px] font-mono border border-slate-800 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  <span>STEER DIRECTIONS BY PASS GPS COORDINATORS</span>
                </div>

                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <Navigation className="w-6 h-6 text-emerald-400 mx-auto animate-bounce" />
                    <span className="block text-xs font-mono font-bold uppercase text-slate-200">En Route: 1.2 Km to Terminal point</span>
                    <span className="block text-[10px] text-slate-400 font-mono">Simulating real-time drift coordinates on customer map dashboards</span>
                  </div>
                </div>
              </div>

              {/* Complete Delivery button stamp */}
              <button
                onClick={() => onCompleteDelivery(activeDelivery.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-extrabold uppercase py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Hand Deliver Order - Collect Cash/Payment</span>
              </button>

            </div>
          )}
        </div>

        {/* Right rider safety guidelines */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono block border-b pb-2">Rider instructions</span>
          
          <div className="space-y-3 text-xs leading-relaxed text-slate-600">
            <div className="p-3 bg-indigo-50 bg-opacity-40 rounded-xl border border-indigo-150 space-y-1">
              <h5 className="font-bold text-indigo-900 uppercase text-[10px]">Thermal Pack Seals</h5>
              <p className="text-[10px] text-indigo-700 leading-normal">
                Never break the oven-sealed thermal foil security stickers. The steam must remain trapped until hand delivery complete.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              <h5 className="font-bold text-amber-900 uppercase text-[10px]">Railway Stop Caution</h5>
              <p className="text-[10px] text-amber-700 leading-normal">
                For train-order platforms, wait at the specified coach arrival point 5 minutes PRIOR to train scheduled arrival times. Deliver directly to coach doors.
              </p>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
