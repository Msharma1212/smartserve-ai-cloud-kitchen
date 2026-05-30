import React, { useState } from "react";
import { Employee } from "../types";
import { ClipboardList, CheckCircle2, User, Zap, RefreshCw, LogIn, LogOut } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  employeesList: Employee[];
  onPunchShift: (empId: string, checkedIn: boolean) => void;
}

export default function EnterpriseEmployee({ employeesList, onPunchShift }: Props) {
  const [typedEmpId, setTypedEmpId] = useState("");
  const [notifSuccess, setNotifSuccess] = useState("");

  const handlePunch = async (checkedIn: boolean) => {
    if (!typedEmpId.trim()) {
      alert("Please provide your Employee ID card number.");
      return;
    }
    const emp = employeesList.find((e) => e.id === typedEmpId.trim());
    if (!emp) {
      alert(`ID token '${typedEmpId}' is not registered in our PostgreSQL staff records directory.`);
      return;
    }

    try {
      const res = await fetch("/api/staff/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empId: typedEmpId.trim(), checkedIn })
      });
      if (res.ok) {
        onPunchShift(typedEmpId.trim(), checkedIn);
        setNotifSuccess(`Time clock punch registered! Employee' ${emp.name}' successfully logged as ${checkedIn ? "Checked In" : "Checked Out"}.`);
        setTypedEmpId("");
        setTimeout(() => setNotifSuccess(""), 4000);
      }
    } catch (e) {
      alert("Error writing punch to ledger database.");
    }
  };

  return (
    <div className="space-y-6 py-4 text-slate-800" id="employee-operations-dashboard">
      
      {/* 1. Header description info */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 text-center space-y-3">
        <div className="w-11 h-11 bg-indigo-500 bg-opacity-20 border border-indigo-505 rounded-full flex items-center justify-center text-indigo-400 mx-auto text-lg animate-pulse">
          👨‍💻
        </div>
        <h2 className="text-xl font-bold uppercase tracking-tight">Terminal Shift Logs & Attendance Console</h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          SmartServe staff management grid. Punch in daily shifts, review accumulated gross base salaries, and view real-time PostgreSQL ledger logs.
        </p>
      </section>

      {/* 2. Primary split: Clock punching & attendance overview tables */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Punch Card input on left */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono block border-b pb-2">Shift Clock Terminal</span>
          
          {notifSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-250 text-xs font-bold rounded-lg leading-normal">
              {notifSuccess}
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">Slide or Input Employee ID</label>
              <input
                type="text"
                placeholder="e.g. emp201, emp301, emp101"
                value={typedEmpId}
                onChange={(e) => setTypedEmpId(e.target.value)}
                className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs font-mono font-bold tracking-widest outline-none focus:border-slate-450"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handlePunch(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[9.5px] font-extrabold uppercase py-2.5 rounded-lg transition-transform flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Punch Check-In</span>
              </button>
              <button
                onClick={() => handlePunch(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-mono text-[9.5px] font-extrabold uppercase py-2.5 rounded-lg transition-transform flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Punch Check-Out</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t text-[10px] text-slate-400 leading-normal space-y-1">
            <span>Demo cards ID registry list:</span>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-slate-700 font-bold">
              <div>emp101 (Balakraj)</div>
              <div>emp102 (Mayank)</div>
              <div>emp201 (Chef Ramesh)</div>
              <div>emp301 (Rider Rahul)</div>
            </div>
          </div>
        </div>

        {/* Attendance listings table on right */}
        <div className="md:col-span-8 bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono block border-b pb-2">Operational staff ledger roster (PostgreSQL mirror)</span>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase font-bold">
                  <th className="p-3">Staff Identity ID</th>
                  <th className="p-3">Designation Role</th>
                  <th className="p-3">Base Compensation</th>
                  <th className="p-3">Attendance Rate</th>
                  <th className="p-3">Shift Logs Today</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {employeesList.map((emp) => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const activeLog = emp.shiftLogs.find((l) => l.date === todayStr);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium">
                        <div className="font-bold">{emp.name}</div>
                        <span className="text-[10px] font-mono text-slate-400">{emp.id}</span>
                      </td>
                      <td className="p-3 text-[11px] font-medium font-mono text-indigo-700">{emp.role}</td>
                      <td className="p-3 font-mono font-bold">₹{emp.baseSalary.toLocaleString()}/mo</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${emp.attendancePct > 90 ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                          <span className="font-mono font-bold">{emp.attendancePct}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {activeLog ? (
                          <span className={`px-2 py-0.5 rounded text-[9.3px] font-mono font-extrabold uppercase ${activeLog.checkedIn ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border"}`}>
                            {activeLog.checkedIn ? "Checked-In" : "Punched-Out"}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No logs punched</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </section>

    </div>
  );
}
