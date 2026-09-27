"use client";

import { Search, ShieldCheck, UserPlus, LogOut, Menu, X } from "lucide-react";

export default function DashboardHeader({
  currentUser,
  mobileMenuOpen,
  setMobileMenuOpen,
  searchTerm,
  setSearchTerm,
  setIsUserModalOpen,
  handleResetData,
  handleLogout,
}) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[76px] flex items-center justify-between gap-5">
          {/* =========================================================
              LOGO
          ========================================================= */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="workshop-sidebar"
            className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

<div className="flex items-center shrink-0">
            <img
              src="/images/garage-logo.png"
              alt="Garage Altalaa Fakhir"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* =========================================================
              SEARCH
          ========================================================= */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />

              <input
                type="text"
                placeholder="Search customer, plate number, vehicle or job..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full
                  bg-slate-50
                  text-sm
                  text-slate-900
                  font-medium
                  pl-11
                  pr-4
                  py-3
                  rounded-xl
                  border
                  border-slate-200
                  outline-none
                  transition
                  focus:bg-white
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                  placeholder:text-slate-400
                "
              />
            </div>
          </div>

          {/* =========================================================
              USER CONTROLS
          ========================================================= */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Current User */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  currentUser.role === "Super User"
                    ? "bg-purple-100"
                    : "bg-emerald-100"
                }`}
              >
                <ShieldCheck
                  className={`w-5 h-5 ${
                    currentUser.role === "Super User"
                      ? "text-purple-600"
                      : "text-emerald-600"
                  }`}
                />
              </div>

              <div className="text-left leading-tight">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Logged in as
                </p>

                <p className="text-xs font-black text-slate-900">
                  {currentUser.name}
                </p>

                <p className="text-[10px] font-bold text-slate-500">
                  {currentUser.role}
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Log Out"
              className="
                h-10
                px-3
                rounded-xl
                bg-rose-600
                hover:bg-rose-700
                text-white
                text-xs
                font-bold
                flex
                items-center
                gap-2
                shadow-sm
                transition
              "
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
