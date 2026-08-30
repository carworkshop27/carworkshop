"use client";

import React from "react";
import ActiveGarageVehicles from "../garage/ActiveGarageVehicles";
import BulkReports from "../reports/BulkReports";

export default function JobCards({
  searchTerm,
  viewMode,
  setViewMode,
  isLoading,
  filteredJobs,
  selectedJobId,
  handleSelectJob,
  togglePaymentStatus,
  handleOpenSmsModal,
  handleOpenFullJobCard,
  handleOpenInvoice,
  updateJobStatus,
  handleDeleteJob,
  setActiveScreen,
  handleExportJobCardsExcel,
  handleExportJobCardsPDF,
  handleExportSalesExcel,
  handleExportSalesPDF,
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              Job Cards
            </h1>
            <p className="mt-0.5 text-sm font-semibold text-slate-500">
              Manage active workshop jobs and vehicle repair progress
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveScreen?.("dashboard")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <BulkReports
          handleExportJobCardsExcel={handleExportJobCardsExcel}
          handleExportJobCardsPDF={handleExportJobCardsPDF}
          handleExportSalesExcel={handleExportSalesExcel}
          handleExportSalesPDF={handleExportSalesPDF}
        />

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
          handleOpenInvoice={handleOpenInvoice}
          updateJobStatus={updateJobStatus}
          handleDeleteJob={handleDeleteJob}
        />
      </main>
    </div>
  );
}
