"use client";

export default function Sales({ setActiveScreen }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Sales</h1>
          <p className="mt-1 text-slate-500">
            Manage sales and financial ledgers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveScreen("daily-ledger")}
            className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-slate-900">Daily Ledger</h2>
            <p className="mt-2 text-sm text-slate-500">
              View and manage daily sales transactions.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveScreen("daily-ledger")}
            className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-slate-900">Daily Ledger</h2>
            <p className="mt-2 text-sm text-slate-500">
              View and manage daily sales transactions.
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}
