"use client";

import { Layers, Plus } from "lucide-react";

export default function DashboardActions({
  activeJob,
  setActiveScreen,
  setIsModalOpen,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
      {/* Dashboard Title */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Workshop Dashboard
        </h2>

        <p className="text-sm font-semibold text-slate-500 mt-1">
          {activeJob
            ? `Viewing Vehicle: ${activeJob.model} (${activeJob.plate})`
            : "Register or select a vehicle to begin"}
        </p>
      </div>

      {/* Dashboard Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Paint & Chemicals Inventory */}
        <button
          type="button"
          onClick={() => setActiveScreen("inventory-list")}
          className="
            bg-indigo-600
            hover:bg-indigo-700
            active:scale-[0.98]
            text-white
            font-bold
            px-5
            py-3
            rounded-xl
            text-sm
            flex
            items-center
            justify-center
            gap-2
            shadow-sm
            transition-all
          "
        >
          <Layers className="w-5 h-5" />
          <span>Paint & Chemicals Inventory</span>
        </button>

        {/* New Vehicle Intake */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="
            bg-emerald-600
            hover:bg-emerald-700
            active:scale-[0.98]
            text-white
            font-bold
            px-5
            py-3
            rounded-xl
            text-sm
            flex
            items-center
            justify-center
            gap-2
            shadow-sm
            transition-all
          "
        >
          <Plus className="w-5 h-5" />
          <span>New Vehicle Intake</span>
        </button>
      </div>
    </div>
  );
}
