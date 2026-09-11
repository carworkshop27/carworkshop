"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  TrendingUp,
  ShoppingCart,
  Receipt,
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
} from "lucide-react";

const DAMAGE_TYPES = {
  ok: 0,
  scratch: 150,
  dent: 300,
  replace: 600,
  light_damage: 100,
  medium_damage: 250,
  large_damage: 400,
  polish: 75,
};

const VAT_RATE = 15;

export default function MonthlyAccountStatement({ setActiveScreen }) {
  const [jobs, setJobs] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const handlePrint = () => {
    setIsCalendarOpen(false);

    setTimeout(() => {
      window.print();
    }, 100);
  };

  const loadStatementData = async () => {
    try {
      setIsLoading(true);
      setError("");

      let storedJobs = [];

      try {
        const stored = localStorage.getItem("autofix_offline_db");
        const parsed = stored ? JSON.parse(stored) : [];
        storedJobs = Array.isArray(parsed) ? parsed : [];
      } catch (jobError) {
        console.error("Failed to read local sales data:", jobError);
      }

      const [purchaseResponse, expenseResponse] = await Promise.all([
        fetch("/api/purchases", {
          cache: "no-store",
        }),
        fetch("/api/expenses", {
          cache: "no-store",
        }),
      ]);

      const purchaseData = await purchaseResponse.json();
      const expenseData = await expenseResponse.json();

      if (!purchaseResponse.ok) {
        throw new Error(
          purchaseData?.error || "Failed to load purchase records.",
        );
      }

      if (!expenseResponse.ok) {
        throw new Error(
          expenseData?.error || "Failed to load expense records.",
        );
      }

      setJobs(storedJobs);
      setPurchases(Array.isArray(purchaseData) ? purchaseData : []);
      setExpenses(Array.isArray(expenseData) ? expenseData : []);
    } catch (err) {
      console.error("Monthly account statement load error:", err);
      setError(err.message || "Failed to load monthly account statement data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStatementData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const getJobMonth = (job) => {
    if (job?.createdAt) {
      const date = new Date(job.createdAt);

      if (!Number.isNaN(date.getTime())) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0",
        )}`;
      }
    }

    const fallbackDate = job?.intakeDate || job?.date;

    if (!fallbackDate) {
      return null;
    }

    const value = String(fallbackDate).trim();

    // Supports DD/MM/YYYY
    const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (slashMatch) {
      const [, day, month, year] = slashMatch;

      return `${year}-${String(month).padStart(2, "0")}`;
    }

    // Supports YYYY-MM-DD
    const dashMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

    if (dashMatch) {
      const [, year, month] = dashMatch;

      return `${year}-${String(month).padStart(2, "0")}`;
    }

    return null;
  };

  const getSalesAmount = (job) => {
    const repairCost = (job?.panels || []).reduce((sum, panel) => {
      const hasCustomCost =
        panel.customRepairCost !== undefined && panel.customRepairCost !== "";

      const cost = hasCustomCost
        ? Number(panel.customRepairCost || 0)
        : Number(DAMAGE_TYPES[panel.status] || 0);

      return sum + cost;
    }, 0);

    const partsCost = (job?.parts || []).reduce(
      (sum, part) => sum + Number(part.price || 0),
      0,
    );

    const electricalCost = (job?.electricalItems || []).reduce(
      (sum, item) => sum + Number(item.cost || 0),
      0,
    );

    const mechanicalCost = (job?.mechanicalItems || []).reduce(
      (sum, item) => sum + Number(item.cost || 0),
      0,
    );

    const subtotal = repairCost + partsCost + electricalCost + mechanicalCost;

    const vat = subtotal * (VAT_RATE / 100);

    return {
      subtotal,
      vat,
      grandTotal: subtotal + vat,
    };
  };

  const availableMonths = useMemo(() => {
    const year = new Date().getFullYear();

    return Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1).padStart(2, "0");

      return `${year}-${month}`;
    });
  }, []);

  const filteredJobs = useMemo(() => {
    if (selectedMonth === "all") {
      return jobs;
    }

    return jobs.filter((job) => getJobMonth(job) === selectedMonth);
  }, [jobs, selectedMonth]);

  const filteredPurchases = useMemo(() => {
    if (selectedMonth === "all") {
      return purchases;
    }

    return purchases.filter(
      (purchase) =>
        String(purchase.purchase_date || "").slice(0, 7) === selectedMonth,
    );
  }, [purchases, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonth === "all") {
      return expenses;
    }

    return expenses.filter(
      (expense) =>
        String(expense.expense_date || "").slice(0, 7) === selectedMonth,
    );
  }, [expenses, selectedMonth]);

  const salesTotals = useMemo(() => {
    return filteredJobs.reduce(
      (summary, job) => {
        const sales = getSalesAmount(job);

        summary.subtotal += sales.subtotal;
        summary.vat += sales.vat;
        summary.grandTotal += sales.grandTotal;

        return summary;
      },
      {
        subtotal: 0,
        vat: 0,
        grandTotal: 0,
      },
    );
  }, [filteredJobs]);

  const purchaseTotals = useMemo(() => {
    return filteredPurchases.reduce(
      (summary, purchase) => {
        summary.subtotal += Number(purchase.subtotal || 0);
        summary.vat += Number(purchase.vat_amount || 0);
        summary.grandTotal += Number(purchase.grand_total || 0);

        return summary;
      },
      {
        subtotal: 0,
        vat: 0,
        grandTotal: 0,
      },
    );
  }, [filteredPurchases]);

  const expenseTotals = useMemo(() => {
    return filteredExpenses.reduce(
      (summary, expense) => {
        summary.subtotal += Number(expense.subtotal || 0);
        summary.vat += Number(expense.vat_amount || 0);
        summary.grandTotal += Number(expense.grand_total || 0);

        return summary;
      },
      {
        subtotal: 0,
        vat: 0,
        grandTotal: 0,
      },
    );
  }, [filteredExpenses]);

  const statementTotals = useMemo(() => {
    const totalOutflow = purchaseTotals.grandTotal + expenseTotals.grandTotal;

    const netBalance = salesTotals.grandTotal - totalOutflow;

    const netVat = salesTotals.vat - purchaseTotals.vat - expenseTotals.vat;

    return {
      totalOutflow,
      netBalance,
      netVat,
    };
  }, [salesTotals, purchaseTotals, expenseTotals]);

  const formatAmount = (value) => {
    return Number(value || 0).toLocaleString("en-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB");
  };

  const formatMonth = (value) => {
    if (!value) {
      return "All Months";
    }

    const [year, month] = value.split("-");

    const date = new Date(Number(year), Number(month) - 1, 1);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const selectMonth = (monthIndex) => {
    const month = String(monthIndex + 1).padStart(2, "0");

    setSelectedMonth(`${calendarYear}-${month}`);
    setIsCalendarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          html,
          body {
            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          main {
            padding: 0 !important;
          }

          main > div:first-child {
            margin-bottom: 12px !important;
          }

          main > div:first-child h1 {
            font-size: 24px !important;
          }

          main > div:first-child p {
            font-size: 11px !important;
          }

          main > div:nth-child(2) {
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          main > div:nth-child(2) > div {
            padding: 14px !important;
          }

          main > div:nth-child(2) > div:first-child {
            padding: 12px 14px !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          @page {
            margin-top: 8mm;
            margin-bottom: 8mm;
          }
        }
      `}</style>
      <main className="px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Monthly Account Statement
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Review monthly sales, purchases, expenses, and net account
              balance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveScreen("dashboard")}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-bold
              text-slate-700
              shadow-sm
              transition-all
              hover:border-blue-300
              hover:bg-blue-50
              hover:text-blue-700
print:hidden
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Statement Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Account Statement
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {selectedMonth === "all"
                    ? "All recorded financial activity."
                    : `Statement for ${formatMonth(selectedMonth)}.`}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen((open) => !open)}
                  className="
      inline-flex
      h-[62px]
      min-w-[220px]
      items-center
      justify-between
      gap-4
      rounded-2xl
      border
      border-slate-200
      bg-white
      px-5
      text-base
      font-black
      text-slate-700
      shadow-sm
      transition
      hover:border-blue-300
      hover:bg-blue-50
    "
                >
                  <span className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-blue-600" />

                    <span>
                      {selectedMonth === "all"
                        ? "All Months"
                        : selectedMonth.slice(5, 7) +
                          "/" +
                          selectedMonth.slice(0, 4)}
                    </span>
                  </span>

                  <span className="text-slate-500">▼</span>
                </button>

                {isCalendarOpen && (
                  <div
                    className="
      absolute
      right-0
      top-[72px]
      z-50
      w-[380px]
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-xl
    "
                  >
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCalendarYear((year) => year - 1)}
                        className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            text-slate-600
            transition
            hover:bg-slate-100
            hover:text-blue-600
          "
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <span className="text-xl font-black text-slate-900">
                        {calendarYear}
                      </span>

                      <button
                        type="button"
                        onClick={() => setCalendarYear((year) => year + 1)}
                        className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            text-slate-600
            transition
            hover:bg-slate-100
            hover:text-blue-600
          "
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* All Months */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMonth("all");
                        setIsCalendarOpen(false);
                      }}
                      className={`
          mt-4
          w-full
          rounded-xl
          px-4
          py-3
          text-sm
          font-black
          transition
          ${
            selectedMonth === "all"
              ? "bg-blue-600 text-white"
              : "bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
          }
        `}
                    >
                      All Months
                    </button>

                    {/* Month Grid */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {monthNames.map((monthName, index) => {
                        const monthValue = `${calendarYear}-${String(
                          index + 1,
                        ).padStart(2, "0")}`;

                        const isSelected = selectedMonth === monthValue;

                        return (
                          <button
                            key={monthValue}
                            type="button"
                            onClick={() => selectMonth(index)}
                            className={`
                rounded-xl
                px-2
                py-3
                text-sm
                font-bold
                transition
                ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                }
              `}
                          >
                            {monthName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="
                  inline-flex
                  h-[62px]
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-base
                  font-black
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-blue-300
                  hover:bg-blue-50
                  hover:text-blue-700
                  print:hidden
                "
              >
                <Printer className="h-5 w-5 text-blue-600" />
                Print
              </button>

              <button
                type="button"
                onClick={loadStatementData}
                disabled={isLoading}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-2.5
                  text-sm
                  font-black
                  text-white
                  shadow-sm
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Statement Period */}
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Statement Period
              </span>

              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                {formatMonth(selectedMonth)}
              </span>
            </div>
          </div>

          {/* Main Financial Cards */}
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
            {/* Sales */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>

                <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                  Total Sales
                </p>
              </div>

              <p className="mt-4 text-2xl font-black text-emerald-700">
                ﷼ {formatAmount(salesTotals.grandTotal)}
              </p>

              <p className="mt-1 text-xs font-medium text-emerald-600">
                Including VAT
              </p>
            </div>

            {/* Purchases */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                  <ShoppingCart className="h-5 w-5 text-slate-600" />
                </div>

                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Total Purchases
                </p>
              </div>

              <p className="mt-4 text-2xl font-black text-slate-900">
                ﷼ {formatAmount(purchaseTotals.grandTotal)}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Including VAT
              </p>
            </div>

            {/* Expenses */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                  <Receipt className="h-5 w-5 text-slate-600" />
                </div>

                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Total Expenses
                </p>
              </div>

              <p className="mt-4 text-2xl font-black text-slate-900">
                ﷼ {formatAmount(expenseTotals.grandTotal)}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Including VAT
              </p>
            </div>
          </div>

          {/* Formula */}
          <div className="mx-6 mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Monthly Account Calculation
                </h3>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Sales minus purchases and expenses.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="text-xs font-black uppercase text-emerald-700">
                  Total Sales
                </p>
                <p className="mt-1 text-lg font-black text-emerald-700">
                  ﷼ {formatAmount(salesTotals.grandTotal)}
                </p>
              </div>

              <span className="text-center text-xl font-black text-slate-400">
                −
              </span>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-black uppercase text-slate-500">
                  Purchases
                </p>
                <p className="mt-1 text-lg font-black text-slate-900">
                  ﷼ {formatAmount(purchaseTotals.grandTotal)}
                </p>
              </div>

              <span className="text-center text-xl font-black text-slate-400">
                −
              </span>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-black uppercase text-slate-500">
                  Expenses
                </p>
                <p className="mt-1 text-lg font-black text-slate-900">
                  ﷼ {formatAmount(expenseTotals.grandTotal)}
                </p>
              </div>

              <span className="text-center text-xl font-black text-slate-400">
                =
              </span>

              <div
                className={`rounded-xl border p-4 text-center ${
                  statementTotals.netBalance >= 0
                    ? "border-blue-200 bg-blue-50"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                <p
                  className={`text-xs font-black uppercase ${
                    statementTotals.netBalance >= 0
                      ? "text-blue-700"
                      : "text-rose-700"
                  }`}
                >
                  Net Account Balance
                </p>

                <p
                  className={`mt-1 text-xl font-black ${
                    statementTotals.netBalance >= 0
                      ? "text-blue-700"
                      : "text-rose-700"
                  }`}
                >
                  ﷼ {formatAmount(statementTotals.netBalance)}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="border-t border-slate-200 p-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Financial Breakdown
            </h3>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      Account
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                      Without VAT
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                      VAT
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                      Grand Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-5 py-4 text-sm font-black text-emerald-700">
                      Sales
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-bold text-slate-700">
                      ﷼ {formatAmount(salesTotals.subtotal)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-bold text-slate-700">
                      ﷼ {formatAmount(salesTotals.vat)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-black text-emerald-700">
                      ﷼ {formatAmount(salesTotals.grandTotal)}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-5 py-4 text-sm font-black text-slate-800">
                      Purchases
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-bold text-slate-700">
                      ﷼ {formatAmount(purchaseTotals.subtotal)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-bold text-slate-700">
                      ﷼ {formatAmount(purchaseTotals.vat)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-black text-slate-900">
                      ﷼ {formatAmount(purchaseTotals.grandTotal)}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-5 py-4 text-sm font-black text-slate-800">
                      Expenses
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-bold text-slate-700">
                      ﷼ {formatAmount(expenseTotals.subtotal)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-bold text-slate-700">
                      ﷼ {formatAmount(expenseTotals.vat)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-black text-slate-900">
                      ﷼ {formatAmount(expenseTotals.grandTotal)}
                    </td>
                  </tr>

                  <tr className="border-t-2 border-slate-300 bg-slate-50">
                    <td className="px-5 py-4 text-sm font-black text-slate-900">
                      Net Account Balance
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-black text-slate-700">
                      ﷼{" "}
                      {formatAmount(
                        salesTotals.subtotal -
                          purchaseTotals.subtotal -
                          expenseTotals.subtotal,
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-black text-slate-700">
                      ﷼ {formatAmount(statementTotals.netVat)}
                    </td>

                    <td
                      className={`px-5 py-4 text-right text-lg font-black ${
                        statementTotals.netBalance >= 0
                          ? "text-blue-700"
                          : "text-rose-700"
                      }`}
                    >
                      ﷼ {formatAmount(statementTotals.netBalance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="grid grid-cols-1 gap-4 border-t border-slate-200 p-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                Sales Transactions
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {filteredJobs.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                Purchase Transactions
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {filteredPurchases.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                Expense Transactions
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {filteredExpenses.length}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="border-t border-slate-200 p-8 text-center">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600" />

              <p className="mt-3 text-sm font-bold text-slate-500">
                Loading account statement...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
