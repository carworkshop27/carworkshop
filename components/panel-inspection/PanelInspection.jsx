"use client";

import {
  Car,
  CarFront,
  PanelTop,
  DoorOpen,
  RectangleHorizontal,
} from "lucide-react";

const FrontBumperIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 9.5C4.5 8 6 7 8 7h8c2 0 3.5 1 4 2.5" />
    <path d="M3 10.5v3c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3v-3" />
    <path d="M5 16.5c1 1.3 2.5 2 4.5 2h5c2 0 3.5-.7 4.5-2" />
    <path d="M9 13h6l-.6 2H9.6L9 13Z" />
    <path d="M5.5 12h1.5" />
    <path d="M17 12h1.5" />
  </svg>
);

const HoodIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 5h14l2 13H3L5 5Z" />
    <path d="M7 8h10" />
    <path d="M6 11h12" />
    <path d="M5 14h14" />
  </svg>
);

const RoofIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 4h10l3 4v12H4V8l3-4Z" />
    <path d="M7 4v4h10V4" />
    <path d="M7 12h10" />
    <path d="M7 16h10" />
  </svg>
);

const TrunkIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 8h14l2 10H3L5 8Z" />
    <path d="M5 8l2-4h10l2 4" />
    <path d="M7 12h10" />
    <path d="M6 15h12" />
  </svg>
);

const RearBumperIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 9.5C4.5 8 6 7 8 7h8c2 0 3.5 1 4 2.5" />
    <path d="M3 10.5v3c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3v-3" />
    <path d="M5 16.5c1 1.3 2.5 2 4.5 2h5c2 0 3.5-.7 4.5-2" />
    <path d="M7 13h10" />
    <path d="M5.5 12h1.5" />
    <path d="M17 12h1.5" />
  </svg>
);

const FrontLeftFenderIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 16.5h2" />
    <path d="M19 16.5h2" />
    <path d="M5 16.5c.4-4.2 2.8-7 7-7s6.6 2.8 7 7" />
    <path d="M7 16.5c.3-2.2 2-3.8 5-3.8s4.7 1.6 5 3.8" />
    <path d="M3 16.5h2" />
    <path d="M19 16.5h2" />
    <path d="M5 9.5h4" />
    <path d="M15 9.5h4" />
    <path d="M5 9.5v7" />
    <path d="M19 9.5v7" />
  </svg>
);

const FrontRightFenderIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 17.5h2" />
    <path d="M18 17.5h2" />
    <path d="M5 17.5c.2-4.2 2.8-7.5 7-7.5s6.8 3.3 7 7.5" />
    <path d="M7 17.5a5 5 0 0 1 10 0" />
    <path d="M5 17.5h14" />
    <path d="M8 10.5l1.5-3h5l1.5 3" />
  </svg>
);

const RearLeftFenderIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Rear quarter panel outline */}
    <path d="M4 17.5V11c0-1.1.9-2 2-2h5.5c2.4 0 4.6 1.2 5.8 3.3L19 15v2.5" />

    {/* Wheel arch */}
    <path d="M7 17.5c.2-2.5 1.8-4.2 4-4.2s3.8 1.7 4 4.2" />

    {/* Wheel / lower body */}
    <path d="M5 17.5h2" />
    <path d="M15 17.5h4" />

    {/* Rear quarter / tail section */}
    <path d="M4 11h3" />
    <path d="M19 15h1.5" />
    <path d="M19 15v2.5" />

    {/* Characteristic quarter-panel line */}
    <path d="M8 9v4" />
  </svg>
);

const RearRightFenderIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Rear quarter panel outline */}
    <path d="M20 17.5V11c0-1.1-.9-2-2-2h-5.5c-2.4 0-4.6 1.2-5.8 3.3L5 15v2.5" />

    {/* Wheel arch */}
    <path d="M17 17.5c-.2-2.5-1.8-4.2-4-4.2s-3.8 1.7-4 4.2" />

    {/* Wheel / lower body */}
    <path d="M19 17.5h-2" />
    <path d="M9 17.5H5" />

    {/* Rear quarter / tail section */}
    <path d="M20 11h-3" />
    <path d="M5 15H3.5" />
    <path d="M5 15v2.5" />

    {/* Characteristic quarter-panel line */}
    <path d="M16 9v4" />
  </svg>
);

const FrontLeftDoorIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Door outer shape */}
    <path d="M5 4.5h9.5l4.5 4v11H5z" />

    {/* Window */}
    <path d="M7 6.5h7l3 3H7z" />

    {/* Window/door separation */}
    <path d="M7 9.5v10" />

    {/* Door handle */}
    <path d="M11 12h3" />

    {/* Lower door contour */}
    <path d="M9 17h6" />

    {/* Door hinge/edge detail */}
    <path d="M17 10v8" />
  </svg>
);

const FrontRightDoorIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Door outer shape */}
    <path d="M19 4.5h-9.5l-4.5 4v11h14z" />

    {/* Window */}
    <path d="M17 6.5h-7l-3 3h10z" />

    {/* Window / door separation */}
    <path d="M17 9.5v10" />

    {/* Door handle */}
    <path d="M13 12h-3" />

    {/* Lower door contour */}
    <path d="M15 17H9" />

    {/* Door edge detail */}
    <path d="M7 10v8" />
  </svg>
);

const RearLeftDoorIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Door silhouette */}
    <path d="M4 19V6.5C4 5.7 4.7 5 5.5 5h7.2c1.2 0 2.3.5 3.1 1.4l3.1 3.7c.7.8 1.1 1.8 1.1 2.9v6H4Z" />

    {/* Window */}
    <path d="M5.8 6.8h6.4c.7 0 1.4.3 1.8.9l2.5 3H5.8V6.8Z" />

    {/* Window divider */}
    <path d="M8.8 6.8v3.9" />

    {/* Door handle */}
    <path d="M7.2 13.2h3.2" />

    {/* Lower door contour */}
    <path d="M5.8 17.2h9.5" />

    {/* Rear door edge */}
    <path d="M17.2 11.2v6" />
  </svg>
);

const RearRightDoorIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Rear-right door outer shape */}
    <path d="M5 4.5h9.2c1.1 0 2 .6 2.7 1.5l3.1 4.2v8.3H5V4.5Z" />

    {/* Rear door window */}
    <path d="M7 6.5h6.8c.6 0 1.1.3 1.5.8l2.1 2.9H7V6.5Z" />

    {/* Window divider */}
    <path d="M10 6.5v3.7" />

    {/* Door handle */}
    <path d="M8 13h2.5" />

    {/* Door lower contour */}
    <path d="M7 16.5h11" />
  </svg>
);

const LeftSideSkirtIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Side skirt / rocker panel */}
    <path d="M3 10.5h18" />
    <path d="M3 10.5v5h18v-5" />

    {/* Lower body contour */}
    <path d="M4 15.5l1.5 2h13l1.5-2" />

    {/* Mounting / body points */}
    <path d="M6 10.5v2" />
    <path d="M18 10.5v2" />

    {/* Lower edge */}
    <path d="M6 17.5h12" />
  </svg>
);

const RightSideSkirtIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Right side skirt / rocker panel */}
    <path d="M3 10.5h18" />
    <path d="M3 10.5v5h18v-5" />

    {/* Lower body contour */}
    <path d="M4 15.5l1.5 2h13l1.5-2" />

    {/* Mounting / body points */}
    <path d="M6 10.5v2" />
    <path d="M18 10.5v2" />

    {/* Lower edge */}
    <path d="M6 17.5h12" />
  </svg>
);

export default function PanelInspection({
  activeJob,
  panels,
  selectedPanelId,
  setSelectedPanelId,
  damageTypes,
  selectedPanel,
  updatePanelDamage,
  updatePanelRepairCost,
  updatePanelTechnician,
  addPanel,
}) {
  const getPanelIcon = (panelId) => {
    switch (panelId) {
      case "front-bumper":
        return FrontBumperIcon;

      case "hood":
        return HoodIcon;

      case "roof":
        return RoofIcon;

      case "trunk":
        return TrunkIcon;

      case "rear-bumper":
        return RearBumperIcon;

      case "front-left-fender":
        return FrontLeftFenderIcon;

      case "front-right-fender":
        return FrontRightFenderIcon;

      case "rear-left-fender":
        return RearLeftFenderIcon;

      case "rear-right-fender":
        return RearRightFenderIcon;

      case "front-left-door":
        return FrontLeftDoorIcon;

      case "front-right-door":
        return FrontRightDoorIcon;

      case "rear-left-door":
        return RearLeftDoorIcon;

      case "rear-right-door":
        return RearRightDoorIcon;

      case "left-skirt":
        return LeftSideSkirtIcon;

      case "right-skirt":
        return RightSideSkirtIcon;

        return RectangleHorizontal;

      default:
        return Car;
    }
  };

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
              {activeJob
                ? `${activeJob.id} — ${activeJob.model}`
                : "No active vehicle selected"}
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
                    <div className="flex items-center gap-2">
                      {(() => {
                        const PanelIcon = getPanelIcon(panel.id);
                        return (
                          <PanelIcon className="w-4 h-4 text-blue-600 shrink-0" />
                        );
                      })()}

                      <span className="text-xs font-extrabold text-slate-900">
                        {panel.name}
                      </span>
                    </div>

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

                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-slate-900">⃁</span>

                  <input
                    type="number"
                    min="300"
                    max="455"
                    step="5"
                    value={
                      selectedPanel.customRepairCost !== undefined &&
                      selectedPanel.customRepairCost !== ""
                        ? selectedPanel.customRepairCost
                        : (damageTypes[selectedPanel.status] || damageTypes.ok)
                            .cost
                    }
                    onChange={(e) =>
                      updatePanelRepairCost(selectedPanel.id, e.target.value)
                    }
                    onBlur={(e) => {
                      const value = Number(e.target.value);

                      if (!Number.isFinite(value)) {
                        updatePanelRepairCost(selectedPanel.id, 300);
                        return;
                      }

                      updatePanelRepairCost(
                        selectedPanel.id,
                        Math.min(455, Math.max(300, Math.round(value))),
                      );
                    }}
                    className="w-28 text-right text-lg font-black text-slate-900 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
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

      {/* Panel Actions */}
      <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={() => {
            const panelName = window.prompt("Enter panel name:");

            if (panelName?.trim()) {
              addPanel(panelName.trim());
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          + Add Panel
        </button>

        <button
          type="button"
          onClick={() => {
            const panelName = window.prompt(
              "Quick Add Panel\n\nEnter the panel name:",
            );

            if (panelName?.trim()) {
              addPanel(panelName.trim());
            }
          }}
          className="bg-white hover:bg-slate-50 text-slate-800 text-sm font-extrabold px-5 py-2.5 rounded-lg border border-slate-300 shadow-sm transition-colors"
        >
          ⚡ Quick Add
        </button>
      </div>
    </div>
  );
}
