"use client";

import { Layers, Plus } from "lucide-react";

export default function DashboardActions({
  activeJob,
  setActiveScreen,
  setIsModalOpen,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Workshop Dashboard
        </h2>

        <p className="text-sm text-slate-600">
          {activeJob
            ? `Viewing Vehicle: ${activeJob.model} (${activeJob.plate})`
            : "Register or select a vehicle to begin"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveScreen("inventory-list")}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 shadow transition-transform"
        >
          <Layers className="w-5 h-5" />
          <span>Paint & Chemicals Inventory</span>
        </button>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 shadow transition-transform"
        >
          <Plus className="w-5 h-5" />
          <span>New Vehicle Intake</span>
        </button>
      </div>
    </div>
  );
}
