import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Send, 
  CheckCircle, 
  Smartphone, 
  Clock, 
  Award, 
  Bike, 
  DollarSign, 
  MapPin, 
  TrendingUp, 
  UserCheck, 
  FileText, 
  Upload, 
  Navigation, 
  Activity, 
  Check, 
  Shield, 
  PieChart, 
  ArrowRight, 
  ChevronRight, 
  Star, 
  Users, 
  Utensils, 
  Laptop, 
  Calendar 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CareersPage() {
  // Tab-based applications toggle: 'rider' | 'staff'
  const [activeFormTab, setActiveFormTab] = useState<"rider" | "staff">("rider");

  // Job Categories for filtration
  const [activeJobCategory, setActiveJobCategory] = useState<"all" | "fleet" | "kitchen" | "hq">("all");

  // Onboarding Location vacancy availability tool state
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [checkedCityResult, setCheckedCityResult] = useState<any | null>(null);

  // Interactive Calculator State
  const [vehicleType, setVehicleType] = useState<"bicycle" | "ev" | "motorcycle">("motorcycle");
  const [dailyDeliveries, setDailyDeliveries] = useState(18);
  const [daysPerWeek, setDaysPerWeek] = useState(6);

  // Application database list state
  const [applicantHistory, setApplicantHistory] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Rider Form fields state
  const [riderForm, setRiderForm] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    riderVehicle: "motorcycle",
    licenseNumber: "",
    preferredCity: "",
    experienceYears: "0",
    coverLetter: "Rider onboard files"
  });

  // Corporate & Kitchen Form fields state
  const [staffForm, setStaffForm] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    appliedRole: "Pizza Convection Specialist / Chef",
    experienceYears: "2",
    preferredCity: "New Delhi",
    coverLetter: ""
  });

  // Drag and drop mock file upload state
  const [mockFileUploaded, setMockFileUploaded] = useState<{ name: string; size: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Testimonial selection pointer index
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Load applicants from endpoint database
  const fetchApplicants = async () => {
    try {
      const res = await fetch("/api/careers/list");
      if (res.ok) {
        const data = await res.json();
        setApplicantHistory(data);
      }
    } catch (e) {
      console.error("Failed to load applicants queue", e);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // Handle Rider Submission
  const handleRiderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderForm.candidateName || !riderForm.candidatePhone || !riderForm.candidateEmail) return;

    setSubmitting(true);
    setSuccessMsg("");

    const submissionPayload = {
      candidateName: riderForm.candidateName,
      candidateEmail: riderForm.candidateEmail,
      candidatePhone: riderForm.candidatePhone,
      appliedRole: `Fleet Rider (${riderForm.riderVehicle.toUpperCase()}) - City: ${riderForm.preferredCity || 'N/A'}`,
      experienceYears: riderForm.experienceYears,
      coverLetter: `Driving License: ${riderForm.licenseNumber || "None/EV"}. preferredCity: ${riderForm.preferredCity}. Info: ${riderForm.coverLetter}`
    };

    try {
      const res = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload)
      });
      if (res.ok) {
        setSuccessMsg("CAPTAIN BIO NOTED! Your profile has been queued for immediate priority launch kit distribution. Keep your phone handy for our Fleet Manager SMS.");
        setRiderForm({
          candidateName: "",
          candidateEmail: "",
          candidatePhone: "",
          riderVehicle: "motorcycle",
          licenseNumber: "",
          preferredCity: "",
          experienceYears: "0",
          coverLetter: "Rider onboard files"
        });
        setMockFileUploaded(null);
        fetchApplicants();
        // Scroll to success message
        document.getElementById("submission-feedback-focus")?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (e) {
      console.error("Error submitting", e);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Corporate / Kitchen Submission
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.candidateName || !staffForm.candidatePhone || !staffForm.candidateEmail) return;

    setSubmitting(true);
    setSuccessMsg("");

    const submissionPayload = {
      candidateName: staffForm.candidateName,
      candidateEmail: staffForm.candidateEmail,
      candidatePhone: staffForm.candidatePhone,
      appliedRole: staffForm.appliedRole,
      experienceYears: staffForm.experienceYears,
      coverLetter: `Resume attached: ${mockFileUploaded ? mockFileUploaded.name : "Generated.pdf"}. Location: ${staffForm.preferredCity}. Note: ${staffForm.coverLetter}`
    };

    try {
      const res = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload)
      });
      if (res.ok) {
        setSuccessMsg("PORTAL SYNC SUCCESSFUL! Your professional curriculum dossier is securely indexed in the Google Cloud database. Recruiting executives will arrange virtual calls shortly.");
        setStaffForm({
          candidateName: "",
          candidateEmail: "",
          candidatePhone: "",
          appliedRole: "Pizza Convection Specialist / Chef",
          experienceYears: "2",
          preferredCity: "New Delhi",
          coverLetter: ""
        });
        setMockFileUploaded(null);
        fetchApplicants();
        // Scroll to success message
        document.getElementById("submission-feedback-focus")?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (e) {
      console.error("Error submitting", e);
    } finally {
      setSubmitting(false);
    }
  };

  // Run Rider Earnings math
  const getRatePerOrder = () => {
    if (vehicleType === "bicycle") return 30; // ₹30 / order for cyclist
    if (vehicleType === "ev") return 40; // ₹40 / order for EV rider
    return 48; // ₹48 / order for high speed motorcycle
  };

  const ratePerOrder = getRatePerOrder();
  const weeklyDeliveries = dailyDeliveries * daysPerWeek;
  const baseWeeklyPay = weeklyDeliveries * ratePerOrder;

  // Add incentivized milestones
  // If customer achieves 22+ daily deliveries, trigger active surge bonus of ₹10 extra per delivery
  const dailySurgeBonus = dailyDeliveries >= 18 ? dailyDeliveries * 10 * daysPerWeek : 0;
  // If rider works 6 or 7 days, trigger flat ₹1,200 absolute fleet commitment loyalty pay
  const loyaltyIncentive = daysPerWeek >= 6 ? 1200 : daysPerWeek >= 5 ? 600 : 0;

  const totalWeeklyEarnings = baseWeeklyPay + dailySurgeBonus + loyaltyIncentive;
  const projectedMonthlyEarnings = Math.round(totalWeeklyEarnings * 4.33);

  // Dynamic Location Viability check handler
  const handleLocationCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearchQuery.trim()) return;

    const query = citySearchQuery.trim().toLowerCase();
    
    // Create immersive city profiles for realism
    let status = "ACTIVE RECRUITMENT";
    let message = "9 Rider Positions open immediately. Pick up your high-convective food kit today.";
    let bonus = "₹1,500 Sign-on Bonus active for first 20 deliveries!";
    let hubs = "Kanpur Main Station / Civil Lines Metro Grid";
    let demandRating = "EXTREMELY HIGH DEMAND";
    let color = "emerald";

    if (query.includes("delhi") || query.includes("noida") || query.includes("gurugram") || query.includes("ncr")) {
      status = "IMMEDIATE FLEET SLOTS OPEN";
      message = "24 Rider slots available across dynamic train platform junctions.";
      bonus = "₹2,500 NCR Capital joining bonus with guaranteed weekly loyalty payout.";
      hubs = "Connaught Place Hub / New Delhi Junction Gate Suite";
      demandRating = "HEAVY TRANSIT ZONE";
      color = "orange";
    } else if (query.includes("bengaluru") || query.includes("bangalore")) {
      status = "HIGH-SPEED FLEET ACTIVE";
      message = "5 EV Rider spots left. Enjoy corporate park and tech node routes only.";
      bonus = "₹2,000 EV Captain Green transition allowance.";
      hubs = "Indiranagar Core / Majestic Terminal Node";
      demandRating = "STEADY ORDER STREAM";
      color = "emerald";
    } else if (query.includes("patna") || query.includes("lucknow") || query.includes("varanasi")) {
      status = "CRITICAL COURIER NEED";
      message = "Urgent high volume expansion zone. Train timings synced routes are looking for drivers.";
      bonus = "₹3,000 Super-Captain Priority on-boarding cash stimulus.";
      hubs = "Platform 1 Terminal Counter / Central bypass junction";
      demandRating = "HIGHEST PAYOUTS AVAILABLE";
      color = "red";
    } else if (query.length < 3) {
      status = "INACTIVE ZONE";
      message = "Checking network logs... Please type full city name.";
      bonus = "N/A";
      hubs = "Pending platform expansion";
      demandRating = "MONITORING LOGS";
      color = "slate";
    }

    setCheckedCityResult({
      city: citySearchQuery.trim(),
      status,
      message,
      bonus,
      hubs,
      demandRating,
      color
    });
  };

  // Core career options listing array
  const careersListingData = [
    {
      title: "In-House Thermal Rider",
      department: "fleet",
      location: "Delhi Central, Noida & Gurugram grids",
      salary: "₹18,000 - ₹32,000 / month + commission / delivery",
      type: "Full Time / Hourly Shift",
      description: "Deliver gourmet pizzas and hot combos in our revolutionary smart heat-jacket thermal backpacks. Real-time PNR routing handles the customer timing dynamically. Standard life insurance policies paid.",
      perks: ["Double payout during rain cycles", "Medical shield for dependants", "Free EV rental options"]
    },
    {
      title: "Pizza Convection Specialist / Chef",
      department: "kitchen",
      location: "Kanpur Central Railway Terminal Junction",
      salary: "₹25,000 - ₹34,000 / month",
      type: "Full Time",
      description: "Conduct high-capacity convection oven operations. Standardize recipe preparation with precise timer tracking. Ensure proper segmentation of pure vegetarian and Jain-friendly ingredients.",
      perks: ["Performance index bonuses", "Free kitchen meals provided", "Overtime allowance 1.5x scale"]
    },
    {
      title: "Franchise Hub Terminal Manager",
      department: "kitchen",
      location: "Prayagraj Junction Junction Desk",
      salary: "₹28,000 - ₹36,000 / month",
      type: "Staff Full Time",
      description: "Supervise incoming PNR requests, coordinate dispatch timelines with fleet riders, monitor cold-chain compliance, and conduct daily financial register settlements with corporate HQ.",
      perks: ["Direct franchise equity shares", "Paid annual vacation", "Quarterly leadership training"]
    },
    {
      title: "Regional Fleet Dispatch Architect",
      department: "hq",
      location: "Technology HQ, New Delhi",
      salary: "₹55,000 - ₹75,000 / month",
      type: "Corporate Full Time",
      description: "Analyze geographic heat-maps to optimize rider positioning next to train arrival slots. Oversee API system triggers and coordinate response times across multiple metro stations.",
      perks: ["Premium MacBook setup", "Hybrid flexible work days", "Complete health comprehensive plan"]
    },
    {
      title: "Database Reliability Engineer (DRE)",
      department: "hq",
      location: "Corporate HQ, New Delhi",
      salary: "₹80,500 - ₹1,10,000 / month",
      type: "Corporate / Technical",
      description: "Ensure 100% uptime of our real-time train matching PNR engine and underlying Postgres & MongoDB telemetry streams. Refine secure database rules for multi-tenant franchise access.",
      perks: ["ESOP equity options", "Flexible remote setup", "Learning budget of ₹40k/yr"]
    }
  ];

  // Rider Success Stories
  const riderReviews = [
    {
      name: "Ramesh Thapa",
      role: "EV Logistics Partner, New Delhi",
      earnings: "₹38,400 Avg Monthly Income",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      quote: "Before joining SmartServe, I delivered for multi-restaurant apps. Most of my day was wasted driving around. Here, orders are queued instantly based on train times. My deliveries are completed in a 3km radius of the station platform. I get paid every Tuesday on time!"
    },
    {
      name: "Gaganpreet Singh",
      role: "Senior Fleet Captain, Kanpur Node",
      earnings: "₹42,100 Avg Monthly Income",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      quote: "The loyalty and rain bonuses are incredible. Because SmartServe kitchens are highly automated, I never have to stand around waiting for the food. I pick up the thermal carrier, and the coordinates take me straight to the railway platform. Customers are always super happy to get hot food!"
    },
    {
      name: "Meera Nair",
      role: "Regional Hub Lead Chef, NCR",
      earnings: "₹31,000 Base + Performance",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      quote: "The automated convection machines do the hard work. I manage assembly, sanitation, and dietary quality parameters. There's a true path to management here—I started as a prep chef and now lead the full kitchen cohort."
    }
  ];

  // Simulated drag and drop file upload event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setMockFileUploaded({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB"
      });
    }
  };

  const triggerMockUpload = () => {
    // Select default PDF
    setMockFileUploaded({
      name: "Curriculum_Vitae_Professional_Rider.pdf",
      size: "340.5 KB"
    });
  };

  const filteredJobs = activeJobCategory === "all" 
    ? careersListingData 
    : careersListingData.filter(j => j.department === activeJobCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-16" id="careers-page-portal">
      
      {/* 1. HERO SECTION: BRANDING & CALL-TO-ACTION */}
      <section className="relative rounded-3xl overflow-hidden bg-[#1C1C1C] text-white shadow-2xl border border-slate-800">
        
        {/* Background Image with Dynamic Gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1590846083693-f23f80c55041?auto=format&fit=crop&w=1200&q=80" 
            alt="Delivery Captain on Road" 
            className="w-full h-full object-cover opacity-20 filter brightness-75 scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1C]/90 via-transparent to-[#1C1C1C]/95"></div>
        </div>

        {/* Content Box */}
        <div className="relative z-10 p-6 md:p-14 text-center space-y-6 max-w-4xl mx-auto select-none">
          
          <div className="inline-flex items-center gap-1.5 bg-[#FF4D2D]/10 border border-[#FF4D2D]/40 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase text-[#FF4D2D] tracking-widest leading-none">
            <Bike className="w-3.5 h-3.5 animate-bounce" />
            <span>SmartServe Recruitment Drive 2026</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white font-display uppercase">
            Drive with Pride. <br className="hidden md:block" />
            <span className="text-[#FF4D2D]">Earn on Your Own Terms</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            SmartServe connects chef-crafted cloud kitchens directly with train passengers in minutes. 
            Join our dedicated logistics brigade representing India's highest on-time delivery metric. 
            Enjoy <span className="text-[#FFD700] font-bold">weekly payouts</span>, zero commission deductions, and full life security shields.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setActiveFormTab("rider");
                document.getElementById("careers-application-form-element")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto bg-[#FF4D2D] hover:bg-[#E04122] text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-orange-600/20 hover:scale-[1.02] cursor-pointer"
            >
              Become a Delivery Partner
            </button>
            <button
              onClick={() => {
                setActiveFormTab("staff");
                document.getElementById("careers-jobs-board-element")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 hover:text-white font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Corporate & Kitchen Jobs</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFD700]" />
            </button>
          </div>

          {/* Core Live Fleet Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80 text-left max-w-3xl mx-auto">
            <div>
              <div className="text-xl md:text-2xl font-black text-white font-sans">1,250+</div>
              <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Active Captains</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-[#FFD700] font-sans">₹46,200</div>
              <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Peak Monthly Earn</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-white font-sans">₹1.4 Cr+</div>
              <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Weekly Disbursed</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-emerald-400 font-sans">99.4%</div>
              <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">On-Time Deliveries</div>
            </div>
          </div>

        </div>

      </section>

      {/* 2. BENEFITS & EARNINGS CALCULATOR CONTROLS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Rider Core Benefits Grid */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#FF4D2D] uppercase tracking-widest font-mono">Unmatched Fleet Lifestyle</span>
            <h2 className="text-2xl font-extrabold font-display uppercase tracking-tight text-[#1C1C1C]">
              Why deliver with SmartServe?
            </h2>
            <p className="text-xs text-slate-500">
              We respect your mileage, your vehicle fuel, and your hard-earned sweat. That’s why we represent India's gold standard driver ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF4D2D]"></div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF4D2D]">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-tight group-hover:text-[#FF4D2D] transition-colors">
                Instant Tuesday Payouts
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                No delayed cycles. We calculate orders up to Sunday midnight and run direct NEFT transfers directly to your Indian bank accounts by Tuesday 9 AM.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FFD700]"></div>
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-650">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-tight group-hover:text-yellow-600 transition-colors">
                Flexible Micro Shifts
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                Choose to sign up for lunch/dinner peak hours (3-hour slots) or secure guaranteed 8-hour daily slots with flat daily minimum pay.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-950">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-tight group-hover:text-slate-800 transition-colors">
                ₹3 Lakhs Medical Shield
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                Peace of mind on the roads. SmartServe covers 100% of all premium costs for accidental coverage and family hospital support systems from Day 1.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-tight group-hover:text-emerald-600 transition-colors">
                Free Convective Kit
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                We supply our high-vis windcheaters, premium insulated thermals, and safety helmets. Zero initial bag deposits are deducted from payouts.
              </p>
            </div>

          </div>

          {/* Sleek Step-by-Step Onboarding Process visualization */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
              Onboarding Process: Active in 30 minutes
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-150 space-y-1">
                <div className="w-6 h-6 rounded-full bg-[#FF4D2D]/10 text-[#FF4D2D] font-bold flex items-center justify-center text-[10px] mx-auto">1</div>
                <div className="font-bold uppercase text-[9px] tracking-tight">Register Bio</div>
                <div className="text-[9px] text-slate-400">Fill the digital form</div>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-150 space-y-1">
                <div className="w-6 h-6 rounded-full bg-[#FF4D2D]/10 text-[#FF4D2D] font-bold flex items-center justify-center text-[10px] mx-auto">2</div>
                <div className="font-bold uppercase text-[9px] tracking-tight">Post KYC</div>
                <div className="text-[9px] text-slate-400">Submit ID / DL photos</div>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-150 space-y-1">
                <div className="w-6 h-6 rounded-full bg-[#FF4D2D]/10 text-[#FF4D2D] font-bold flex items-center justify-center text-[10px] mx-auto">3</div>
                <div className="font-bold uppercase text-[9px] tracking-tight">Quick Brief</div>
                <div className="text-[9px] text-slate-400">10-min safety briefing</div>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-150 space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] mx-auto">4</div>
                <div className="font-bold uppercase text-[9px] tracking-tight">Go Live</div>
                <div className="text-[9px] text-emerald-600 font-bold">Collect Kit & Earn!</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Earnings Estimator */}
        <div className="lg:col-span-6 bg-[#161616] text-white border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          
          <div className="space-y-1 border-b border-slate-850 pb-4">
            <span className="bg-[#FF4D2D]/10 text-[#FF4D2D] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full font-mono">
              Live Income Planner v2.4
            </span>
            <h3 className="text-lg md:text-xl font-black font-display uppercase tracking-tight text-white pt-1">
              Estimate Your Weekly earnings
            </h3>
            <p className="text-[11px] text-slate-400">
              Pick your ride mode and anticipated schedule. Watch how dynamic surge milestones instantly trigger payout modifiers.
            </p>
          </div>

          {/* Vehicle Selector Tabs */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold">Choose Your Delivery Ride</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "bicycle", label: "Bicycle", rate: "₹30/order", icon: "🚲" },
                { type: "ev", label: "Electric/EV", rate: "₹40/order", icon: "⚡" },
                { type: "motorcycle", label: "Motorcycle", rate: "₹48/order", icon: "🏍️" }
              ].map((vehicle) => (
                <button
                  key={vehicle.type}
                  onClick={() => setVehicleType(vehicle.type as any)}
                  className={`p-3 rounded-xl border text-center transition-all ${vehicleType === vehicle.type ? "bg-[#FF4D2D]/10 border-[#FF4D2D] text-white" : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900"}`}
                >
                  <div className="text-base">{vehicle.icon}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide pt-1">{vehicle.label}</div>
                  <div className="text-[9px] text-[#FFD700] font-mono font-bold">{vehicle.rate}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Slider 1: Estimated daily deliveries */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">Deliveries Per Day</label>
              <span className="text-[11px] font-black font-mono text-[#FF4D2D] bg-[#FF4D2D]/15 px-2 py-0.5 rounded">
                {dailyDeliveries} Orders
              </span>
            </div>
            <input 
              type="range"
              min="5"
              max="35"
              step="1"
              value={dailyDeliveries}
              onChange={(e) => setDailyDeliveries(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF4D2D]"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
              <span>Part-Time standard (5)</span>
              <span>Pro Captain peak (35)</span>
            </div>
          </div>

          {/* Slider 2: Operating Days per Week */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">Working Days/Week</label>
              <span className="text-[11px] font-black font-mono text-slate-100 bg-slate-800 px-2 py-0.5 rounded">
                {daysPerWeek} Active Days
              </span>
            </div>
            <input 
              type="range"
              min="1"
              max="7"
              step="1"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FFFastPayout]"
              style={{ accentColor: "#FFD700" }}
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
              <span>Casual (1 day)</span>
              <span>Full Week (7 days)</span>
            </div>
          </div>

          {/* Dynamic calculations breakdown drawer */}
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-850 space-y-2.5 text-xs text-slate-300 font-mono">
            <div className="flex justify-between items-center text-[10px] border-b border-slate-800/80 pb-1.5 text-slate-400">
              <span>REVENUE MODIFIERS</span>
              <span>ESTIMATED SUM</span>
            </div>
            <div className="flex justify-between">
              <span>Base Pay ({weeklyDeliveries} orders × ₹{ratePerOrder})</span>
              <span className="text-white">₹{baseWeeklyPay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span className="flex items-center gap-1">
                <span>⚡ Active Peak Surge Bonus</span>
                {dailyDeliveries >= 18 ? (
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded">Qualified!</span>
                ) : (
                  <span className="text-[8px] text-slate-500">Need 18+ orders/day</span>
                )}
              </span>
              <span>+ ₹{dailySurgeBonus.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#FFD700]">
              <span className="flex items-center gap-1">
                <span>👑 Loyalty commitment Bonus</span>
                {daysPerWeek >= 6 ? (
                  <span className="text-[8px] bg-yellow-500/10 text-yellow-600 px-1 rounded">Super-Loyalty Tier</span>
                ) : daysPerWeek >= 5 ? (
                  <span className="text-[8px] bg-yellow-500/10 text-yellow-600 px-1 rounded">Tier 1 Qualified</span>
                ) : (
                  <span className="text-[8px] text-slate-500">Need 5+ days</span>
                )}
              </span>
              <span>+ ₹{loyaltyIncentive.toLocaleString()}</span>
            </div>
          </div>

          {/* Financial Totals */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-400 font-mono uppercase block">Weekly Settlement Pay</span>
              <strong className="text-xl md:text-2xl font-black text-emerald-400 font-mono block">
                ₹{totalWeeklyEarnings.toLocaleString()}/wk
              </strong>
            </div>

            <div className="text-right space-y-0.5">
              <span className="text-[9px] text-slate-400 font-mono uppercase block">Projected Monthly Yield</span>
              <span className="text-lg md:text-xl font-bold font-mono text-white block">
                ₹{projectedMonthlyEarnings.toLocaleString()}/mo
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* 3. LOCATION CHECK SYSTEM: VACANCY QUERY SEARCH */}
      <section className="bg-slate-950 text-white rounded-3xl p-6 md:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-[#FFD700] font-mono tracking-widest uppercase font-bold">Node Vacancy Locator</span>
            <h3 className="text-xl md:text-2xl font-black font-display uppercase tracking-tight text-white block">Check Rider Availability in Your City</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Our automated logistics system handles onboarding limits. Type your city below to instantly examine candidate list vacancies.
            </p>
          </div>

          <form onSubmit={handleLocationCheck} className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-grow">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Enter Kanpur, Varanasi, Lucknow, New Delhi, Bengaluru..."
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none focus:border-[#FF4D2D]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#FF4D2D] hover:bg-[#E04122] text-white px-5 py-3 rounded-xl flex items-center justify-center transition-transform hover:scale-102 font-bold text-xs uppercase cursor-pointer"
            >
              Check Slot
            </button>
          </form>

          {/* Availability Result Render */}
          <AnimatePresence mode="wait">
            {checkedCityResult ? (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="max-w-xl mx-auto p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider">{checkedCityResult.city} Node Grid</span>
                  <span className={`text-[9px] font-black font-mono uppercase tracking-wider px-2.5 py-0.5 rounded ${
                    checkedCityResult.color === "emerald" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    checkedCityResult.color === "orange" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                    checkedCityResult.color === "red" ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" :
                    "bg-slate-850 text-slate-400 border border-slate-700"
                  }`}>
                    {checkedCityResult.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-normal">
                  {checkedCityResult.message}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-3">
                  <div>
                    <span className="block text-slate-505 uppercase text-[8px] tracking-wider leading-none text-slate-500">Allocation Terminal:</span>
                    <span className="text-slate-200 mt-1 block font-sans font-bold">{checkedCityResult.hubs}</span>
                  </div>
                  <div>
                    <span className="block text-slate-505 uppercase text-[8px] tracking-wider leading-none text-slate-500">Node Onboarding Bonus:</span>
                    <span className="text-[#FFD700] mt-1 block font-sans font-bold">{checkedCityResult.bonus}</span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setRiderForm(prev => ({ ...prev, preferredCity: checkedCityResult.city }));
                      setStaffForm(prev => ({ ...prev, preferredCity: checkedCityResult.city }));
                      document.getElementById("careers-application-form-element")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[10px] hover:underline font-black text-[#FFD700] uppercase tracking-wider flex items-center justify-center gap-1 w-full"
                  >
                    <span>Proceed Application with pre-selected slot</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#FFD700]" />
                  </button>
                </div>

              </motion.div>
            ) : (
              <div className="text-center text-[10px] text-slate-500 font-mono italic">
                *Pro-Tip: Enter 'Delhi', 'Varanasi', or 'Bengaluru' to run automated route matching simulations.
              </div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* 4. CAREERS SECTION: OPEN CORPORATE & KITCHEN ROLES */}
      <section className="space-y-6" id="careers-jobs-board-element">
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#FF4D2D] uppercase tracking-widest font-mono">Join the Core Cohort</span>
            <h2 className="text-2xl font-extrabold font-display uppercase tracking-tight text-[#1C1C1C]">
              Open Careers & Positions
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              We recruit top culinary professionals, delivery riders, and software specialists to maintain continuous infrastructure stability.
            </p>
          </div>

          {/* Job Department Toggles */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-150 flex-wrap">
            {[
              { id: "all", label: "All Openings" },
              { id: "fleet", label: "Fleet Logistics" },
              { id: "kitchen", label: "Kitchen Ops" },
              { id: "hq", label: "HQ Tech" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveJobCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer ${activeJobCategory === cat.id ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Roles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div 
              key={job.title} 
              className="bg-white rounded-3xl border border-slate-150 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-4 group relative overflow-hidden"
            >
              {/* Badge Department background hint */}
              <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-20 h-20 rounded-full bg-slate-50 group-hover:scale-120 transition-transform pointer-events-none"></div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 uppercase font-display leading-tight group-hover:text-[#FF4D2D] transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {job.location}</span>
                      <span>•</span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded font-bold uppercase">{job.type}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                  {job.description}
                </p>

                {/* Sub perks checklist */}
                <div className="space-y-1.5 pt-1.5 border-t border-slate-50">
                  <span className="text-[9px] text-[#FF4D2D] uppercase font-mono font-bold tracking-wider block">Exclusive Benefits:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] font-sans text-slate-500">
                    {job.perks.map((p, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom apply trigger button bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 relative z-10 flex-wrap gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  Salary Range: <strong className="text-slate-800 font-bold font-sans">{job.salary.split(" + ")[0]}</strong>
                </span>

                <button
                  onClick={() => {
                    if (job.department === "fleet") {
                      setActiveFormTab("rider");
                      setRiderForm(prev => ({
                        ...prev,
                        riderVehicle: "motorcycle",
                        preferredCity: job.location.split(",")[0]
                      }));
                    } else {
                      setActiveFormTab("staff");
                      setStaffForm(prev => ({
                        ...prev,
                        appliedRole: job.title,
                        preferredCity: job.location.split(",")[0]
                      }));
                    }
                    document.getElementById("careers-application-form-element")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-slate-900 group-hover:bg-[#FF4D2D] text-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  Apply Spots
                </button>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* 5. HIGH-CONVERTING DUAL-TAB APPLICATION PROCESS & RECRUIT QUEUE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="careers-application-form-element">
        
        {/* Core Application Form Card (Left Large) */}
        <div className="lg:col-span-8 bg-white border border-slate-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          
          <div className="space-y-2 border-b border-slate-150 pb-4">
            <span className="text-[10px] text-[#FF4D2D] font-mono tracking-widest uppercase font-bold leading-none block">Online Entry Portal</span>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-black font-display uppercase tracking-tight text-[#1C1C1C]">
                Submit Candidate application
              </h3>

              {/* Form Option Segment Toggles */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-150 shrink-0">
                <button
                  onClick={() => {
                    setActiveFormTab("rider");
                    setSuccessMsg("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${activeFormTab === "rider" ? "bg-slate-900 text-white shadow font-black" : "text-slate-500 hover:text-slate-800"}`}
                >
                  <Bike className="w-3 h-3" />
                  <span>Rider Captain</span>
                </button>
                <button
                  onClick={() => {
                    setActiveFormTab("staff");
                    setSuccessMsg("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${activeFormTab === "staff" ? "bg-slate-900 text-white shadow font-black" : "text-slate-500 hover:text-slate-800"}`}
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Staff / Corporate</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              {activeFormTab === "rider" 
                ? "Become an in-house delivery rider partner with direct bank settlement options." 
                : "Submit structured curriculum information to join our kitchen networks and regional hubs."
              }
            </p>
          </div>

          {/* Success Notification Alert */}
          {successMsg && (
            <motion.div 
              id="submission-feedback-focus"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-emerald-50 text-emerald-800 border-2 border-emerald-300 rounded-2xl flex items-start gap-2.5 leading-relaxed text-xs"
            >
              <CheckCircle className="text-emerald-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block uppercase text-[10px] tracking-wider text-emerald-950">Application Stream Saved Successfully</strong>
                <span className="pt-0.5 block text-[11px] font-sans font-medium text-emerald-700">{successMsg}</span>
              </div>
            </motion.div>
          )}

          {/* Switchable Dual Forms rendering */}
          {activeFormTab === "rider" ? (
            
            // Rider onboarding form
            <form onSubmit={handleRiderSubmit} className="space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Candidate Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Aditya Kushwaha"
                    value={riderForm.candidateName}
                    onChange={(e) => setRiderForm({ ...riderForm, candidateName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={riderForm.candidatePhone}
                    onChange={(e) => setRiderForm({ ...riderForm, candidatePhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vikram.kushwaha@gmail.com"
                    value={riderForm.candidateEmail}
                    onChange={(e) => setRiderForm({ ...riderForm, candidateEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Own Delivery Vehicle</label>
                  <select
                    value={riderForm.riderVehicle}
                    onChange={(e) => setRiderForm({ ...riderForm, riderVehicle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D] transition-colors"
                  >
                    <option value="motorcycle">Motorcycle / Scooty (Petrol)</option>
                    <option value="ev">Electric Scooter (EV)</option>
                    <option value="bicycle">Bicycle (Cyclist Mode)</option>
                    <option value="none">No vehicle (Request EV rental plan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Preferred Operating City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kanpur, New Delhi"
                    value={riderForm.preferredCity}
                    onChange={(e) => setRiderForm({ ...riderForm, preferredCity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Driving License Number</label>
                  <input
                    type="text"
                    placeholder="DL-XXXXXX (Leave empty if Cycle/Rental)"
                    value={riderForm.licenseNumber}
                    onChange={(e) => setRiderForm({ ...riderForm, licenseNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Prior Delivery Experience</label>
                <select
                  value={riderForm.experienceYears}
                  onChange={(e) => setRiderForm({ ...riderForm, experienceYears: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D] transition-colors"
                >
                  <option value="0">Fresher / Zero active delivery background</option>
                  <option value="1">Under 1 Year delivering at other food apps</option>
                  <option value="2">2+ Years seasoned fleet captain</option>
                  <option value="5">5+ Years expert route logistics lead</option>
                </select>
              </div>

              {/* Drag Drop Mock file Area for Rider License Copy */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider block">Submit License Copy or Identity File</label>
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragOver ? "bg-[#FF4D2D]/5 border-[#FF4D2D]" : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    {mockFileUploaded ? (
                      <div className="text-xs text-slate-800 font-semibold space-y-1">
                        <p className="text-emerald-600 flex items-center justify-center gap-1 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> File Selected: {mockFileUploaded.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">Document Size: {mockFileUploaded.size}</p>
                      </div>
                    ) : (
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-slate-700">Drag & drop your files here or select options</p>
                        <p className="text-[10px] text-slate-400">PDF, JPG or PNG format. Max file limit 5MB.</p>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={triggerMockUpload}
                        className="py-1 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer"
                      >
                        Auto-upload Mock DL Card
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#FF4D2D] hover:bg-[#E04122] text-white font-black py-3 rounded-xl transition-all uppercase tracking-wider shadow-md shadow-orange-500/10 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submitting ? "Uploading file..." : "Transmit Captain Onboarding dossier"}</span>
              </button>

            </form>

          ) : (
            
            // Staff / Corporate Application
            <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shalini Roy Chowdary"
                    value={staffForm.candidateName}
                    onChange={(e) => setStaffForm({ ...staffForm, candidateName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9110022334"
                    value={staffForm.candidatePhone}
                    onChange={(e) => setStaffForm({ ...staffForm, candidatePhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Professional Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. shalini.roy@gmail.com"
                    value={staffForm.candidateEmail}
                    onChange={(e) => setStaffForm({ ...staffForm, candidateEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Role Applying For</label>
                  <select
                    value={staffForm.appliedRole}
                    onChange={(e) => setStaffForm({ ...staffForm, appliedRole: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D]"
                  >
                    <option value="Pizza Convection Specialist / Chef">Pizza Convection Specialist / Chef</option>
                    <option value="Franchise Hub Terminal Manager">Franchise Hub Terminal Manager</option>
                    <option value="Regional Fleet Dispatch Architect">Regional Fleet Dispatch Architect</option>
                    <option value="Database Reliability Engineer (DRE)">Database Reliability Engineer (DRE)</option>
                    <option value="Kitchen Prep Cohort Staff">Kitchen Prep Cohort Staff</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Preferred Employment Station</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Delhi CP, Kanpur Central"
                    value={staffForm.preferredCity}
                    onChange={(e) => setStaffForm({ ...staffForm, preferredCity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Years of Food/Tech Experience</label>
                  <select
                    value={staffForm.experienceYears}
                    onChange={(e) => setStaffForm({ ...staffForm, experienceYears: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 font-medium outline-none focus:border-[#FF4D2D]"
                  >
                    <option value="0">Fresher / Career Shift</option>
                    <option value="1">1 Year active hospitality/tech role</option>
                    <option value="2">2 to 4 Years professional staff</option>
                    <option value="5">5+ Years expert crew controller</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider text-slate-450 block">Brief Cover Message / Qualifications info</label>
                <textarea
                  placeholder="Tell us about your culinary background, technical stack proficiency, or specific shifts availability."
                  value={staffForm.coverLetter}
                  onChange={(e) => setStaffForm({ ...staffForm, coverLetter: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-slate-800 outline-none focus:border-[#FF4D2D] min-h-[70px] font-sans"
                />
              </div>

              {/* Drag Drop Mock file Area for Staff PDF */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 font-mono tracking-wider block">Upload CV / Curriculum Vitae Document</label>
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragOver ? "bg-[#FF4D2D]/5 border-[#FF4D2D]" : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-250 bg-slate-200 flex items-center justify-center text-slate-500 mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    {mockFileUploaded ? (
                      <div className="text-xs text-slate-800 font-semibold space-y-1">
                        <p className="text-emerald-600 flex items-center justify-center gap-1 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> File Selected: {mockFileUploaded.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">Dossier Size: {mockFileUploaded.size}</p>
                      </div>
                    ) : (
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-slate-700">Drag & drop your files here or select options</p>
                        <p className="text-[10px] text-slate-400">PDF, DOCX, or high-res image. Max limit 5MB.</p>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={triggerMockUpload}
                        className="py-1 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer"
                      >
                        Auto-attach Professional CV
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1C1C1C] hover:bg-slate-800 text-white font-black py-3 rounded-xl transition-all uppercase tracking-wider hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#FFD700]" />
                <span>{submitting ? "Uploading profile..." : "Transmit Professional dossier files"}</span>
              </button>

            </form>

          )}

        </div>

        {/* Live Recruiting queue roster (Right Small) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#1C1C1C] text-white p-6 rounded-3xl space-y-4 shadow-md relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF4D2D]/5 rounded-full blur-2xl"></div>
            
            <div className="space-y-1 flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-[9px] text-[#FFD700] font-mono tracking-widest uppercase font-bold leading-none">System Database Feed</div>
                <h3 className="text-sm font-black font-display uppercase tracking-tight text-white block pt-1">Active Candidate Streams</h3>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            {/* Render real data from server */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {applicantHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-550 text-slate-500 font-mono text-[10px] space-y-1">
                  <div>No candidate logs flagged in the current network cycle.</div>
                  <div className="text-slate-600">Be the first to submit your files above!</div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {applicantHistory.map((ap, i) => (
                    <motion.div 
                      key={ap.id || i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-slate-200 block truncate max-w-[150px] font-bold">{ap.candidateName}</strong>
                        <span className="text-[8px] font-mono font-bold bg-[#FF4D2D]/10 text-[#FF4D2D] px-1.5 py-0.5 rounded border border-[#FF4D2D]/20 uppercase">
                          KYC PENDING
                        </span>
                      </div>

                      <div className="space-y-1 font-mono text-[9px] text-slate-400 border-t border-slate-850 pt-1.5 leading-snug">
                        <div className="text-slate-300">Role: <span className="text-white font-bold">{ap.appliedRole}</span></div>
                        <div>Candidate refID: <span className="text-[#FFD700]">{ap.id}</span></div>
                        <div>Experience Index: <span className="text-[#FF4D2D] font-bold">{ap.experienceYears} Years</span></div>
                        {ap.createdAt && (
                          <div className="text-slate-500">Indexed Time: {new Date(ap.createdAt).toLocaleTimeString()}</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-center border-t border-slate-800">
              <span className="text-[9px] text-slate-500 font-mono">
                Security clearance protocol: SSL-AES256 Encrypted
              </span>
            </div>

          </div>

          {/* Testimonial slider cohort */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 space-y-4">
            <span className="text-[9px] font-black text-[#FF4D2D] uppercase tracking-wider font-mono">Captain Testimonials</span>
            
            <div className="space-y-3.5">
              <p className="text-xs text-slate-600 italic leading-relaxed text-left">
                "{riderReviews[testimonialIdx].quote}"
              </p>

              <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                <img 
                  src={riderReviews[testimonialIdx].image} 
                  alt={riderReviews[testimonialIdx].name} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h5 className="text-xs font-black text-slate-900 leading-tight block">{riderReviews[testimonialIdx].name}</h5>
                  <span className="text-[9px] text-slate-400 font-mono block">{riderReviews[testimonialIdx].role}</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl text-[9px] font-mono">
                <span className="text-slate-400">Verified earning tier:</span>
                <strong className="text-emerald-600 font-bold">{riderReviews[testimonialIdx].earnings}</strong>
              </div>

              {/* Toggle indicators */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg justify-center w-max mx-auto">
                {riderReviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${testimonialIdx === i ? "w-6 bg-[#FF4D2D]" : "w-2 bg-slate-350 hover:bg-slate-400 bg-slate-300"}`}
                  ></button>
                ))}
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* 6. ADDITIONAL INCENTIVE HIGHLIGHTERS MARQUEE CHINESE CARDS */}
      <section className="bg-slate-50 border border-slate-150 rounded-3xl p-6 md:p-8 space-y-6">
        
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black text-[#FF4D2D] uppercase tracking-widest font-mono">Leaderboard Perks</span>
          <h3 className="text-lg md:text-xl font-extrabold font-display uppercase tracking-tight text-[#1C1C1C]">
            SmartServe Extra Incentive Grid
          </h3>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Take home dynamic cash modifiers by accomplishing milestones on India’s festive and high-volume cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-left">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-2">
            <span className="text-lg">🏕️</span>
            <h4 className="font-bold text-slate-900 uppercase">Monsoon Monsoon Shield Pay</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Earn an additional ₹15 extra reward premium on every delivery executed during active rain alerts. Full protective water seals and premium rain-armor provided.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-2">
            <span className="text-lg">🎉</span>
            <h4 className="font-bold text-slate-900 uppercase">Festive Route Multiplication</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              During major railway rush schedules (Diwali, Holi, Rakhi spikes), enjoy up to 1.5x commission payouts across priority high-demand passenger compartments.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-2">
            <span className="text-lg">🤝</span>
            <h4 className="font-bold text-slate-900 uppercase">Interactive Referral Dividend</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Onboard a driver friend from your local district and claim ₹2,000 flat reward as soon as they log their initial 30 successful deliveries on the map.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}
