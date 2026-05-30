import React, { useState } from "react";
import { MenuItem, CartItem } from "../types";
import { X, Check } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

const ToppingsPool = [
  { name: "Extra Mozzarella Cheese", price: 60, id: "top_cheese" },
  { name: "Charred Tandoori Paneer Cubes", price: 50, id: "top_paneer" },
  { name: "Pickled Jalapeno Peppers", price: 30, id: "top_jalapeno" },
  { name: "Spicy Red Bell Pepper Rings", price: 30, id: "top_bell" },
  { name: "Sautéed Baby Corn Coins", price: 40, id: "top_corn" }
];

export default function AddCustomizationModal({ item, onClose, onAddToCart }: Props) {
  const [selectedSize, setSelectedSize] = useState<"Regular" | "Medium" | "Large" | "Double Patty" | "Single Patty">(
    item.category === "Burger" ? "Single Patty" : "Regular"
  );
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [jainPrepWanted, setJainPrepWanted] = useState(false);

  // Calculate customized final item pricing
  const sizeSurcharges = {
    Regular: 0,
    Medium: 90,
    Large: 160,
    "Single Patty": 0,
    "Double Patty": 50
  };

  const toppingChargesSum = selectedToppings.reduce((acc, curr) => {
    const matched = ToppingsPool.find((t) => t.name === curr);
    return acc + (matched ? matched.price : 0);
  }, 0);

  const finalUnitPrice = item.price + sizeSurcharges[selectedSize] + toppingChargesSum;

  const handleToggleTopping = (toppingName: string) => {
    if (selectedToppings.includes(toppingName)) {
      setSelectedToppings(selectedToppings.filter((t) => t !== toppingName));
    } else {
      setSelectedToppings([...selectedToppings, toppingName]);
    }
  };

  const handleConfirmAdd = () => {
    const finalProductItem: CartItem = {
      id: `${item.id}-${selectedSize}-${selectedToppings.sort().join("_")}-${jainPrepWanted ? "jain" : "std"}`,
      menuId: item.id,
      name: item.name,
      price: finalUnitPrice,
      qty: 1,
      size: selectedSize,
      toppings: selectedToppings,
      category: item.category,
      isVeg: item.isVeg,
      image: item.image,
      crust: item.category === "Pizza" ? "Fresh Cloud Signature Crumb" : undefined
    };

    onAddToCart(finalProductItem);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-800"
      >
        {/* Banner with header info */}
        <div className="relative h-44 bg-slate-100">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end p-4">
            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide text-white ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`}>
                {item.isVeg ? "Vegi Green" : "Non Veg"}
              </span>
              <h3 className="text-white text-lg font-bold font-sans mt-1 shadow-sm leading-tight">{item.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white bg-opacity-80 p-2 rounded-full hover:bg-white text-slate-800 shadow-lg outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configurations content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[380px] custom-scrollbar">
          
          {/* Sizing Toggles */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              {item.category === "Burger" ? "Patty Count Configuration" : "Standard Crust Size"}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {item.category === "Burger" ? (
                <>
                  <button
                    onClick={() => setSelectedSize("Single Patty")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 ${selectedSize === "Single Patty" ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "border-slate-200 text-slate-600"}`}
                  >
                    <span>Single Patty</span>
                    <span className="text-[10px] text-slate-400">Included</span>
                  </button>
                  <button
                    onClick={() => setSelectedSize("Double Patty")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 ${selectedSize === "Double Patty" ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "border-slate-200 text-slate-600"}`}
                  >
                    <span>Double Patty</span>
                    <span className="text-[10px] text-emerald-600 font-bold">+₹50</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedSize("Regular")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center ${selectedSize === "Regular" ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold" : "border-slate-200 text-slate-600"}`}
                  >
                    <span>Regular (8")</span>
                    <span className="text-[9px] text-slate-400 mt-1">Base Price</span>
                  </button>
                  <button
                    onClick={() => setSelectedSize("Medium")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center ${selectedSize === "Medium" ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold" : "border-slate-200 text-slate-600"}`}
                  >
                    <span>Medium (10")</span>
                    <span className="text-[9px] text-emerald-600 font-bold mt-1">+₹90</span>
                  </button>
                  <button
                    onClick={() => setSelectedSize("Large")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center ${selectedSize === "Large" ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold" : "border-slate-200 text-slate-600"}`}
                  >
                    <span>Large (12")</span>
                    <span className="text-[9px] text-emerald-600 font-bold mt-1">+₹160</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Premium Toppings */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Premium Fresh Toppings Add-Ons
            </h4>
            <div className="space-y-1.5">
              {ToppingsPool.map((t) => {
                const isChecked = selectedToppings.includes(t.name);
                return (
                  <button
                    key={t.id}
                    onClick={() => handleToggleTopping(t.name)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors ${isChecked ? "bg-slate-50 border-slate-400 font-medium text-slate-900" : "border-slate-100 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 object-contain h-4 rounded flex items-center justify-center border ${isChecked ? "bg-slate-800 border-slate-800 text-white" : "border-slate-300 bg-white"}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span>{t.name}</span>
                    </div>
                    <span className="text-slate-500 font-bold font-mono">+₹{t.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jain Option Checklist */}
          {item.isJain && (
            <div className="flex items-center justify-between bg-emerald-50 bg-opacity-50 p-3 rounded-xl border border-emerald-200 border-opacity-40">
              <div>
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                  Jain Friendly Prep Option Available!
                </span>
                <p className="text-[10px] text-emerald-600 mt-0.5 leading-tight">
                  No garlic, onions, or underground root ingredients guaranteed.
                </p>
              </div>
              <button
                onClick={() => setJainPrepWanted(!jainPrepWanted)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${jainPrepWanted ? "bg-emerald-600 text-white" : "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100"}`}
              >
                {jainPrepWanted ? "Enabled ✓" : "Enable Jain"}
              </button>
            </div>
          )}

        </div>

        {/* Footer Checkout Summary */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Final Item Price</span>
            <span className="text-2xl font-black text-slate-800 font-mono">₹{finalUnitPrice}</span>
          </div>
          <button
            onClick={handleConfirmAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg transition-colors flex items-center gap-2 text-sm"
          >
            <span>Confirm Add</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
