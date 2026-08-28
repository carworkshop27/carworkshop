"use client";

import React from "react";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  Plus,
  Save,
  User,
  Wrench,
  X,
  Zap,
} from "lucide-react";

export default function NewJobIntake({
  formData,
  setFormData,
  handleIntakeSubmit,
  setActiveScreen,

  panels = [],
  selectedPanelId,
  setSelectedPanelId,
  damageTypes = {},
  selectedPanel,
  updatePanelDamage,
  updatePanelRepairCost,
  updatePanelTechnician,
  addPanel,
}) {
  const updateField = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const now = new Date();

  const dateText = now.toLocaleDateString("en-GB");
  const timeText = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* =========================================================
          TOP BAR
      ========================================================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveScreen?.("dashboard")}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black tracking-tight text-slate-950">
                  New Job / Intake
                </h1>

                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-black text-blue-700">
                  NEW
                </span>
              </div>

              <p className="mt-0.5 text-sm font-semibold text-slate-500">
                Register customer, vehicle and initial repair requirements
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-right">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Date
              </p>
              <p className="text-sm font-bold text-slate-800">{dateText}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Time
              </p>
              <p className="text-sm font-bold text-slate-800">{timeText}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleIntakeSubmit} className="space-y-6">
          {/* =======================================================
              CUSTOMER INFORMATION
          ======================================================= */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Customer Information
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    Customer contact details
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-3">
              <Field
                label="Customer Name"
                required
                value={formData?.owner || ""}
                onChange={(value) => updateField("owner", value)}
                placeholder="e.g. John Smith"
              />

              <Field
                label="Customer Mobile"
                required
                value={formData?.phone || ""}
                onChange={(value) => updateField("phone", value)}
                placeholder="e.g. +966 5X XXX XXXX"
                type="tel"
              />

              <Field
                label="Customer Email"
                value={formData?.email || ""}
                onChange={(value) => updateField("email", value)}
                placeholder="e.g. customer@email.com"
                type="email"
              />

              <Field
                label="Company"
                value={formData?.company || ""}
                onChange={(value) => updateField("company", value)}
                placeholder="Company name (optional)"
              />
            </div>
          </section>

          {/* =======================================================
              VEHICLE INFORMATION
          ======================================================= */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Car className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Vehicle Information
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    Vehicle identification and details
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-3">
              <Field
                label="Car Make / Brand"
                value={formData?.make || ""}
                onChange={(value) => updateField("make", value)}
                placeholder="e.g. Toyota"
              />

              <Field
                label="Model"
                required
                value={formData?.model || ""}
                onChange={(value) => updateField("model", value)}
                placeholder="e.g. Camry"
              />

              <Field
                label="Model Year"
                value={formData?.year || ""}
                onChange={(value) => updateField("year", value)}
                placeholder="e.g. 2025"
              />

              <Field
                label="Car Color"
                required
                value={formData?.color || ""}
                onChange={(value) => updateField("color", value)}
                placeholder="e.g. Pearl White"
              />

              <Field
                label="Car No."
                required
                value={formData?.plate || ""}
                onChange={(value) => updateField("plate", value)}
                placeholder="e.g. ABC-123"
                className="font-mono"
              />

              <Field
                label="Car No. Later"
                value={formData?.plateLater || ""}
                onChange={(value) => updateField("plateLater", value)}
                placeholder="Enter later (optional)"
                className="font-mono"
              />
            </div>
          </section>

          {/* =======================================================
              INTAKE STATUS
          ======================================================= */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Job Information
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    Initial job and payment status
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Initial Status
                </label>

                <select
                  value={formData?.status || "Inspection & Body Check"}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="Inspection & Body Check">
                    Inspection & Body Check
                  </option>
                  <option value="In Repair / Workshop">
                    In Repair / Workshop
                  </option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Initial Payment
                </label>

                <select
                  value={formData?.paymentStatus || "Unpaid"}
                  onChange={(e) => updateField("paymentStatus", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Reported Issue / Notes
                </label>

                <textarea
                  rows={4}
                  value={formData?.issue || ""}
                  onChange={(e) => updateField("issue", e.target.value)}
                  placeholder="Describe the customer's initial complaint..."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* =======================================================
              PANELS
          ======================================================= */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Wrench className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">Panels</h2>
                  <p className="text-sm font-medium text-slate-500">
                    Select vehicle panels and record their initial condition
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={addPanel}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Panel
                </button>

                <button
                  type="button"
                  onClick={addPanel}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Zap className="h-4 w-4" />
                  Quick Add
                </button>
              </div>
            </div>

            <div className="grid gap-3 p-3 lg:grid-cols-[1.15fr_1fr]">
              {/* PANEL LIST */}
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Panel List
                  </p>
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {(panels || []).map((panel, index) => {
                    const isSelected = panel.id === selectedPanelId;
                    const info = damageTypes?.[panel.status] || damageTypes?.ok;

                    return (
                      <button
                        key={panel.id || index}
                        type="button"
                        onClick={() => setSelectedPanelId(panel.id)}
                        className={`flex w-full items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 text-left transition last:border-b-0 ${
                          isSelected
                            ? "border-l-4 border-l-blue-600 bg-blue-50"
                            : "border-l-4 border-l-transparent bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Car className="h-3.5 w-3.5" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900">
                              {panel.name}
                            </p>

                            {panel.assignedTech ? (
                              <p className="truncate text-xs font-semibold text-slate-500">
                                {panel.assignedTech}
                              </p>
                            ) : (
                              <p className="text-xs font-semibold text-slate-400">
                                No technician assigned
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${
                            info?.uiColor ||
                            "border-slate-200 bg-slate-100 text-slate-700"
                          }`}
                        >
                          {info?.label || "Clean"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SELECTED PANEL */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                {selectedPanel ? (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                          Selected Panel
                        </p>

                        <h3 className="mt-1 text-lg font-black text-slate-900">
                          {selectedPanel.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
                        <CheckCircle2 className="h-4 w-4" />
                        {(
                          damageTypes?.[selectedPanel.status] || damageTypes?.ok
                        )?.label || "Clean"}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        Damage Status
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(damageTypes || {}).map(
                          ([status, info]) => {
                            const active = selectedPanel.status === status;

                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() =>
                                  updatePanelDamage(selectedPanel.id, status)
                                }
                                className={`rounded-lg border px-2 py-2 text-xs font-black transition ${
                                  active
                                    ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                              >
                                {info.label}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        Assigned Technician
                      </label>

                      <select
                        value={selectedPanel.assignedTech || ""}
                        onChange={(e) =>
                          updatePanelTechnician(
                            selectedPanel.id,
                            e.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">-- Unassigned --</option>
                        <option value="David Smith (Lead Tech)">
                          David Smith (Lead Tech)
                        </option>
                        <option value="Ahmed Ali (Technician)">
                          Ahmed Ali (Technician)
                        </option>
                        <option value="Mohammed Hassan (Technician)">
                          Mohammed Hassan (Technician)
                        </option>
                      </select>
                    </div>

                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        Estimated Repair Cost
                      </label>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-400">
                          ⃁
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={
                            selectedPanel.customRepairCost ??
                            damageTypes?.[selectedPanel.status]?.cost ??
                            0
                          }
                          onChange={(e) =>
                            updatePanelRepairCost(
                              selectedPanel.id,
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right text-sm font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[300px] items-center justify-center text-center">
                    <div>
                      <Car className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-sm font-bold text-slate-500">
                        Select a panel to inspect it.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* =======================================================
              SAVE BAR
          ======================================================= */}
          <section className="sticky bottom-0 z-30 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Ready to create the job
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    Customer, vehicle and panel information will be saved.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveScreen?.("dashboard")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-black text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99]"
                >
                  <Save className="h-4 w-4" />
                  Save Job Card
                </button>
              </div>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}

/* ===============================================================
   REUSABLE FIELD
================================================================ */

function Field({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-600">*</span>}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition placeholder:font-semibold placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`}
      />
    </div>
  );
}
