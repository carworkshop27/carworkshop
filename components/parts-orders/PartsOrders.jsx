"use client";

import React from "react";
import { ArrowLeft, CalendarDays, Clock3, ShoppingCart } from "lucide-react";

import SparePartsInventory from "../spare-parts/SparePartsInventory";

export default function PartsOrders({
  currentUser,
  inventory,
  activeJob,
  selectedPartId,
  partQuantity,
  purchaseForm,
  handleAddPartToJob,
  handlePurchaseOrderSubmit,
  setPartQuantity,
  setPurchaseForm,
  setSelectedPartId,
  setActiveScreen,
}) {
  const now = new Date();

  const dateText = now.toLocaleDateString("en-GB");

  const timeText = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* =========================================================
          TOP HEADER
      ========================================================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveScreen?.("dashboard")}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div>
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-blue-600" />

                <h1 className="text-xl font-black tracking-tight text-slate-950">
                  Parts Orders
                </h1>
              </div>

              <p className="mt-0.5 text-sm font-semibold text-slate-500">
                Manage spare parts inventory, purchase orders and stock
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Date
                </p>

                <p className="text-sm font-bold text-slate-800">{dateText}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Clock3 className="h-4 w-4 text-slate-500" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Time
                </p>

                <p className="text-sm font-bold text-slate-800">{timeText}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <SparePartsInventory
          currentUser={currentUser}
          inventory={inventory}
          activeJob={activeJob}
          selectedPartId={selectedPartId}
          partQuantity={partQuantity}
          purchaseForm={purchaseForm}
          handleAddPartToJob={handleAddPartToJob}
          handlePurchaseOrderSubmit={handlePurchaseOrderSubmit}
          setPartQuantity={setPartQuantity}
          setPurchaseForm={setPurchaseForm}
          setSelectedPartId={setSelectedPartId}
        />
      </main>
    </div>
  );
}
