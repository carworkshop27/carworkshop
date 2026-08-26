"use client";

import React from "react";

import SmsNotificationModal from "../notifications/SmsNotificationModal";
import SparePartsInventory from "../spare-parts/SparePartsInventory";
import ActiveGarageVehicles from "../garage/ActiveGarageVehicles";
import DashboardHeader from "./DashboardHeader";
import PanelInspection from "../panel-inspection/PanelInspection";
import ElectricalPanel from "../electrical-panel/ElectricalPanel";
import MechanicalPanel from "../mechanical-panel/MechanicalPanel";
import BulkReports from "../reports/BulkReports";
import DashboardStats from "../dashboard-stats/DashboardStats";
import DashboardActions from "./DashboardActions";
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
  updatePanelRepairCost,
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
  handleDeleteJob,
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
        <DashboardActions
          activeJob={activeJob}
          setActiveScreen={setActiveScreen}
          setIsModalOpen={setIsModalOpen}
        />

        <BulkReports
          handleExportJobCardsExcel={handleExportJobCardsExcel}
          handleExportJobCardsPDF={handleExportJobCardsPDF}
          handleExportSalesExcel={handleExportSalesExcel}
          handleExportSalesPDF={handleExportSalesPDF}
        />

        {/* --- PANEL INSPECTION --- */}
        <PanelInspection
          activeJob={activeJob}
          panels={panels}
          selectedPanelId={selectedPanelId}
          setSelectedPanelId={setSelectedPanelId}
          damageTypes={damageTypes}
          selectedPanel={selectedPanel}
          updatePanelDamage={updatePanelDamage}
          updatePanelRepairCost={updatePanelRepairCost}
          updatePanelTechnician={updatePanelTechnician}
        />

        <ElectricalPanel />

        <MechanicalPanel />

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
          handleDeleteJob={handleDeleteJob}
        />

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
