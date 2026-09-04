"use client";

import { ArrowLeft, FileText } from "lucide-react";

export default function Sales({ setActiveScreen }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Page Content */}
      <main className="px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Sales</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Manage sales ledgers and invoice history.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveScreen("dashboard")}
            className="
      inline-flex
      items-center
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
    "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Sales Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Daily Ledger */}
          <button
            type="button"
            className="
              group
              bg-white
              rounded-2xl
              border
              border-slate-200
              p-6
              shadow-sm
              text-left
              transition-all
              hover:border-blue-300
              hover:shadow-md
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                w-12
                h-12
                rounded-xl
                bg-blue-50
                flex
                items-center
                justify-center
                shrink-0
              "
              >
                <FileText className="w-6 h-6 text-blue-600" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Daily Ledger
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  View daily sales transactions.
                </p>
              </div>
            </div>
          </button>

          {/* Monthly Ledger */}
          <button
            type="button"
            className="
              group
              bg-white
              rounded-2xl
              border
              border-slate-200
              p-6
              shadow-sm
              text-left
              transition-all
              hover:border-blue-300
              hover:shadow-md
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                w-12
                h-12
                rounded-xl
                bg-blue-50
                flex
                items-center
                justify-center
                shrink-0
              "
              >
                <FileText className="w-6 h-6 text-blue-600" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Monthly Ledger
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  View monthly sales transactions.
                </p>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
