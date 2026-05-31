import React from "react";
import { motion } from "motion/react";

export default function FranchiseAdminDashboard() {
  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-green-500 via-teal-600 to-blue-500 rounded-xl shadow-2xl backdrop-blur-lg min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <h1 className="text-4xl font-bold text-white mb-6">Franchise Admin Dashboard</h1>
      <p className="text-lg text-white">
        Welcome, Franchise Admin! You have access only to your assigned franchise.
      </p>
      {/* TODO: Add franchise‑specific cards, tables, and analytics */}
    </motion.div>
  );
}
