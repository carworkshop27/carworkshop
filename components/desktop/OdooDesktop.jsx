"use client";
import LoggedInUser from "../common/LoggedInUser";

import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Receipt,
  Wallet,
  BookOpen,
  CalendarDays,
  Settings,
  ArrowRight,
  LogOut,
} from "lucide-react";

const applications = [
  {
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    icon: LayoutDashboard,
    color: "bg-violet-600",
    screen: "dashboard",
  },
  {
    name: "In-Take",
    nameAr: "استقبال المركبات",
    icon: ClipboardList,
    color: "bg-blue-600",
    screen: "workshop-intake",
  },
  {
    name: "New Job / Intake",
    nameAr: "أمر عمل جديد / استقبال",
    icon: Wrench,
    color: "bg-blue-600",
    screen: "new-job-intake",
  },
  {
    name: "Job Cards",
    nameAr: "بطاقات العمل",
    icon: ClipboardList,
    color: "bg-orange-500",
    screen: "job-cards",
  },
  {
    name: "Customers",
    nameAr: "العملاء",
    icon: Users,
    color: "bg-cyan-600",
    screen: "customer-records",
  },
  {
    name: "Customer Ledger",
    nameAr: "حسابات العملاء",
    icon: BookOpen,
    color: "bg-indigo-600",
    screen: "customer-ledger",
  },
  {
    name: "Inventory",
    nameAr: "المخزون",
    icon: Package,
    color: "bg-emerald-600",
    screen: "inventory-list",
  },
  {
    name: "Parts Orders",
    nameAr: "طلبات قطع الغيار",
    icon: ShoppingCart,
    color: "bg-amber-600",
    screen: "parts-orders",
  },
  {
    name: "Quotations",
    nameAr: "عروض الأسعار",
    icon: FileText,
    color: "bg-pink-600",
    screen: "quotation-records",
  },
  {
    name: "Sales",
    nameAr: "المبيعات",
    icon: Receipt,
    color: "bg-indigo-600",
    screen: "sales",
  },
  {
    name: "Purchases",
    nameAr: "المشتريات",
    icon: ShoppingCart,
    color: "bg-teal-600",
    screen: "purchase-records",
  },
  {
    name: "Expenses",
    nameAr: "المصروفات",
    icon: Wallet,
    color: "bg-rose-600",
    screen: "expense-records",
  },
  {
    name: "Daily Ledger",
    nameAr: "دفتر الحسابات اليومية",
    icon: BookOpen,
    color: "bg-sky-600",
    screen: "daily-ledger",
  },
  {
    name: "Monthly Ledger",
    nameAr: "دفتر الحسابات الشهرية",
    icon: CalendarDays,
    color: "bg-purple-600",
    screen: "monthly-ledger",
  },
];

export default function OdooDesktop({ setActiveScreen, onLogout, currentUser }) {

  // WORKSHOP_MANAGER_DESKTOP_V1
  const managerApplications = new Set([
    "dashboard",
    "workshop-intake",
    "new-job-intake",
    "job-cards",
    "customer-records",
    "quotation-records",
    "expense-records"
  ]);

  const visibleApplications =
    currentUser?.role === "Manager"
      ? applications.filter((app) =>
          managerApplications.has(app.screen)
        )
      : applications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-violet-50">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="order-last ml-auto">
            <LoggedInUser currentUser={currentUser} />
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="order-last inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            <LogOut className="h-4 w-4" />
            Log Off
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Car Workshop
            </h1>
            <p className="text-sm text-slate-500">
              Workshop Management System
            </p>
          </div>

          <span className="rounded-full bg-violet-100 px-4 py-2 text-xs font-bold text-violet-700">
            Applications
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900">
            Applications
          </h2>
          <p className="mt-2 text-slate-500">
            Select an application to open your workspace.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {visibleApplications.map((app) => {
            const Icon = app.icon;

            return (
              <button
                key={app.name}
                type="button"
                onClick={() => setActiveScreen(app.screen)}
                className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl"
              >
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${app.color} shadow-md`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>

                <div className="flex min-h-[52px] w-full flex-col items-center justify-center gap-1">
                  <span
                    lang="en"
                    className="text-center text-sm font-bold text-slate-800"
                  >
                    {app.name}
                  </span>
                  <span
                    lang="ar"
                    dir="rtl"
                    className="text-center text-xl font-bold leading-relaxed text-slate-600"
                  >
                    {app.nameAr}
                  </span>
                </div>

                <ArrowRight className="mt-3 h-4 w-4 text-slate-300 transition group-hover:text-violet-600" />
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

