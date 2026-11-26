"use client";
import LoggedInUser from "../common/LoggedInUser";

import { useState } from "react";
import {
  House,
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const groups = [
  {
    title: "WORKSHOP",
    items: [
      { label: "Dashboard", screen: "dashboard", icon: LayoutDashboard },
      { label: "In-Take", labelAr: "استقبال المركبات", screen: "workshop-intake", icon: ClipboardList },
      { label: "New Job / Intake", screen: "new-job-intake", icon: Wrench },
      { label: "Job Cards", screen: "job-cards", icon: ClipboardList },
      { label: "Customers", screen: "customer-records", icon: Users },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      { label: "Inventory", screen: "inventory-list", icon: Package },
      { label: "Parts Orders", screen: "parts-orders", icon: ShoppingCart },
    ],
  },
  {
    title: "ACCOUNTS",
    items: [
      { label: "Quotations", screen: "quotation-records", icon: FileText },
      { label: "Sales", screen: "sales", icon: Receipt },
      { label: "Purchases", screen: "purchase-records", icon: ShoppingCart },
      { label: "Expenses", screen: "expense-records", icon: Wallet },
      { label: "Customer Ledger", screen: "customer-ledger", icon: BookOpen },
      { label: "Customer Statement", screen: "customer-statement", icon: BookOpen },
      { label: "Daily Ledger", screen: "daily-ledger", icon: BookOpen },
      { label: "Monthly Ledger", screen: "monthly-ledger", icon: CalendarDays },
    ],
  },
];

export default function OdooModuleLayout({
  activeScreen,
  setActiveScreen,
  currentUser,
  children,
}) {
  const isManager = currentUser?.role === "Manager";

  const managerScreens = new Set([
    "dashboard",
    "workshop-intake",
    "new-job-intake",
    "job-cards",
    "customer-records",
    "quotation-records",
    "expense-records",
  ]);

  const visibleGroups = isManager
    ? groups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => managerScreens.has(item.screen)
          ),
        }))
        .filter((group) => group.items.length > 0)
    : groups;

  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    WORKSHOP: true,
    INVENTORY: true,
    ACCOUNTS: true,
  });

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside
        className={`shrink-0 border-r border-slate-200 bg-white transition-all duration-200 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            {!collapsed && (
              <span className="font-black text-violet-700">
                Car Workshop
              </span>
            )}

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-lg p-2 hover:bg-slate-100"
              title="Toggle Sidebar"
            >
              {collapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveScreen("desktop")}
            className="mx-3 mt-4 flex items-center gap-3 rounded-xl bg-violet-600 px-3 py-3 font-bold text-white hover:bg-violet-700"
            title="Desktop Home"
          >
            <House size={20} />
            {!collapsed && <span>Desktop Home</span>}
          </button>

          <nav className="mt-5 flex-1 space-y-3 overflow-y-auto px-3 pb-6">
            {visibleGroups.map((group) => (
              <div key={group.title}>
                {!collapsed && (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((previous) => ({
                        ...previous,
                        [group.title]: !previous[group.title],
                      }))
                    }
                    className="w-full px-3 py-2 text-left text-xs font-black tracking-wider text-slate-400"
                  >
                    {group.title}
                    <span className="float-right">
                      {openGroups[group.title] ? "−" : "+"}
                    </span>
                  </button>
                )}

                {(collapsed || openGroups[group.title]) &&
                  group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.screen}
                        type="button"
                        onClick={() => setActiveScreen(item.screen)}
                        title={item.label}
                        className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                          activeScreen === item.screen
                            ? "bg-violet-100 text-violet-700"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Icon size={19} />
                        {!collapsed && (
                          <div>
                            <div>{item.label}</div>
                            {item.labelAr && (
                              <div lang="ar" className="text-lg font-bold">
                                {item.labelAr}
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="print:hidden flex flex-wrap items-center justify-end border-b border-slate-200 bg-white px-4 py-2">
          <LoggedInUser currentUser={currentUser} />
        </div>

        {children}
      </div>
    </div>
  );
}
