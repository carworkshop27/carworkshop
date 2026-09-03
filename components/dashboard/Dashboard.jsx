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
  customers,
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

  const jobs = Array.isArray(filteredJobs) ? filteredJobs : [];

  const normalizeStatus = (status) => {
    return String(status || "")
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  };

  const getJobStatusLabel = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "inspection") return "Inspection";
    if (normalized === "in_repair" || normalized === "repair")
      return "In Repair";
    if (normalized === "ready" || normalized === "ready_for_pickup") {
      return "Ready";
    }
    if (normalized === "on_hold" || normalized === "hold") return "On Hold";
    if (normalized === "completed" || normalized === "complete") {
      return "Completed";
    }

    return status || "New";
  };

  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "inspection") {
      return "bg-blue-50 text-blue-600 border-blue-200";
    }

    if (normalized === "in_repair" || normalized === "repair") {
      return "bg-orange-50 text-orange-600 border-orange-200";
    }

    if (
      normalized === "ready" ||
      normalized === "ready_for_pickup" ||
      normalized === "completed" ||
      normalized === "complete"
    ) {
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    }

    if (normalized === "on_hold" || normalized === "hold") {
      return "bg-slate-100 text-slate-600 border-slate-300";
    }

    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const activeJobs = jobs.filter((job) => {
    const status = normalizeStatus(job.status);

    return (
      status === "inspection" || status === "in_repair" || status === "repair"
    );
  }).length;

  const readyJobs = jobs.filter((job) => {
    const status = normalizeStatus(job.status);

    return (
      status === "ready" ||
      status === "ready_for_pickup" ||
      status === "completed" ||
      status === "complete"
    );
  }).length;

  const onHoldJobs = jobs.filter((job) => {
    const status = normalizeStatus(job.status);

    return status === "on_hold" || status === "hold";
  }).length;

  const inspectionJobs = jobs.filter((job) => {
    const status = normalizeStatus(job.status);

    return (
      status === "inspection" ||
      status === "inspection_&_body_check" ||
      status === "inspection_and_body_check"
    );
  }).length;

  const inRepairJobs = jobs.filter((job) => {
    const rawStatus = String(job.status || "")
      .trim()
      .toLowerCase();
    const status = normalizeStatus(job.status);

    return (
      status === "in_repair" ||
      status === "repair" ||
      rawStatus === "in repair / workshop"
    );
  }).length;

  const uniqueCustomers = new Set(
    jobs
      .map(
        (job) =>
          job.customerId ||
          job.customerEmail ||
          job.customerMobile ||
          job.customerName ||
          job.owner,
      )
      .filter(Boolean),
  );

  const customerCount = uniqueCustomers.size;

  const paidJobs = jobs.filter((job) => {
    const paymentStatus = String(job.paymentStatus || "").toLowerCase();

    return paymentStatus === "paid" || job.paid === true || job.isPaid === true;
  });

  const paidRevenue = paidJobs.reduce((sum, job) => {
    const panelCost = (job.panels || []).reduce((panelSum, panel) => {
      const defaultCosts = {
        ok: 0,
        scratch: 150,
        dent: 300,
        replace: 600,
        light_damage: 100,
        medium_damage: 250,
        large_damage: 400,
        polish: 75,
      };

      const panelCost =
        panel.customRepairCost !== undefined && panel.customRepairCost !== ""
          ? Number(panel.customRepairCost)
          : Number(defaultCosts[panel.status] || 0);

      return panelSum + panelCost;
    }, 0);

    const partsCost = (job.parts || []).reduce(
      (partsSum, part) => partsSum + Number(part.price || 0),
      0,
    );

    const electricalCost = (job.electricalItems || []).reduce(
      (electricalSum, item) => electricalSum + Number(item.cost || 0),
      0,
    );

    const mechanicalCost = (job.mechanicalItems || []).reduce(
      (mechanicalSum, item) => mechanicalSum + Number(item.cost || 0),
      0,
    );

    return sum + panelCost + partsCost + electricalCost + mechanicalCost;
  }, 0);

  const unpaidRevenue = Math.max(Number(totalRevenue || 0) - paidRevenue, 0);

  const recentJobs = [...jobs]
    .sort((a, b) => {
      const dateA = new Date(
        a.updatedAt || a.createdAt || a.intakeDate || 0,
      ).getTime();

      const dateB = new Date(
        b.updatedAt || b.createdAt || b.intakeDate || 0,
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  const recentCustomers =
    Array.isArray(customers) && customers.length > 0
      ? customers.slice(0, 5).map((customer) => ({
          name: customer.name || customer.customer_name || "N/A",
          mobile:
            customer.mobile ||
            customer.phone ||
            customer.customer_mobile ||
            "N/A",
          email: customer.email || customer.customer_email || "N/A",
        }))
      : jobs.slice(0, 5).map((job) => ({
          name: job.owner || "N/A",
          mobile: job.phone || "N/A",
          email: job.email || "N/A",
        }));

  const totalPaymentRevenue = paidRevenue + unpaidRevenue;

  const paidPercentage =
    totalPaymentRevenue > 0
      ? Math.round((paidRevenue / totalPaymentRevenue) * 100)
      : 0;

  const unpaidPercentage = totalPaymentRevenue > 0 ? 100 - paidPercentage : 0;

  const formatMoney = (amount) => {
    return `⃁ ${Number(amount || 0).toLocaleString("en-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleDateString("en-GB");
  };

  const today = new Date();

  const dashboardDate = today.toLocaleDateString("en-GB");
  const dashboardTime = today.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
              DASHBOARD HEADER
          ===================================================== */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Overview of workshop operations
              </p>
            </div>

            <div className="flex gap-3">
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Date
                </p>

                <p className="text-sm font-black text-slate-800 mt-1">
                  {dashboardDate}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Time
                </p>

                <p className="text-sm font-black text-slate-800 mt-1">
                  {dashboardTime}
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              SUMMARY CARDS
          ===================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
            {/* Total Job Cards */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase text-slate-400">
                    Total Job Cards
                  </p>

                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {jobs.length}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">All time</p>
                </div>
              </div>
            </div>

            {/* Active Jobs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Car className="w-6 h-6 text-emerald-600" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase text-slate-400">
                    Active Jobs
                  </p>

                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {activeJobs}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">In progress</p>
                </div>
              </div>
            </div>

            {/* Ready */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-orange-500" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase text-slate-400">
                    Ready for Pickup
                  </p>

                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {readyJobs}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">Completed</p>
                </div>
              </div>
            </div>

            {/* Customers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase text-slate-400">
                    Total Customers
                  </p>

                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {customerCount}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">All time</p>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-500" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-slate-400">
                    Total Revenue
                  </p>

                  <p className="text-xl font-black text-slate-900 mt-1 truncate">
                    {formatMoney(totalRevenue)}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">All time</p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              RECENT JOBS + PAYMENT OVERVIEW
          ===================================================== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
            {/* Recent Jobs */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />

                  <h2 className="font-black text-blue-600">Recent Job Cards</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveScreen("job-cards")}
                  className="px-3 py-1.5 text-xs font-black text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500">
                        Job Card
                      </th>

                      <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500">
                        Customer
                      </th>

                      <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500">
                        Vehicle
                      </th>

                      <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500">
                        Status
                      </th>

                      <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentJobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleSelectJob(job.id)}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            {job.id || "N/A"}
                          </button>
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-700">
                          {job.owner || "N/A"}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {job.carMake || job.make || ""} {job.model || ""}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full border text-[11px] font-black ${getStatusClass(
                              job.status,
                            )}`}
                          >
                            {getJobStatusLabel(job.status)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-500">
                          {formatDate(
                            job.updatedAt || job.createdAt || job.intakeDate,
                          )}
                        </td>
                      </tr>
                    ))}

                    {recentJobs.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-10 text-center text-sm text-slate-400"
                        >
                          No job cards available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center px-5 py-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveScreen("job-cards")}
                  className="px-4 py-2 text-xs font-black text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  View All Job Cards
                </button>
              </div>
            </section>

            {/* Payment Overview */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />

                  <h2 className="font-black text-blue-600">
                    Payment Status Overview
                  </h2>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-10 p-8">
                <div
                  className="w-52 h-52 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(
                      #ef4444 0 ${unpaidPercentage}%,
                      #10b981 ${unpaidPercentage}% 100%
                    )`,
                  }}
                >
                  <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-xs font-black text-slate-400">
                      TOTAL
                    </span>

                    <span className="text-lg font-black text-slate-900 mt-1">
                      {formatMoney(totalPaymentRevenue)}
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />

                      <span className="font-black text-slate-700">Unpaid</span>
                    </div>

                    <p className="text-sm text-slate-500 mt-1 ml-5">
                      {formatMoney(unpaidRevenue)} ({unpaidPercentage}%)
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />

                      <span className="font-black text-slate-700">Paid</span>
                    </div>

                    <p className="text-sm text-slate-500 mt-1 ml-5">
                      {formatMoney(paidRevenue)} ({paidPercentage}%)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveScreen("job-cards")}
                    className="px-5 py-2 text-xs font-black text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    View Payments
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* =====================================================
              JOB STATUS + RECENT CUSTOMERS
          ===================================================== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Jobs by Status */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />

                  <h2 className="font-black text-blue-600">Jobs by Status</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-end justify-around gap-5 h-64 border-b border-slate-200">
                  {[
                    {
                      label: "Inspection",
                      value: inspectionJobs,
                      className: "bg-blue-500",
                    },
                    {
                      label: "In Repair",
                      value: inRepairJobs,
                      className: "bg-orange-500",
                    },
                    {
                      label: "Ready for Pickup",
                      value: readyJobs,
                      className: "bg-emerald-500",
                    },
                    {
                      label: "On Hold",
                      value: onHoldJobs,
                      className: "bg-slate-500",
                    },
                  ].map((item) => {
                    const maxValue = Math.max(
                      inspectionJobs,
                      inRepairJobs,
                      readyJobs,
                      onHoldJobs,
                      1,
                    );

                    const height = Math.max(
                      (item.value / maxValue) * 180,
                      item.value > 0 ? 12 : 4,
                    );

                    return (
                      <div
                        key={item.label}
                        className="flex-1 h-full flex flex-col items-center justify-end"
                      >
                        <span className="text-sm font-black text-slate-700 mb-2">
                          {item.value}
                        </span>

                        <div
                          className={`w-full max-w-16 rounded-t-lg ${item.className}`}
                          style={{ height: `${height}px` }}
                        />

                        <span className="text-[11px] font-bold text-slate-500 text-center mt-3">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Recent Customers */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />

                  <h2 className="font-black text-blue-600">Recent Customers</h2>
                </div>

                <button
                  type="button"
                  onClick={() => scrollToSection("active-vehicles")}
                  className="px-3 py-1.5 text-xs font-black text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500">
                        Customer
                      </th>

                      <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500">
                        Mobile
                      </th>

                      <th className="px-4 py-3 text-[11px] font-black uppercase text-slate-500">
                        Email
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentCustomers.map((customer, index) => (
                      <tr
                        key={`${customer.email}-${index}`}
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-3 font-bold text-slate-700">
                          {customer.name}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {customer.mobile}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {customer.email}
                        </td>
                      </tr>
                    ))}

                    {recentCustomers.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-10 text-center text-sm text-slate-400"
                        >
                          No customers available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center px-5 py-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => scrollToSection("active-vehicles")}
                  className="px-4 py-2 text-xs font-black text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  View All Customers
                </button>
              </div>
            </section>
          </div>
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
