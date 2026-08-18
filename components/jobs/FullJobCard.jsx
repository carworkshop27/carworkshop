"use client";

import React from "react";
import {
  ArrowLeft,
  MessageSquare,
  CreditCard,
  UserCheck,
  Car,
  Palette,
  Phone,
  ShieldAlert,
  Package,
} from "lucide-react";

export default function FullJobCard({
  detailedJobCard,
  defaultPanels,
  getDamageInfo,
  handleOpenSmsModal,
  panels,
  setActiveScreen,
  togglePaymentStatus,
}) {
  const jobPanels = detailedJobCard.panels || defaultPanels;
  const damagedPanelsList = jobPanels.filter((p) => p.status !== "ok");
  const jobPartsList = detailedJobCard.parts || [];

  const repairCost = damagedPanelsList.reduce(
    (sum, p) => sum + getDamageInfo(p.status).cost,
    0,
  );
  const partsCost = jobPartsList.reduce((sum, pt) => sum + pt.price, 0);
  const totalJobCost = repairCost + partsCost;

  const currentPayStatus = detailedJobCard.paymentStatus || "Unpaid";
  const payStatusColor =
    currentPayStatus === "Paid"
      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
      : currentPayStatus === "Pending"
        ? "bg-amber-100 text-amber-900 border-amber-300"
        : "bg-rose-100 text-rose-900 border-rose-300";

  const assignedTechsSet = new Set(
    damagedPanelsList.map((p) => p.assignedTech).filter(Boolean),
  );
  const assignedTechsList = Array.from(assignedTechsSet);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-12">
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveScreen("dashboard")}
                className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-white flex items-center space-x-1 text-xs font-bold border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <div>
                <h1 className="font-bold text-lg leading-tight">
                  Job Card Report: {detailedJobCard.id}
                </h1>
                <p className="text-xs text-slate-400">
                  Complete Vehicle & Repair Specifications
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => handleOpenSmsModal(detailedJobCard, e)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>SMS / WhatsApp</span>
              </button>
              <span className="text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-emerald-400">
                {detailedJobCard.status}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-700">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Payment Status Bar
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full uppercase border shadow-sm ${payStatusColor}`}
                >
                  {currentPayStatus}
                </span>
                <button
                  onClick={() => togglePaymentStatus(detailedJobCard.id)}
                  className="text-xs font-bold text-blue-700 hover:underline bg-slate-100 px-3 py-1 rounded-lg border border-slate-300"
                >
                  Toggle Payment Status
                </button>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Total Invoice Cost
            </p>
            <h3 className="text-3xl font-black text-slate-900">
              ⃁${totalJobCost.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Customer Information
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase">
                    Full Name
                  </span>
                  <p className="text-base font-black text-slate-900">
                    {detailedJobCard.owner}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase">
                    Mobile Number
                  </span>
                  <p className="text-base font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-4 h-4 text-emerald-600" />{" "}
                    {detailedJobCard.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-3">
                <Car className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Vehicle Specifications
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase">
                    Company / Make
                  </span>
                  <p className="text-sm font-black text-slate-900">
                    {detailedJobCard.company || "Toyota"}{" "}
                    {detailedJobCard.make || ""}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase">
                    Model & Year
                  </span>
                  <p className="text-sm font-black text-slate-900">
                    {detailedJobCard.model} ({detailedJobCard.year || "2023"})
                  </p>
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase">
                    Car Color
                  </span>
                  <p className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
                    <Palette className="w-4 h-4 text-purple-600" />{" "}
                    {detailedJobCard.color || "Pearl White"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase">
                    Plate Number
                  </span>
                  <p className="text-sm font-mono font-black text-blue-700">
                    {detailedJobCard.plate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-3">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Assigned Technician & Labor Team
            </h3>
          </div>
          {assignedTechsList.length === 0 ? (
            <p className="text-xs font-bold text-slate-500 py-2">
              No individual technicians assigned to panels yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedTechsList.map((tech, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-50 text-indigo-900 border border-indigo-200 font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-base text-slate-900">
              Repairs & Bodywork Required ({damagedPanelsList.length} Panels)
            </h3>
          </div>
          {damagedPanelsList.length === 0 ? (
            <p className="text-xs font-bold text-slate-500 py-3">
              No body damages reported. Clean inspection.
            </p>
          ) : (
            <div className="space-y-2">
              {damagedPanelsList.map((p) => {
                const info = getDamageInfo(p.status);
                return (
                  <div
                    key={p.id}
                    className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-xl"
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${info.uiColor}`}
                        >
                          {info.label}
                        </span>
                        {p.assignedTech && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                            Tech: {p.assignedTech}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-black text-slate-900">
                      ⃁${info.cost.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-3">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Required Materials & Spare Parts ({jobPartsList.length})
            </h3>
          </div>
          {jobPartsList.length === 0 ? (
            <p className="text-xs font-bold text-slate-500 py-3">
              No spare parts deducted for this job yet.
            </p>
          ) : (
            <div className="space-y-2">
              {jobPartsList.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-blue-50/50 border border-blue-200 p-3 rounded-xl"
                >
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {pt.name}
                    </h4>
                    <p className="text-xs font-bold text-blue-700">
                      Quantity Required: x{pt.qty}
                    </p>
                  </div>
                  <span className="font-black text-slate-900">
                    ⃁{pt.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
