"use client";

import React from "react";
import { Car } from "lucide-react";

export default function PanelInspection({
  activeJob,
  panels,
  selectedPanelId,
  setSelectedPanelId,
  damageTypes,
  selectedPanel,
  updatePanelDamage,
  updatePanelTechnician,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Car className="w-6 h-6 text-blue-700" />
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              Panel Inspection
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {activeJob.id} — {activeJob.model}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
          {panels.length} Panels
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Panel List */}
        <div className="lg:col-span-1 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Vehicle Panels
            </h4>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-200">
            {panels.map((panel) => {
              const info = damageTypes[panel.status] || damageTypes.ok;
              const isSelected = panel.id === selectedPanelId;

              return (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => setSelectedPanelId(panel.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    isSelected
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : "bg-white hover:bg-slate-50 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900">
                      {panel.name}
                    </span>

                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-full border ${info.uiColor}`}
                    >
                      {info.label}
                    </span>
                  </div>

                  {panel.assignedTech && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Tech: {panel.assignedTech}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Panel */}
        <div className="lg:col-span-2">
          {selectedPanel ? (
            <div className="border border-blue-200 rounded-xl bg-blue-50/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                    Selected Panel
                  </p>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    {selectedPanel.name}
                  </h4>
                </div>

                <span
                  className={`text-xs font-black px-3 py-1.5 rounded-full border ${
                    (damageTypes[selectedPanel.status] || damageTypes.ok)
                      .uiColor
                  }`}
                >
                  {(damageTypes[selectedPanel.status] || damageTypes.ok).label}
                </span>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-extrabold text-slate-800 mb-2">
                  Damage Status
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(damageTypes).map(([key, type]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updatePanelDamage(selectedPanel.id, key)}
                      className={`px-3 py-2 rounded-lg border text-xs font-black transition-colors ${
                        selectedPanel.status === key
                          ? type.uiColor
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2">
                  Assigned Technician
                </label>

                <select
                  value={selectedPanel.assignedTech || ""}
                  onChange={(e) =>
                    updatePanelTechnician(selectedPanel.id, e.target.value)
                  }
                  className="w-full bg-white text-xs font-bold text-slate-900 p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">-- Unassigned --</option>
                  <option value="David Smith (Lead Tech)">
                    David Smith (Lead Tech)
                  </option>
                  <option value="John Williams">John Williams</option>
                  <option value="Michael Brown">Michael Brown</option>
                  <option value="Ahmed Ali">Ahmed Ali</option>
                </select>
              </div>

              <div className="mt-5 flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3">
                <span className="text-xs font-bold text-slate-600">
                  Estimated Repair Cost
                </span>

                <span className="text-lg font-black text-slate-900">
                  $
                  {(
                    damageTypes[selectedPanel.status] || damageTypes.ok
                  ).cost.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-48 flex items-center justify-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
              <p className="text-sm font-bold text-slate-500">
                Select a vehicle panel to begin inspection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
