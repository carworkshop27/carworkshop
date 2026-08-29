"use client";

export default function DashboardActions({ activeJob }) {
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
    </div>
  );
}
