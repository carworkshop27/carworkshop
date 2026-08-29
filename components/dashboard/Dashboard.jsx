"use client";

import React from "react";
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  ClipboardList,
  Plus,
} from "lucide-react";

import SmsNotificationModal from "../notifications/SmsNotificationModal";
import DashboardHeader from "./DashboardHeader";
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
  addPanel,
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
  handleConfirmElectricalItem,
  handleConfirmMechanicalItem,
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
  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const sidebarItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      action: () => scrollToSection("dashboard-top"),
    },
    {
      label: "New Job / Intake",
      icon: Plus,
      action: () => setActiveScreen("new-job-intake"),
    },
    {
      label: "Job Cards",
      icon: ClipboardList,
      action: () => setActiveScreen("job-cards"),
    },
    {
      label: "Calendar",
      icon: CalendarDays,
      action: () => {
        scrollToSection("dashboard-top");
      },
    },
    {
      label: "Customers",
      icon: Users,
      action: () => {
        scrollToSection("active-vehicles");
      },
    },
    {
      label: "Vehicles",
      icon: Car,
      action: () => setActiveScreen("job-cards"),
    },
    {
      label: "Inventory",
      icon: Package,
      action: () => setActiveScreen("inventory-list"),
    },
    {
      label: "Parts Orders",
      icon: ShoppingCart,
      action: () => setActiveScreen("parts-orders"),
    },
    {
      label: "Reports",
      icon: FileText,
      action: () => scrollToSection("reports"),
    },
    {
      label: "Users",
      icon: Users,
      action: () => setIsUserModalOpen(true),
    },
    {
      label: "Settings",
      icon: Settings,
      action: () => scrollToSection("dashboard-top"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* =========================================================
          TOP HEADER
      ========================================================= */}
      <DashboardHeader
        currentUser={currentUser}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setIsUserModalOpen={setIsUserModalOpen}
        handleResetData={handleResetData}
        handleLogout={handleLogout}
      />

      {/* =========================================================
          APPLICATION BODY
      ========================================================= */}
      <div className="flex">
        {/* =======================================================
            LEFT SIDEBAR
        ======================================================= */}
        <aside
          className="
            hidden
            lg:flex
            w-64
            shrink-0
            min-h-[calc(100vh-76px)]
            bg-slate-950
            text-white
            flex-col
            sticky
            top-[76px]
            self-start
          "
        >
          {/* Brand */}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1">
            <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Main Menu
            </p>

            {sidebarItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className={`
                    w-full
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-xl
                    text-left
                    text-sm
                    font-bold
                    transition-all
                    ${
                      index === 0
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Area */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-3">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-300" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">
                  {currentUser.name}
                </p>

                <p className="text-[10px] font-bold text-slate-500 truncate">
                  {currentUser.role}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* =======================================================
            MAIN CONTENT
        ======================================================= */}
        <main
          id="dashboard-top"
          className="
            flex-1
            min-w-0
            px-4
            sm:px-6
            lg:px-8
            py-6
          "
        >
          {/* =====================================================
              DASHBOARD ACTIONS
          ===================================================== */}
          <section>
            <DashboardActions
              activeJob={activeJob}
              setActiveScreen={setActiveScreen}
              setIsModalOpen={setIsModalOpen}
            />
          </section>

          {/* =====================================================
              DASHBOARD STATISTICS
          ===================================================== */}
          <section id="statistics" className="scroll-mt-24">
            <DashboardStats
              totalVehicles={totalVehicles}
              totalRevenue={totalRevenue}
              readyForPickup={readyForPickup}
            />
          </section>
        </main>
      </div>

      {/* =========================================================
          SMS MODAL
      ========================================================= */}
      <SmsNotificationModal
        isSmsModalOpen={isSmsModalOpen}
        smsJobData={smsJobData}
        generateSmsText={generateSmsText}
        setIsSmsModalOpen={setIsSmsModalOpen}
      />
    </div>
  );
}
