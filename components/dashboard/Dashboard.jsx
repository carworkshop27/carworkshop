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
import DashboardHeader from "./DashboardHeader";
import PanelInspection from "../panel-inspection/PanelInspection";
import BulkReports from "../reports/BulkReports";
import DashboardStats from "../dashboard-stats/DashboardStats";
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
  togglePaymentStatus,
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
      <DashboardHeader
        currentUser={currentUser}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setIsUserModalOpen={setIsUserModalOpen}
        handleResetData={handleResetData}
        handleLogout={handleLogout}
      />

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

        <BulkReports
          handleExportJobCardsExcel={handleExportJobCardsExcel}
          handleExportJobCardsPDF={handleExportJobCardsPDF}
          handleExportSalesExcel={handleExportSalesExcel}
          handleExportSalesPDF={handleExportSalesPDF}
        />

        <DashboardStats
          totalVehicles={totalVehicles}
          totalRevenue={totalRevenue}
          readyForPickup={readyForPickup}
        />

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
          <PanelInspection
            activeJob={activeJob}
            panels={panels}
            selectedPanelId={selectedPanelId}
            setSelectedPanelId={setSelectedPanelId}
            damageTypes={damageTypes}
            selectedPanel={selectedPanel}
            updatePanelDamage={updatePanelDamage}
            updatePanelTechnician={updatePanelTechnician}
          />
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
