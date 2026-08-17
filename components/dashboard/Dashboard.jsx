"use client";

import React from "react";
import {
  FileSpreadsheet,
  FileDown,
  Layers,
  LayoutGrid,
  LayoutList,
  Loader2,
  ClipboardList,
  DollarSign,
  CheckCircle2,
  Search,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  LogOut,
  Plus,
  Car,
  X,
  MessageSquare,
  MinusCircle,
  ShoppingCart,
  Package,
  Send,
  Wrench,
  Truck,
  Lock,
  Phone,
  Copy,
  Users,
  Trash2,
} from "lucide-react";
import SmsNotificationModal from "../notifications/SmsNotificationModal";
import SparePartsInventory from "../spare-parts/SparePartsInventory";
import ActiveGarageVehicles from "../garage/ActiveGarageVehicles";
export default function Dashboard({
  currentUser,
  activeJob,
  selectedJobId,
  panels,
  selectedPanelId,
  setSelectedPanelId,
  damageTypes,
  selectedPanel,
  updatePanelDamage,
  updatePanelTechnician,
  filteredJobs,
  inventory,
  totalVehicles,
  totalRevenue,
  readyForPickup,
  searchTerm,
  viewMode,
  partQuantity,
  purchaseForm,

  selectedPartId,
  isLoading,
  handleAddPartToJob,
  handleExportJobCardsExcel,
  handleExportJobCardsPDF,
  handleExportSalesExcel,
  handleExportSalesPDF,
  handleLogout,
  handleOpenFullJobCard,
  handleOpenSmsModal,
  handlePurchaseOrderSubmit,
  handleResetData,
  handleSelectJob,
  updateJobStatus,
  setActiveScreen,
  isSmsModalOpen,
  smsJobData,
  generateSmsText,

  setIsModalOpen,
  setIsSmsModalOpen,
  setIsUserModalOpen,
  setPartQuantity,
  setPurchaseForm,
  setSearchTerm,
  setSelectedPartId,
  setViewMode,
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-12">
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center space-x-3 shrink-0">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">AutoFix Pro</h1>
                <p className="text-xs text-slate-400">Enterprise System</p>
              </div>
            </div>

            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Customer, Plate, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 text-sm text-slate-100 pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center space-x-2">
                <ShieldCheck
                  className={`w-4 h-4 ${currentUser.role === "Super User" ? "text-purple-400" : "text-emerald-400"}`}
                />
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 leading-none">
                    Logged in as:
                  </p>
                  <p className="text-xs font-black text-white">
                    {currentUser.name} ({currentUser.role})
                  </p>
                </div>
              </div>

              {currentUser.role === "Super User" && (
                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 shadow transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Manage Users</span>
                </button>
              )}

              {(currentUser.role === "Manager" ||
                currentUser.role === "Super User") && (
                <button
                  onClick={handleResetData}
                  title="Reset All Data"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Demo</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                title="Log Out"
                className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 shadow transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Bulk Reports & Data Export
            </h4>
            <p className="text-xs text-slate-500">
              Download complete workshop registers with current date naming
              tags.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportJobCardsExcel}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Job Cards
              (Excel)
            </button>
            <button
              onClick={handleExportJobCardsPDF}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow"
            >
              <FileDown className="w-4 h-4 text-blue-400" /> Job Cards (PDF)
            </button>
            <button
              onClick={handleExportSalesExcel}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow"
            >
              <FileSpreadsheet className="w-4 h-4" /> Sales History (Excel)
            </button>
            <button
              onClick={handleExportSalesPDF}
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow"
            >
              <FileDown className="w-4 h-4" /> Sales History (PDF)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Total Shop Vehicles
              </p>
              <h4 className="text-2xl font-bold text-slate-900">
                {totalVehicles}
              </h4>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Total Invoiced Sales
              </p>
              <h4 className="text-2xl font-bold text-slate-900">
                ${totalRevenue.toLocaleString()}
              </h4>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Ready for Pickup
              </p>
              <h4 className="text-2xl font-bold text-slate-900">
                {readyForPickup}
              </h4>
            </div>
          </div>
        </div>

        {/* --- ACTIVE GARAGE VEHICLES --- */}
        <ActiveGarageVehicles
          searchTerm={searchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isLoading={isLoading}
          filteredJobs={filteredJobs}
          selectedJobId={selectedJobId}
          handleSelectJob={handleSelectJob}
          togglePaymentStatus={togglePaymentStatus}
          handleOpenSmsModal={handleOpenSmsModal}
          handleOpenFullJobCard={handleOpenFullJobCard}
          updateJobStatus={updateJobStatus}
        />

        {/* --- PANEL INSPECTION --- */}
        {activeJob && (
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
                        {
                          (damageTypes[selectedPanel.status] || damageTypes.ok)
                            .label
                        }
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
                            onClick={() =>
                              updatePanelDamage(selectedPanel.id, key)
                            }
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
                          updatePanelTechnician(
                            selectedPanel.id,
                            e.target.value,
                          )
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
        )}

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

      <SmsNotificationModal
        isSmsModalOpen={isSmsModalOpen}
        smsJobData={smsJobData}
        generateSmsText={generateSmsText}
        setIsSmsModalOpen={setIsSmsModalOpen}
      />
    </div>
  );
}
