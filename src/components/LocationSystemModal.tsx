import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Navigation, Search, Check, AlertCircle, ChefHat, Map, Keyboard, X } from "lucide-react";
import { Franchise } from "../types";

// Earth's radius in km for Haversine distance computations
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Preset landmarks database for high-fidelity offline/interactive suggestions
interface LocationPreset {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

const PRESET_LANDMARKS: LocationPreset[] = [
  {
    name: "Connaught Place",
    address: "Regal Building, Connaught Circus, New Delhi - 110001",
    lat: 28.6299,
    lng: 77.2183,
  },
  {
    name: "Rajiv Chowk Metro Station",
    address: "Under Connaught Place Inner-Circle, New Delhi - 110001",
    lat: 28.6328,
    lng: 77.2195,
  },
  {
    name: "DLF Cyber City",
    address: "Phase 3, Sector 24, Gurugram, Haryana - 122002",
    lat: 28.4950,
    lng: 77.0878,
  },
  {
    name: "Sector 62 Noida Stellar IT Park",
    address: "C-25, Stellar IT Park, Sector 62, Noida, UP - 201301",
    lat: 28.6273,
    lng: 77.3725,
  },
  {
    name: "Sector 62 Noida Metro Station",
    address: "Sector 62 Crossing, Noida, UP - 201301",
    lat: 28.6231,
    lng: 77.3712,
  },
  {
    name: "Kanpur Central Railway Station",
    address: "Cantonment Area, Kanpur, Uttar Pradesh - 208004",
    lat: 26.4674,
    lng: 80.3497,
  },
  {
    name: "IIT Kanpur Campus",
    address: "Kalyanpur, Kanpur, Uttar Pradesh - 208016",
    lat: 26.5123,
    lng: 80.2329,
  },
  {
    name: "Sector 18 Noida Market",
    address: "Pocket E, Sector 18, Noida, UP - 201301",
    lat: 28.5708,
    lng: 77.3261,
  },
  {
    name: "Gurgaon IFFCO Chowk",
    address: "Sector 29, Gurugram, Haryana - 122001",
    lat: 28.4722,
    lng: 77.0725,
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  franchises: Franchise[];
  onLocationSelected: (address: string, lat: number, lng: number, branchCode: string) => void;
}

export default function LocationSystemModal({
  isOpen,
  onClose,
  franchises,
  onLocationSelected,
}: Props) {
  const [step, setStep] = useState<"ask" | "manual">("ask");
  const [searchQuery, setSearchQuery] = useState("");
  const [googleSuggestions, setGoogleSuggestions] = useState<any[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // OSM Nominatim is used as a fully open-source, key-less search and reverse geocoding replacement
  const isGmpAvailable = false; // Google Maps removed successfully

  // Query OpenStreetMap Nominatim for real-time address recommendations
  useEffect(() => {
    if (!searchQuery.trim()) {
      setGoogleSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      // Call public and free Nominatim autocomplete search services restricted to India
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=6&addressdetails=1&countrycodes=in`;
      
      fetch(url, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "SmartServe-OS-App"
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Nominatim request error");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setGoogleSuggestions(
              data.map((item: any) => {
                const parts = item.display_name.split(",");
                const mainName = parts[0] || "Unknown Landmark";
                const addressText = parts.slice(1).join(",").trim() || item.display_name;
                return {
                  name: mainName,
                  address: addressText,
                  lat: parseFloat(item.lat),
                  lng: parseFloat(item.lon),
                  isGmp: false,
                };
              })
            );
          } else {
            fallbackPresetsFilter();
          }
        })
        .catch((err) => {
          console.warn("Nominatim autocomplete failed, falling back to presets", err);
          fallbackPresetsFilter();
        });
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fallbackPresetsFilter = () => {
    const q = searchQuery.toLowerCase();
    const filtered = PRESET_LANDMARKS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q)
    ).map((l) => ({
      name: l.name,
      address: l.address,
      lat: l.lat,
      lng: l.lng,
      isGmp: false,
    }));
    setGoogleSuggestions(filtered);
  };

  // Convert latitude/longitude to nearest franchise & complete selected action
  const processCoordinates = (lat: number, lng: number, customAddress?: string) => {
    // 1. Calculate the closest landmark name for human reference if no address provided
    let derivedAddress = customAddress;
    if (!derivedAddress) {
      let minLandDistance = Infinity;
      let closestLandmark = PRESET_LANDMARKS[0];
      for (const item of PRESET_LANDMARKS) {
        const d = getDistance(lat, lng, item.lat, item.lng);
        if (d < minLandDistance) {
          minLandDistance = d;
          closestLandmark = item;
        }
      }
      derivedAddress = `Near ${closestLandmark.name}, ${closestLandmark.address}`;
    }

    // 2. Identify nearest cooking cloud kitchen branch from franchises database
    let selectBranch = franchises[0] || { code: "DEL-CP", name: "SmartServe Connaught Place", latitude: 28.6299, longitude: 77.2183 };
    let minKitchenDistance = Infinity;
    
    if (franchises.length > 0) {
      for (const f of franchises) {
        if (!f.isActive) continue;
        const dist = getDistance(lat, lng, f.latitude, f.longitude);
        if (dist < minKitchenDistance) {
          minKitchenDistance = dist;
          selectBranch = f;
        }
      }
    }

    // 3. Set visual animation confirmation for 2s then submit state
    setSuccessInfo(`Selected ${selectBranch.name} (${Math.round(minKitchenDistance)}km away)`);
    
    setTimeout(() => {
      // Save state to localStorage immediately
      localStorage.setItem("ss_user_latitude", lat.toString());
      localStorage.setItem("ss_user_longitude", lng.toString());
      localStorage.setItem("ss_user_address", derivedAddress!);
      localStorage.setItem("ss_selected_branch_code", selectBranch.code);

      onLocationSelected(derivedAddress!, lat, lng, selectBranch.code);
      setSuccessInfo(null);
      setErrorMsg("");
      setIsDetecting(false);
      onClose();
    }, 1800);
  };

  // Geolocation detector engine
  const handleDetectLocation = () => {
    setIsDetecting(true);
    setErrorMsg("");

    if (!navigator.geolocation) {
      setErrorMsg("Browser does not support secure geolocation services.");
      setIsDetecting(false);
      setStep("manual"); // Auto show manual input
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`;
        
        fetch(reverseUrl, {
          headers: {
            "User-Agent": "SmartServe-OS-App"
          }
        })
          .then((res) => {
            if (!res.ok) throw new Error("OSM Geocoder Error");
            return res.json();
          })
          .then((data) => {
            if (data && data.display_name) {
              processCoordinates(latitude, longitude, data.display_name);
            } else {
              processCoordinates(latitude, longitude);
            }
          })
          .catch((err) => {
            console.warn("OSM Reverse geocoder missed, using coordinates:", err);
            processCoordinates(latitude, longitude);
          });
      },
      (error) => {
        console.warn("Geolocation permission error / timeout:", error);
        setErrorMsg("Location access was denied or timed out. Please type your address manually.");
        setIsDetecting(false);
        // Switch view automatically
        setStep("manual");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle selected item prediction click
  const handleItemSelect = (item: any) => {
    processCoordinates(item.lat || 28.6299, item.lng || 77.2183, item.address);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950 bg-opacity-70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === "ask" ? (
          <motion.div
            key="ask-step"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-800 flex flex-col justify-between"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="text-[10px] font-mono tracking-wider font-black text-emerald-600 uppercase">
                    SmartServe Delivery-First Radar
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Visual Core Pin illustration */}
              <div className="flex flex-col items-center justify-center text-center py-7 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                  <MapPin className="w-8 h-8 animate-bounce text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-tight">
                    Select Your Delivery Address
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-normal max-w-[280px] mx-auto">
                    We deliver fresh, gourmet food to train berths, office hubs, and homes. Let's auto-select your nearest cloud kitchen branch automatically.
                  </p>
                </div>
              </div>

              {successInfo && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] rounded-lg p-3 flex items-center gap-2 font-mono justify-center animate-pulse">
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span><strong>{successInfo}</strong></span>
                </div>
              )}

              {errorMsg && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] rounded-lg p-3 flex items-center gap-2 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* CTA Option Buttons */}
            <div className="space-y-2 mt-4 text-xs font-semibold">
              <button
                onClick={handleDetectLocation}
                disabled={isDetecting || !!successInfo}
                className="w-full bg-primary hover:bg-primary-hover text-white font-mono text-[10px] font-black uppercase py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-orange-300"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetecting ? "animate-spin" : ""}`} />
                <span>{isDetecting ? "Detecting Live GPS Location..." : "Detect Live GPS Location"}</span>
              </button>

              <button
                onClick={() => setStep("manual")}
                disabled={!!successInfo}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-black uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>No, Search Address Manually</span>
              </button>

              <button
                onClick={() => {
                  processCoordinates(28.6299, 77.2183, "Regal Building, Connaught Circus, New Delhi - 110001");
                }}
                disabled={!!successInfo}
                className="w-full text-center text-[9px] font-bold text-slate-400 hover:text-slate-600 font-mono block pt-1.5 transition-colors"
                id="location-bypass-default"
              >
                Bypass using Default (Connaught Place Hub)
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="manual-step"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-5 text-slate-800 flex flex-col justify-between"
          >
            <div>
              {/* Header manually */}
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep("ask")}
                    className="text-[10px] uppercase font-mono font-bold text-slate-400 hover:text-slate-700 hover:underline"
                  >
                    ← Back
                  </button>
                  <span className="text-[10px] font-mono tracking-wider font-extrabold text-indigo-600 uppercase">
                    Manual Search
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* API and Instructions Banner */}
              <div className="p-2 bg-slate-50 border rounded-lg text-[9px] font-mono text-slate-500 flex items-center justify-between gap-2 mt-3 leading-tight">
                <div>
                  <strong className="text-slate-700 font-bold block uppercase text-[8px] mb-0.5">
                    {isGmpAvailable ? "Google Maps Connected ✓" : "Offline Simulation Active"}
                  </strong>
                  <span>
                    {isGmpAvailable
                      ? "Using real-time live Google Places predictions."
                      : "Type keywords like 'Connaught Place', 'Noida Sec 62', 'Kanpur Junction' for rich offline suggestions."}
                  </span>
                </div>
                <Map className="w-8 h-8 text-slate-350 shrink-0 text-slate-400" />
              </div>

              {/* Inputs search container */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type area, town, sector, or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 pl-10 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                  autoFocus
                />
              </div>

              {successInfo && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] rounded-lg p-3 flex items-center gap-2 font-mono justify-center animate-pulse mt-3">
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>{successInfo}</span>
                </div>
              )}

              {/* Suggestions items viewport list */}
              <div className="mt-3 space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {googleSuggestions.length > 0 ? (
                  googleSuggestions.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleItemSelect(item)}
                      className="p-2.5 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 hover:bg-opacity-40 transition-all cursor-pointer flex items-start gap-2.5 text-left"
                    >
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="text-xs min-w-0">
                        <strong className="text-slate-800 font-bold block truncate">
                          {item.name}
                        </strong>
                        <span className="text-[10px] text-slate-500 truncate block leading-normal">
                          {item.address}
                        </span>
                      </div>
                    </div>
                  ))
                ) : searchQuery.trim() ? (
                  <div className="text-center py-6 text-slate-400 font-mono text-[10px]">
                    No matched landmarks found. Type 'Noida 62' or 'Connaught'.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block pl-1">
                      Popular Landmark Hotspots
                    </span>
                    {PRESET_LANDMARKS.slice(0, 4).map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleItemSelect({ address: p.address, lat: p.lat, lng: p.lng, name: p.name, isGmp: false })}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 group border border-transparent hover:border-indigo-100 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                          <span className="text-xs text-slate-700 font-medium">{p.name}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 group-hover:text-indigo-600">
                          Deploy Point →
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
