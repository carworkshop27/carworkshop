"use client";

import React from "react";
import { MinusCircle, ShoppingCart, Package, Truck, Lock } from "lucide-react";

export default function SparePartsInventory({
  currentUser,
  activeJob,
  inventory,
  partQuantity,
  purchaseForm,
  selectedPartId,
  handleAddPartToJob,
  handlePurchaseOrderSubmit,
  setPartQuantity,
  setPurchaseForm,
  setSelectedPartId,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Package className="w-6 h-6 text-blue-700" />
          <h3 className="font-extrabold text-lg text-slate-900">
            Spare Parts & Purchase Inventory
          </h3>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-full">
          Role: {currentUser.role}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {inventory.map((item) => (
          <div
            key={item.id}
            className="bg-slate-100 border border-slate-300 p-4 rounded-xl flex justify-between items-center shadow-sm"
          >
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">
                {item.name}
              </h4>

              <p className="text-xs font-bold text-slate-700 mt-0.5">
                {currentUser.role === "Mechanic"
                  ? "Restricted Cost"
                  : `Buy: $${item.costPrice || 40}`}{" "}
                | Sell: ${item.price}
              </p>
            </div>

            <div
              className={`text-xs font-black px-3 py-1.5 rounded-full shadow-sm ${
                item.stock > 5
                  ? "bg-emerald-200 text-emerald-900 border border-emerald-400"
                  : "bg-rose-200 text-rose-900 border border-rose-400"
              }`}
            >
              Stock: {item.stock}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleAddPartToJob}
          className="bg-blue-50/90 border border-blue-300 p-5 rounded-xl shadow-sm flex flex-col justify-between gap-3"
        >
          <div>
            <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MinusCircle className="w-4 h-4 text-blue-700" /> Job Card Parts
              Deduction
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-blue-950 mb-1">
                  Target Job{" "}
                  {activeJob
                    ? `(${activeJob.id} - ${activeJob.model})`
                    : "(⚠️ Select a car above first!)"}
                </label>

                <select
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  className="w-full bg-white text-xs font-bold text-slate-900 p-2.5 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">-- Select Spare Part to Deduct --</option>

                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (${item.price} - Stock: {item.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-blue-950 mb-1">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={partQuantity}
                  onChange={(e) => setPartQuantity(e.target.value)}
                  className="w-full bg-white text-xs font-bold text-slate-900 p-2.5 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-lg shadow flex items-center justify-center gap-1"
          >
            <MinusCircle className="w-4 h-4" /> Deduct from Active Job
          </button>
        </form>

        <form
          onSubmit={handlePurchaseOrderSubmit}
          className={`p-5 rounded-xl shadow-sm flex flex-col justify-between gap-3 border ${
            currentUser.role === "Manager" || currentUser.role === "Super User"
              ? "bg-emerald-50/90 border-emerald-300"
              : "bg-slate-100 border-slate-300 opacity-75"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-700" /> Purchase Order &
                Supplier Intake
              </h4>

              {currentUser.role !== "Manager" &&
                currentUser.role !== "Super User" && (
                  <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Manager / Super User Only
                  </span>
                )}
            </div>

            {currentUser.role === "Manager" ||
            currentUser.role === "Super User" ? (
              <>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-[11px] font-extrabold text-emerald-950 mb-1">
                      Supplier Name *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="e.g. Bosch Auto Parts"
                      value={purchaseForm.supplierName}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          supplierName: e.target.value,
                        })
                      }
                      className="w-full bg-white text-xs font-bold text-slate-900 p-2 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-emerald-950 mb-1">
                      Spare Part
                    </label>

                    <select
                      value={purchaseForm.partId}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          partId: e.target.value,
                        })
                      }
                      className="w-full bg-white text-xs font-bold text-slate-900 p-2 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {inventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-extrabold text-emerald-950 mb-1">
                      Quantity Purchased
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={purchaseForm.quantity}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          quantity: e.target.value,
                        })
                      }
                      className="w-full bg-white text-xs font-bold text-slate-900 p-2 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-emerald-950 mb-1">
                      Unit Cost ($)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={purchaseForm.unitCost}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          unitCost: e.target.value,
                        })
                      }
                      className="w-full bg-white text-xs font-bold text-slate-900 p-2 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-slate-600 text-xs font-bold">
                <Lock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                Purchase orders and supplier financial logs are restricted to
                Managers & Super Users.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              currentUser.role !== "Manager" &&
              currentUser.role !== "Super User"
            }
            className={`w-full py-2.5 text-white font-extrabold text-xs rounded-lg shadow flex items-center justify-center gap-1 ${
              currentUser.role === "Manager" ||
              currentUser.role === "Super User"
                ? "bg-emerald-700 hover:bg-emerald-800"
                : "bg-slate-400 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="w-4 h-4" /> Log Purchase & Restock
            Inventory
          </button>
        </form>
      </div>
    </div>
  );
}
