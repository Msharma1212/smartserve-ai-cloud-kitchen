import React from "react";
import { ChefHat, Heart, Shield, Mail, PhoneCall, MapPin, Globe } from "lucide-react";

interface Props {
  onNavigate: (page: string) => void;
}

export default function CustomerFooter({ onNavigate }: Props) {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-850" id="global-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Manifesto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black font-sans shadow-md">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="text-sm font-black tracking-tight uppercase">SmartServe AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              We own the entire pipeline: from our hyper-sanitized automatic cloud kitchens, cooked in dynamic temperature convection decks, straight to your station platform or door using in-house thermal-rider logistics.
            </p>
          </div>

          {/* Quick links map */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Platform Ecosystem</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate("order")} className="hover:text-emerald-400 transition-colors">
                  Our Cloud Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("train-order")} className="hover:text-emerald-400 text-amber-300 font-medium transition-colors">
                  Smart PNR Train Delivery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("partner")} className="hover:text-emerald-400 transition-colors">
                  Invest in Franchise
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("careers")} className="hover:text-emerald-400 transition-colors">
                  Join Rider Fleet & Careers
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Central Support</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              HQ Office Hub, Suite 402, Regal Central Building, Connaught Place, New Delhi.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Mail className="w-3.5 h-3.5" />
                <span>support@smartserve.ai</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>+91 6268788939</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Metrics */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">ZERO Brokerage Setup</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              SmartServe operates on a 100% vertically integrated stack. By cutting out heavy Swiggy, Zomato, and Deliveroo broker fees, we pass directly 25% savings to our culinary staff and riders alike.
            </p>
            <div className="mt-3 flex items-center gap-1.5 bg-slate-800 bg-opacity-40 p-2 rounded-lg border border-slate-800">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">SECURED PLATFORM SSL</span>
            </div>
          </div>

        </div>

        {/* Lower Attribution Area */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            <span>© 2026 SmartServe AI Cloud Kitchen OS. All rights reserved.</span>
          </div>
          
          {/* CRITICAL ATTRIBUTION REQUIREMENT */}
          <div className="flex items-center gap-1 mt-4 md:mt-0 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 border-opacity-70 text-slate-300 font-mono text-[11px] hover:text-emerald-400 transition-colors">
            <span>Designed & Developed by</span>
            <span className="text-emerald-400 font-extrabold focus:outline-none">Mayank</span>
            <Heart className="w-3 h-3 text-emerald-400 animate-pulse fill-emerald-400 ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
}
