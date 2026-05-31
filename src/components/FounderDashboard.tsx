import React from "react";
import { motion } from "motion/react";

export default function FounderDashboard() {
  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-500 rounded-xl shadow-2xl backdrop-blur-lg min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <h1 className="text-4xl font-bold text-white mb-6">Founder Dashboard</h1>
      <p className="text-lg text-white">
        Welcome, Super Admin! You have full access to all franchises, orders, analytics, and staff management.
      </p>
      {/* TODO: Add premium charts, counters, and navigation links */}
    </motion.div>
  );
}
