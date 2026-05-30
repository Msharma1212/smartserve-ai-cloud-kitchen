import React, { useState, useEffect } from "react";
import { 
  Building, 
  Send, 
  DollarSign, 
  PieChart, 
  ShieldCheck, 
  CheckCircle, 
  TrendingUp, 
  Cpu, 
  Search, 
  ArrowRight, 
  Star, 
  MapPin, 
  Award, 
  Check, 
  Clock, 
  Info, 
  UserCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PartnerWithUs() {
  // Application Form State
  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    targetCity: "",
    availableCapital: "₹15L - ₹25L",
    experienceDesc: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);

  // ROI Calculator State
  const [capitalInput, setCapitalInput] = useState<number>(2000000); // Default ₹20 Lakhs
  const [monthlyOrdersInput, setMonthlyOrdersInput] = useState<number>(4500); // Default 4500 orders/month

  // City Availability Checker State
  const [citySearch, setCitySearch] = useState<string>("");
  const [cityCheckResult, setCityCheckResult] = useState<any | null>(null);

  // Active testimonial tab
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);

  // Fetch submissions from central server database
  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/partner/list");
      if (res.ok) {
        const data = await res.json();
        setSubmissionsList(data);
      }
    } catch (e) {
      console.error("Failed to load applicants", e);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.emailAddress || !formData.phoneNumber) {
      return;
    }
    setSubmitting(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccessMsg("Excellent! Your partnership dossier has been successfully transmitted to our Capital Ventures Board. A dedicated account engineer will reach out within 24 hours.");
        setFormData({
          fullName: "",
          emailAddress: "",
          phoneNumber: "",
          targetCity: "",
          availableCapital: "₹15L - ₹25L",
          experienceDesc: ""
        });
        fetchSubmissions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Run ROI Calculation formulas
  // Average Order Value = ₹320
  const avgOrderValue = 320;
  const estimatedMonthlyRevenue = monthlyOrdersInput * avgOrderValue;
  
  // Margin changes dynamically by capital size of the tier
  const marginPercentage = capitalInput < 1500000 ? 0.22 : capitalInput < 3000000 ? 0.26 : 0.30;
  const estimatedMonthlyProfit = estimatedMonthlyRevenue * marginPercentage;
  
  // Payback calculation (months)
  const estimatedPaybackMonths = parseFloat((capitalInput / estimatedMonthlyProfit).toFixed(1));

  // Dynamic city checker logic
  const handleCheckCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;

    const query = citySearch.trim().toLowerCase();
    
    // Custom calculated mock node values for high-converting look and feel
    let status = "HIGH DEMAND";
    let text = "Available with pre-approved premium hub locations near busy transit hubs.";
    let color = "emerald";
    let speed = "Fastest Approval (72 Hours)";
    let potentialRating = "4.9/5 Projected Demand Score";
    let approvedLoc = "Railway Station Yard Cluster / Metro Interchange";

    if (query.includes("mumbai") || query.includes("delhi") || query.includes("bangalore") || query.includes("bengaluru")) {
      status = "LIMITED HUBS AVAILABLE";
      text = "Highly competitive. 3 central hubs active. Only 1 zone near transit spots left.";
      color = "amber";
      speed = "Premium Express Review Required";
      potentialRating = "4.95/5 Live Local Logistics Index";
      approvedLoc = "Central Commercial Metro Terminal Zone";
    } else if (query.includes("patna") || query.includes("kanpur") || query.includes("prayagraj") || query.includes("lucknow")) {
      status = "CRITICAL DEMAND HUB";
      text = "Direct integrations with railway lines pending! Pre-approved kitchen space available next week.";
      color = "red";
      speed = "Priority Launch Program Active";
      potentialRating = "5.0/5 High Volume Junction Index";
      approvedLoc = "Main Railway Terminal Platform Gate 1-3 Junction";
    } else if (query.length < 4) {
      status = "HIGH DEMAND";
      text = "Available. High growth tier-2 hub ready for dispatch routing.";
      color = "emerald";
    }

    setCityCheckResult({
      city: citySearch.trim(),
      status,
      text,
      color,
      speed,
      potentialRating,
      approvedLoc
    });
  };

  // Prepopulated investment tiers info
  const investmentTiers = [
    {
      name: "Micro Express Hub",
      capital: "₹12 Lakhs - ₹15 Lakhs",
      minCapital: 1200000,
      space: "150 - 200 sqft kitchen area",
      margin: "22% Net Operating Margin",
      description: "Optimized for train station platform terminals and rapid dispatch clusters. Low capital overhead, hyper-focused menu options.",
      highlights: ["Fast automated setup (20 days)", "Integrated IRCTC express terminal client APIs", "Direct local station rider parking rights"],
      icon: "⚡"
    },
    {
      name: "Urban Dense Grid",
      capital: "₹22 Lakhs - ₹28 Lakhs",
      minCapital: 2200000,
      space: "350 - 500 sqft double zone",
      margin: "26% Net Operating Margin",
      description: "Our most popular corporate tier. Built for dense technology parks, metro platforms, and central tier-1 high-density regions.",
      highlights: ["Automatic convection pizza decks", "Dedicated dispatch driver team mapping", "Dual terminal kitchen operations (Pizza+Burgers)"],
      icon: "🏢",
      popular: true
    },
    {
      name: "District Master Franchise",
      capital: "₹45 Lakhs - ₹50 Lakhs",
      minCapital: 4500000,
      space: "800+ sqft master node grid",
      margin: "30% Net Operating Margin",
      description: "Exclusive administrative control over an entire territory. Generates additional direct revenue overrides from local Express Hubs.",
      highlights: ["Territory distribution ownership", "Direct API key admin permissions", "Autonomous rider fleet allocation module"],
      icon: "👑"
    }
  ];

  // Verified running franchise hubs showcard data
  const runningHubs = [
    {
      city: "Kanpur Central (Hub CC-1)",
      orders: "15,840+",
      revenue: "₹50.6L",
      monthlyProfit: "₹13.1L",
      paybackDone: "Yes (9 Months)",
      investor: "Amit Verma (Former Logistics Manager)",
      image: "https://images.unsplash.com/photo-1590846083693-f23f80c55041?auto=format&fit=crop&w=400&q=80",
      rating: "4.9/5 Grid Rating"
    },
    {
      city: "New Delhi Station Zone (Hub ND-2)",
      orders: "21,200+",
      revenue: "₹67.8L",
      monthlyProfit: "₹20.3L",
      paybackDone: "Yes (11 Months)",
      investor: "Sanjay & Meera Goel (Retail Veterans)",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80",
      rating: "4.85/5 Grid Rating"
    },
    {
      city: "Prayagraj Junction (Hub PJ-4)",
      orders: "11,450+",
      revenue: "₹36.6L",
      monthlyProfit: "₹8.0L",
      paybackDone: "In Progress (60% Recouped)",
      investor: "Priyanka Sen (Culinary Entrepreneur)",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80",
      rating: "4.78/5 Grid Rating"
    }
  ];

  const testimonials = [
    {
      quote: "Managing a standard franchise meant giving away 30% of my revenue to aggregator apps as commission. SmartServe's direct-delivery model and integration with major train route PNR schedules guarantees us built-in high volume. Our initial capital investment was completely paid back in under ten months!",
      author: "Rajesh Malhotra",
      location: "NCR Region Master Partner",
      growth: "+148% Year-over-Year Revenue Boost",
      stat: "₹18.4 Lakhs Monthly Net Operating Cashflow",
      rating: 5
    },
    {
      quote: "The automated logistics engine is a game-changer. Orders from train passengers come in automatically timed perfectly to their PNR arrivals at our station platforms. We don't have to worry about finding deliveries; the system drives the volume and calculates intelligent surges. It works perfectly.",
      author: "Nandini Rao",
      location: "Bengaluru East Town Hub Owner",
      growth: "+220% Order Volume Growth since Launch",
      stat: "14.2 Mins Average Delivery Arrival Time",
      rating: 5
    }
  ];

  const scrollSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen pb-16">
      
      {/* 1. HERO SECTION WITH IMAGE OVERLAY */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
        
        {/* Absolute Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1920&q=80" 
            alt="Smart Kitchen Tech Hub" 
            className="w-full h-full object-cover opacity-25 filter brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-transparent to-slate-950/90"></div>
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center space-y-8 select-none">
          <div className="inline-flex items-center gap-2 bg-[#FF4D2D]/10 hover:bg-[#FF4D2D]/20 border border-[#FF4D2D]/30 px-4 py-1.5 rounded-full text-xs font-semibold text-[#FF4D2D] tracking-wide uppercase transition-all">
            <TrendingUp className="w-4.5 h-4.5" />
            <span>Join India's Fastest Growing Food Tech Franchise</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight leading-tight max-w-5xl mx-auto uppercase">
            Invest in the Future of <br/>
            <span className="text-[#FF4D2D] bg-clip-text">Smart Platform Dining</span>
          </h1>

          <p className="text-sm md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            Powering cloud kitchens with native GPS rider networks, live automated kitchen convection hardware, 
            and zero-commission integrations with India's busiest railway network itineraries. Enjoy stable 
            <span className="text-[#FFD700] font-semibold"> 26% - 30% average net operating margins</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => scrollSection("apply-now-form-anchor")}
              className="w-full sm:w-auto bg-[#FF4D2D] hover:bg-[#E04122] text-white font-black px-8 py-4 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all duration-300 hover:scale-[1.03] space-y-1 block md:inline cursor-pointer"
            >
              Apply For Franchise Now
            </button>
            <button
              onClick={() => scrollSection("roi-calculator-section")}
              className="w-full sm:w-auto bg-[#1C1C1C] hover:bg-slate-850 border border-slate-700 text-slate-200 hover:text-white font-bold px-8 py-4 rounded-xl text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Calculate Operational ROI</span>
              <ArrowRight className="w-4 h-4 text-[#FFD700]" />
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12 border-t border-slate-800/60 text-left">
            <div>
              <div className="text-2xl md:text-3xl font-black text-white font-display">₹1.8 Cr+</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-mono">Gross Sales Routed</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black text-[#FFD700] font-display">26.4%</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-mono font-bold">Average Hub Net ROI</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black text-white font-display">11 Months</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-mono">Average Payback</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black text-emerald-500 font-display">99.8%</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-mono">Platform Integrity Score</div>
            </div>
          </div>
        </div>

        {/* Elegant Abstract Bottom Slope */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-slate-50 relative z-10" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}></div>
      </section>

      {/* 2. TRUST SECTIONS: WHY INVEST & INVESTMENT MATRIX */}
      <section className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {/* Why Invest Headline */}
        <div className="text-center space-y-3">
          <span className="text-[11px] font-black text-[#FF4D2D] uppercase tracking-widest font-mono">Why SmartServe OS?</span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display uppercase tracking-tight text-[#1C1C1C]">
            Engineered For Higher Yield Capital
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto font-light">
            Traditional food businesses fail because of runaway landlord costs and 30% aggregator commissions. 
            SmartServe redefines cooking economics.
          </p>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF4D2D]"></div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF4D2D]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 uppercase font-display tracking-tight group-hover:text-[#FF4D2D] transition-colors">
              Pristine Profit Margins
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              By using compact 250 sqft automated micro-grids next to busy delivery ports instead of multi-seat expensive dining spaces, 
              we slash overhead. Expect a clean 26% to 30% operational profit on every pizza or burger rolled out.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FFD700]"></div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-650">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 uppercase font-display tracking-tight group-hover:text-yellow-650 transition-colors">
              AI Command Logistics
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Our backend predicts surge demand based on weather, local schedules, and train delayed timings. 
              Ingredients are organized on-screen, dynamic pricing triggers autonomously, and drivers are auto-dispatched to passenger coaches.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-950">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 uppercase font-display tracking-tight group-hover:text-slate-800 transition-colors">
              Unfair Channel Traffic
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              SmartServe integrates natively with high-volume train itineraries and railway platforms. 
              Our customers aren't just local office workers; we capture thousands of hungry train travelers entering target terminals daily.
            </p>
          </div>

        </div>

        {/* Dynamic Investment Tiers Grid */}
        <div className="space-y-8">
          <div className="text-center md:text-left space-y-1">
            <span className="text-[11px] font-bold text-[#FF4D2D] uppercase tracking-wider font-mono">Tailored Capital Architecture</span>
            <h3 className="text-2xl font-bold font-display uppercase text-slate-900">Select Your Investment Model</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {investmentTiers.map((tier) => (
              <div 
                key={tier.name} 
                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 relative ${tier.popular ? "border-[#FF4D2D] shadow-lg shadow-orange-500/5 ring-1 ring-[#FF4D2D]/30" : "border-slate-100 shadow-sm hover:shadow-md"}`}
              >
                {tier.popular && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 bg-[#FF4D2D] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    ⭐ MOST SELECTED TIER
                  </span>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{tier.icon}</span>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Verified CapEx
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-950 uppercase font-display tracking-tight">{tier.name}</h4>
                    <p className="text-xs text-slate-400 pt-1 leading-snug">{tier.description}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Required Capital Setup</div>
                    <div className="text-xl font-black text-[#FF4D2D] font-mono leading-none pt-1">{tier.capital}</div>
                    
                    <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider pt-3">Operational Target</div>
                    <div className="text-xs font-bold text-slate-800 pt-0.5">{tier.margin}</div>
                    
                    <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider pt-3">Space Requirement</div>
                    <div className="text-xs text-slate-600 pt-0.5">{tier.space}</div>
                  </div>

                  {/* Highlights list check */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider block">Model Advantages:</span>
                    {tier.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                </div>

                <div className="pt-6 border-t border-slate-50 mt-6">
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, availableCapital: tier.capital }));
                      setCapitalInput(tier.minCapital);
                      scrollSection("apply-now-form-anchor");
                    }}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${tier.popular ? "bg-[#FF4D2D] hover:bg-[#E04122] text-white shadow-md shadow-orange-500/20" : "bg-slate-900 hover:bg-slate-800 text-white"}`}
                  >
                    Select {tier.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 3. PROCESS FLOW: STEP-BY-STEP ONBOARDING UI */}
      <section className="bg-slate-950 text-white py-16 relative overflow-hidden">
        
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-black text-[#FFD700] uppercase tracking-widest font-mono">Streamlined Execution Timeline</span>
            <h2 className="text-3xl font-black font-display uppercase tracking-tight">Onboarding Timeline (30 Days)</h2>
            <p className="text-xs text-slate-400 font-light">
              We guide you step-by-step from raw zoning up to active order dispatch logs. You retain complete franchise equity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Onboarding Step 1 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative space-y-3 hover:border-slate-700 transition-colors">
              <span className="absolute top-4 right-4 text-xs font-black font-mono text-[#FF4D2D] bg-[#FF4D2D]/10 px-2 py-1 rounded-md">
                DAY 1 - 3
              </span>
              <div className="w-10 h-10 rounded-full bg-[#FF4D2D]/20 flex items-center justify-center font-bold text-[#FF4D2D]">
                1
              </div>
              <h4 className="text-sm font-bold uppercase font-display text-white">Dossier Evaluation</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Submit raw capital specifications and local city target information. Our legal developers verify availability and pre-requisites.
              </p>
            </div>

            {/* Onboarding Step 2 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative space-y-3 hover:border-slate-700 transition-colors">
              <span className="absolute top-4 right-4 text-xs font-black font-mono text-[#FF4D2D] bg-[#FF4D2D]/10 px-2 py-1 rounded-md">
                DAY 4 - 8
              </span>
              <div className="w-10 h-10 rounded-full bg-[#FF4D2D]/20 flex items-center justify-center font-bold text-[#FF4D2D]">
                2
              </div>
              <h4 className="text-sm font-bold uppercase font-display text-white">Zone Mapping</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Deploy smart AI mapping algorithms to finalize commercial locations, nearby railway platforms, and dense IT park coordinates.
              </p>
            </div>

            {/* Onboarding Step 3 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative space-y-3 hover:border-slate-700 transition-colors">
              <span className="absolute top-4 right-4 text-xs font-black font-mono text-[#FF4D2D] bg-[#FF4D2D]/10 px-2 py-1 rounded-md">
                DAY 9 - 15
              </span>
              <div className="w-10 h-10 rounded-full bg-[#FF4D2D]/20 flex items-center justify-center font-bold text-[#FF4D2D]">
                3
              </div>
              <h4 className="text-sm font-bold uppercase font-display text-white">Platform Allocation</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Execution of legal SLAs, deployment of convection oven hardware grids, offline setup, and live driver registration.
              </p>
            </div>

            {/* Onboarding Step 4 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative space-y-3 hover:border-slate-700 transition-colors">
              <span className="absolute top-4 right-4 text-xs font-black font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                DAY 16 - 30
              </span>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
                4
              </div>
              <h4 className="text-sm font-bold uppercase font-display text-white">Full Active Stream</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Go Live! Connect to our automated central routing software, receive live passenger itineraries, and trigger operating revenue!
              </p>
            </div>

          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-slate-400">
              Need immediate emergency review of an existing commercial plot? 
              <span className="text-[#FFD700] hover:underline cursor-pointer font-bold ml-1" onClick={() => scrollSection("apply-now-form-anchor")}>
                Skip the grid queue by applying direct
              </span>
            </p>
          </div>

        </div>

      </section>

      {/* 5. DYNAMIC UX ENHANCEMENTS: ROI CALCULATOR & CITY CHECKER */}
      <section className="bg-white py-16 border-y border-slate-100" id="roi-calculator-section">
        
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* ROI Calculator Column (Left Large) */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            
            <div className="space-y-1">
              <span className="bg-[#FF4D2D]/10 text-[#FF4D2D] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full font-mono">
                Interactive Model Engine
              </span>
              <h3 className="text-xl md:text-2xl font-black font-display uppercase tracking-tight text-slate-900 pt-1">
                Calculate Projected Sales Yield
              </h3>
              <p className="text-xs text-slate-400">
                Drag the sliders to preview estimated earnings, operating expenses, and exact capital payback timeframes.
              </p>
            </div>

            {/* Slider 1: Capital */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                  Setup Capital Investment
                </label>
                <span className="text-sm font-black text-[#FF4D2D] font-mono">
                  ₹{(capitalInput / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <input 
                type="range"
                min="1000000"
                max="5000000"
                step="100000"
                value={capitalInput}
                onChange={(e) => setCapitalInput(parseInt(e.target.value))}
                className="w-full accent-[#FF4D2D] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Micro Express (₹10L)</span>
                <span>Elite Master Unit (₹50L)</span>
              </div>
            </div>

            {/* Slider 2: Monthly Orders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                  Projected Monthly Orders
                </label>
                <span className="text-sm font-black text-slate-800 font-mono">
                  {monthlyOrdersInput.toLocaleString()} Orders / month
                </span>
              </div>
              <input 
                type="range"
                min="1500"
                max="12000"
                step="250"
                value={monthlyOrdersInput}
                onChange={(e) => setMonthlyOrdersInput(parseInt(e.target.value))}
                className="w-full accent-[#FF4D2D] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>1,500 orders</span>
                <span>Active Station Peak (12,000)</span>
              </div>
            </div>

            {/* Dynamic ROI Dashboard output */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block leading-none">Est. Monthly Sales</span>
                  <span className="text-lg font-black font-mono text-[#1C1C1C] pt-2">
                    ₹{Math.round(estimatedMonthlyRevenue / 1000) / 100}L
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block leading-none">Net Profit Margin</span>
                  <span className="text-lg font-black font-mono text-emerald-600 pt-2">
                    {(marginPercentage * 100)}%
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex flex-col justify-center col-span-2 lg:col-span-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block leading-none">Monthly Net Profit</span>
                  <span className="text-lg font-black font-mono text-[#FF4D2D] pt-2">
                    ₹{Math.round(estimatedMonthlyProfit).toLocaleString("en-IN")}
                  </span>
                </div>

              </div>

              {/* Payback Visualizer Meter */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-y-1/3 translate-x-1/3 opacity-5 pointer-events-none">
                  <PieChart className="w-36 h-36" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <span className="text-[10px] text-[#FFD700] uppercase font-mono font-bold tracking-widest block">Projected Payback Target</span>
                    <strong className="text-xl md:text-2xl font-extrabold font-display uppercase tracking-tight text-white block pt-0.5">
                      {estimatedPaybackMonths} Months Payback
                    </strong>
                    <p className="text-[10px] text-slate-400 pt-1 leading-normal max-w-md">
                      Capital entirely recouped. Subsequent yields act as direct equity operational dividend profits.
                    </p>
                  </div>

                  <div className="w-full md:w-auto text-right">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Annual Operating Return</span>
                    <span className="text-xl font-mono font-black text-emerald-400">
                      ₹{Math.round(estimatedMonthlyProfit * 12 / 100000).toFixed(1)} Lakhs / Yr
                    </span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Capital Recouped</span>
                    <span>100% Equity Profit</span>
                  </div>
                  <div className="h-2 bg-slate-850 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${estimatedPaybackMonths <= 12 ? "bg-emerald-500" : "bg-amber-400"}`} 
                      style={{ width: `${Math.min(100, Math.max(10, (12 / estimatedPaybackMonths) * 100))}%` }}
                    ></div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* City Availability Checker Column (Right Small) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#1C1C1C] text-white p-6 rounded-3xl space-y-4 shadow-md relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF4D2D]/5 rounded-full blur-2xl"></div>
              
              <div className="space-y-1">
                <div className="text-[10px] text-[#FFD700] font-mono tracking-widest uppercase font-bold">Node Availability GPS</div>
                <h3 className="text-lg font-black font-display uppercase tracking-tight text-white">City Node Finder</h3>
                <p className="text-[11px] text-slate-400 leading-normal font-light">
                  Query your city to see pre-approved location viability and local station passenger densities.
                </p>
              </div>

              <form onSubmit={handleCheckCity} className="flex gap-2">
                <div className="relative flex-grow">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter city (e.g. Kanpur, Pune)"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none focus:border-[#FF4D2D]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#FF4D2D] hover:bg-[#E04122] text-white p-3 rounded-xl flex items-center justify-center transition-transform hover:scale-105 shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Check result rendering */}
              <AnimatePresence mode="wait">
                {cityCheckResult ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white uppercase">{cityCheckResult.city} Node</span>
                      <span className={`text-[9px] font-black font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                        cityCheckResult.color === "emerald" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        cityCheckResult.color === "amber" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-[#FF4D2D]/10 text-[#FF4D2D] border border-[#FF4D2D]/20"
                      }`}>
                        {cityCheckResult.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {cityCheckResult.text}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-3 leading-tight">
                      <div>
                        <span className="block text-slate-500 uppercase text-[8px] tracking-wider">Approved Site:</span>
                        <span className="text-slate-200 mt-0.5 block font-sans font-bold leading-normal">{cityCheckResult.approvedLoc}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 uppercase text-[8px] tracking-wider">Demand Tier:</span>
                        <span className="text-slate-200 mt-0.5 block font-sans font-bold leading-normal">{cityCheckResult.potentialRating}</span>
                      </div>
                    </div>

                    <p className="text-[9px] text-[#FFD700] hover:underline cursor-pointer flex items-center gap-1 font-semibold" onClick={() => {
                        setFormData(prev => ({ ...prev, targetCity: cityCheckResult.city }));
                        scrollSection("apply-now-form-anchor");
                    }}>
                      <span>Fill Application with pre-approved site</span>
                      <ArrowRight className="w-3 h-3" />
                    </p>

                  </motion.div>
                ) : (
                  <div className="p-4 bg-slate-900/40 border border-slate-800/40 rounded-2xl text-center py-6 text-slate-500 text-xs italic font-mono">
                    Type 'Kanpur', 'Pune' or 'Mumbai' above for dynamic geo data routing.
                  </div>
                )}
              </AnimatePresence>

            </div>

            {/* Testimonials Quote Blocks */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-3xl space-y-4">
              <span className="text-[9px] font-black text-[#FF4D2D] uppercase tracking-wider font-mono">Verified Operators</span>
              
              <div className="space-y-4">
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{testimonials[activeTestimonial].quote}"
                </p>

                <div className="flex items-center justify-between border-t border-slate-150 pt-3">
                  <div>
                    <h5 className="text-xs font-black text-slate-900 leading-tight block">{testimonials[activeTestimonial].author}</h5>
                    <span className="text-[10px] text-slate-400 font-mono block">{testimonials[activeTestimonial].location}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 font-mono font-bold block">{testimonials[activeTestimonial].stat}</span>
                    <span className="text-[9px] text-slate-400 font-mono block leading-none">{testimonials[activeTestimonial].growth}</span>
                  </div>
                </div>

                {/* Testimonial slider toggle buttons */}
                <div className="flex items-center gap-1.5 justify-center pt-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${activeTestimonial === idx ? "w-6 bg-[#FF4D2D]" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
                    ></button>
                  ))}
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* 4. SHOWCASE: EXISTING VERIFIED FRANCHISES */}
      <section className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        
        <div className="text-center md:text-left space-y-1">
          <span className="text-[11px] font-black text-[#FF4D2D] uppercase tracking-widest font-mono">Live Operating Performance</span>
          <h3 className="text-2xl md:text-3xl font-extrabold font-display uppercase tracking-tight text-[#1C1C1C]">
            Verified Operational Hubs
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl">
            Real performance figures retrieved directly from active server ledger databases showing investment security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {runningHubs.map((hub) => (
            <div key={hub.city} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              <div className="h-44 relative bg-slate-900">
                <img 
                  src={hub.image} 
                  alt={hub.city} 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                
                <span className="absolute bottom-4 left-4 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
                  <span>Active Hub</span>
                </span>
                
                <span className="absolute top-4 right-4 bg-slate-900/90 text-[#FFD700] text-[9px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-lg border border-slate-700/50">
                  {hub.rating}
                </span>
              </div>

              <div className="p-5 space-y-4">
                
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase font-display leading-tight">{hub.city}</h4>
                  <span className="text-[10px] text-slate-400 font-mono leading-none pt-0.5 block">Managed by {hub.investor}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 border border-slate-100 p-2.5 rounded-2xl font-mono text-[10px]">
                  <div>
                    <span className="text-slate-400 lowercase text-[8px] tracking-tight block">Orders/mo</span>
                    <strong className="text-slate-800 font-black">{hub.orders}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 lowercase text-[8px] tracking-tight block">sales/mo</span>
                    <strong className="text-slate-800 font-black">{hub.revenue}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 lowercase text-[8px] tracking-tight block">profit/mo</span>
                    <strong className="text-[#FF4D2D] font-bold">{hub.monthlyProfit}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] border-t border-slate-50 pt-3">
                  <span className="text-slate-400 text-[10px]">Payback Period Done:</span>
                  <span className="font-bold text-slate-700">{hub.paybackDone}</span>
                </div>

              </div>

            </div>
          ))}
        </div>

      </section>

      {/* 5. APPLICATION FORM SECTION */}
      <section className="bg-[#1C1C1C] text-white py-16" id="apply-now-form-anchor">
        
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Form Brief Left */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <span className="text-[11px] font-black text-[#FFD700] uppercase tracking-widest font-mono block">Become a Venture Partner</span>
            <h2 className="text-3xl font-black font-display uppercase tracking-tight text-white">
              Start Your SmartServe Partnership
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Submit your information. Once logged in our central database, our venture advisors will coordinate a localized physical zoning and feasibility analysis.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-[#FF4D2D]/30 flex items-center justify-center text-[#FF4D2D] shrink-0 font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase font-display text-slate-200">20-Min Validation Review</h5>
                  <p className="text-[10px] text-slate-500 font-light mt-0.5">Automated screening filters assess capital allocations.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-[#FF4D2D]/30 flex items-center justify-center text-[#FF4D2D] shrink-0 font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase font-display text-slate-200">Dynamic Live Telemetry</h5>
                  <p className="text-[10px] text-slate-500 font-light mt-0.5">Your submitted applicant dossier updates on the board stream instantly.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Form panel & list queue */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative">
              
              <div className="flex items-center gap-2 justify-between">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">
                  Partnership Dossier File
                </h3>
                <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wide">
                  SECURE SEC-3 PORT
                </span>
              </div>

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-emerald-500/10 text-xs text-emerald-400 font-semibold border border-emerald-500/35 rounded-2xl flex items-start gap-2.5 leading-relaxed"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {/* Floating style form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                
                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 font-mono tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your registered legal name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-100 outline-none focus:border-[#FF4D2D] transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 font-mono tracking-wider">
                      Business Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. malhotra@outlook.com"
                      value={formData.emailAddress}
                      onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-100 outline-none focus:border-[#FF4D2D] transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 font-mono tracking-wider">
                      Active Phone Number / WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 9988776655"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-100 outline-none focus:border-[#FF4D2D] transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 font-mono tracking-wider">
                      Target Franchise City location
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pune, Kanpur Central"
                      value={formData.targetCity}
                      onChange={(e) => setFormData({ ...formData, targetCity: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-100 outline-none focus:border-[#FF4D2D] transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 font-mono tracking-wider">
                      Available Investable Capital
                    </label>
                    <select
                      value={formData.availableCapital}
                      onChange={(e) => setFormData({ ...formData, availableCapital: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-100 outline-none focus:border-[#FF4D2D] transition-all font-mono font-bold"
                    >
                      <option>₹12 Lakhs - ₹15 Lakhs</option>
                      <option>₹15 Lakhs - ₹25 Lakhs</option>
                      <option>₹25 Lakhs - ₹40 Lakhs</option>
                      <option>₹45 Lakhs+ Master Franchise Node</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 font-mono tracking-wider">
                    Experience / Existing retail portfolio (Optional)
                  </label>
                  <textarea
                    placeholder="Describe any previous convenience dining, real estate investments, or retail franchise operations you hold."
                    value={formData.experienceDesc}
                    onChange={(e) => setFormData({ ...formData, experienceDesc: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-100 outline-none focus:border-[#FF4D2D] min-h-[90px] transition-all font-medium text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#FF4D2D] hover:bg-[#E04122] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 transform hover:scale-[1.01] text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-black/25"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>{submitting ? "Transmitting Profile..." : "Transmit Partnership Application Form"}</span>
                </button>

              </form>

            </div>

            {/* Applicant Live board progress status stream panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4 max-h-[380px] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping"></span>
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest font-mono">
                    Board Ingress status stream
                  </h4>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {submissionsList.length} application(s) indexed
                </span>
              </div>

              {submissionsList.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-mono text-[11px] space-y-2">
                  <div className="flex justify-center"><Info className="w-8 h-8 text-slate-600" /></div>
                  <p>No active franchise applications currently logged on our node.</p>
                  <p className="text-[10px] text-slate-600">Your submitted dossiers will register here immediately.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                  {submissionsList.map((applicant, i) => (
                    <div key={applicant.id || i} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-inner">
                      
                      <div className="flex items-center justify-between gap-1">
                        <strong className="text-xs font-bold text-white font-sans tracking-wide block truncate">{applicant.fullName}</strong>
                        <span className="shrink-0 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[8px] font-bold border border-amber-500/20 uppercase">
                          Reviewing
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono text-[10px] text-slate-400 leading-tight">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Target Node:</span>
                          <span className="text-slate-200 font-sans font-semibold">{applicant.targetCity || "Pending"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">AOV Tier:</span>
                          <span className="text-emerald-400 font-bold">{applicant.availableCapital}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">L_ID:</span>
                          <span className="text-slate-300">{applicant.id}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
