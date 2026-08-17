"use client";

import {
  Wrench,
  Search,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  LogOut,
} from "lucide-react";

export default function DashboardHeader({
  currentUser,
  searchTerm,
  setSearchTerm,
  setIsUserModalOpen,
  handleResetData,
  handleLogout,
}) {
  return (
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
                className={`w-4 h-4 ${
                  currentUser.role === "Super User"
                    ? "text-purple-400"
                    : "text-emerald-400"
                }`}
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
  );
}
