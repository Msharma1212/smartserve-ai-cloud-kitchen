import React from "react";
import { ChefHat, ShoppingCart, User, Train, ShieldCheck, HelpCircle, Briefcase, PlusCircle, LayoutDashboard, LogOut, MapPin } from "lucide-react";

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount: number;
  customerPhone: string;
  onOpenLogin: () => void;
  onLogoutCustomer: () => void;
  isStaff: boolean;
  userAddress?: string;
  onOpenLocation?: () => void;
  onOpenCart?: () => void;
}

export default function CustomerHeader({
  currentPage,
  onNavigate,
  cartCount,
  customerPhone,
  onOpenLogin,
  onLogoutCustomer,
  isStaff,
  userAddress,
  onOpenLocation,
  onOpenCart,
}: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm" id="global-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Identity Branding & Location Container */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => onNavigate("home")} 
            className="flex items-center gap-2.5 cursor-pointer group"
            id="hdr-logo-brand"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-orange-100 transition-transform duration-300 group-hover:scale-110">
              <ChefHat className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 tracking-tight sm:block leading-none font-display">
                SmartServe <span className="text-primary">AI</span>
              </h1>
              <span className="text-[8px] font-mono text-slate-400 font-bold block mt-0.5 tracking-widest uppercase">Cloud Kitchen OS</span>
            </div>
          </div>

          {/* Quick-Access Address Selector (Swiggy / Zomato style) */}
          {onOpenLocation && (
            <div 
              onClick={onOpenLocation}
              className="flex items-center gap-1.5 bg-orange-50/50 border border-orange-100 hover:bg-orange-50 hover:border-orange-200 px-3 py-1.5 rounded-xl cursor-pointer text-xs transition-colors select-none max-w-[210px] sm:max-w-xs shrink-0 group shadow-sm/5 shadow-orange-50"
              id="hdr-btn-address-trigger"
            >
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0 transition-transform group-hover:scale-110" />
              <span className="font-bold text-slate-700 truncate max-w-[100px] sm:max-w-[180px]">
                {userAddress || "Locating your desk..."}
              </span>
              <span className="text-[9px] text-primary font-bold font-mono transition-transform group-hover:translate-y-0.5">▼</span>
            </div>
          )}
        </div>

        {/* Dynamic Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onNavigate("home")}
            className={`px-3.5 py-2 rounded-xl transition-all font-sans ${currentPage === "home" ? "bg-orange-55 bg-orange-50 text-primary font-bold shadow-sm/5" : "hover:bg-slate-50"}`}
            id="nav-tab-home"
          >
            Home
          </button>
          
          <button
            onClick={() => onNavigate("order")}
            className={`px-3.5 py-2 rounded-xl transition-all font-sans ${currentPage === "order" ? "bg-orange-55 bg-orange-50 text-primary font-bold shadow-sm/5" : "hover:bg-slate-50"}`}
            id="nav-tab-menu"
          >
            Order Menu
          </button>

          <button
            onClick={() => onNavigate("train-order")}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 border-opacity-45 ${currentPage === "train-order" ? "bg-amber-100" : ""}`}
            id="nav-tab-train"
          >
            <Train className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Smart PNR Train Delivery</span>
          </button>

          <button
            onClick={() => onNavigate("partner")}
            className={`px-3.5 py-2 rounded-xl transition-all font-sans ${currentPage === "partner" ? "bg-orange-55 bg-orange-50 text-primary font-bold shadow-sm/5" : "hover:bg-slate-50"}`}
            id="nav-tab-partner"
          >
            Partner Franchise
          </button>

          <button
            onClick={() => onNavigate("careers")}
            className={`px-3.5 py-2 rounded-xl transition-all font-sans ${currentPage === "careers" ? "bg-orange-55 bg-orange-50 text-primary font-bold shadow-sm/5" : "hover:bg-slate-50"}`}
            id="nav-tab-careers"
          >
            Jobs & Careers
          </button>

          <button
            onClick={() => onNavigate("about")}
            className={`px-3.5 py-2 rounded-xl transition-all font-sans ${currentPage === "about" ? "bg-orange-55 bg-orange-50 text-primary font-bold shadow-sm/5" : "hover:bg-slate-50"}`}
            id="nav-tab-about"
          >
            About
          </button>
        </nav>

        {/* Right-alignment interactions */}
        <div className="flex items-center gap-3">
          
          {/* Quick-Access Cart Button */}
          <button
            onClick={() => {
              if (onOpenCart) {
                onOpenCart();
              } else if (!customerPhone) {
                onOpenLogin();
              } else {
                onNavigate("order");
              }
            }}
            className="relative p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            id="hdr-btn-cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* Customer Authentication State */}
          {customerPhone ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${currentPage === "dashboard" ? "bg-slate-50 border-slate-400 text-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                id="hdr-btn-dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">My Orders</span>
              </button>
              
              <button
                onClick={onLogoutCustomer}
                className="p-2 ml-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                title="Sign out of phone"
                id="hdr-btn-logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all shrink-0"
              id="hdr-btn-login"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login Account</span>
            </button>
          )}

          {/* Core Staff Internal Entry point */}
          <button
            onClick={() => onNavigate("internal-login")}
            className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-indigo-600 hover:text-indigo-800 border-l pl-3 border-slate-200 ml-1 block"
            id="hdr-btn-internal-portal"
          >
            Portal
          </button>

        </div>
      </div>
    </header>
  );
}
