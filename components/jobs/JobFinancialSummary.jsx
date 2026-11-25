"use client";

import { useEffect, useState } from "react";
import { CreditCard, RefreshCw } from "lucide-react";

function money(value) {
  if (value === null || value === undefined) {
    return "Not confirmed";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Unavailable";
  }

  return "SAR " + amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function FinancialField({ label, value, color = "text-slate-900" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p className={`mt-2 text-xl font-black ${color}`}>
        {value}
      </p>
    </div>
  );
}

export default function JobFinancialSummary({
  jobId,
  currentRepairCost
}) {
  const [financial, setFinancial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setFinancial(null);
    setLoading(true);
    setError("");

    async function loadFinancialSummary() {
      try {
        const response = await fetch(
          `/api/jobs/financial-summary?jobId=${encodeURIComponent(jobId)}`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Unable to load financial information."
          );
        }

        if (result.financial?.job_id !== jobId) {
          throw new Error("Job Card financial reference mismatch.");
        }

        if (!controller.signal.aborted) {
          setFinancial(result.financial);
        }

      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error.message || "Unable to load financial information."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadFinancialSummary();

    return () => controller.abort();

  }, [jobId, refresh]);

  const current =
    financial?.job_id === jobId ? financial : null;

  const paymentStatus =
    current?.calculated_payment_status;

  const statusColor =
    paymentStatus === "Paid"
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : paymentStatus === "Partially Paid"
        ? "bg-amber-100 text-amber-800 border-amber-300"
        : paymentStatus === "Unpaid"
          ? "bg-rose-100 text-rose-800 border-rose-300"
          : "bg-blue-100 text-blue-800 border-blue-300";

  return (
    <section className="bg-white rounded-2xl border border-slate-300 p-6 shadow-md space-y-5">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="bg-blue-100 p-3 rounded-xl text-blue-700">
            <CreditCard className="w-6 h-6" />
          </div>

          <div>
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Payment Status
            </p>

            {current && !loading && (
              <span className={`inline-block mt-1 px-3 py-1 rounded-full border text-xs font-black uppercase ${statusColor}`}>
                {paymentStatus}
              </span>
            )}

            {loading && (
              <p className="text-sm text-slate-500">
                Loading financial information...
              </p>
            )}

            {error && (
              <p className="text-sm font-bold text-rose-700">
                Financial information unavailable
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setFinancial(null);
            setLoading(true);
            setRefresh((value) => value + 1);
          }}
          className="print:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Balance
        </button>

      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {error}
        </div>
      )}

      {current && !loading && !error && (
        <>

          <div className="rounded-xl bg-slate-900 text-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Outstanding Balance
            </p>

            <p className="mt-2 text-3xl font-black">
              {money(current.outstanding_balance)}
            </p>

            <p className="mt-1 text-xs text-slate-300">
              {current.cost_status === "PROVISIONAL"
                ? "Based on provisional In-Take estimate"
                : "Based on confirmed final cost"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <FinancialField
              label="Approximate In-Take Cost"
              value={money(current.approximate_cost)}
              color="text-blue-700"
            />

            <FinancialField
              label="Current Repair Cost"
              value={money(currentRepairCost)}
            />

            <FinancialField
              label="Confirmed Final Cost"
              value={money(current.confirmed_final_cost)}
            />

            <FinancialField
              label="Total Amount Paid"
              value={money(current.total_paid)}
              color="text-emerald-700"
            />

          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">

            <p className="text-xs font-semibold text-slate-500">
              Cost Status: {current.cost_status}
              {" | "}
              All amounts excluding VAT
            </p>

            <p className="text-xs font-semibold text-slate-500">
              Payment status is calculated from the Customer Ledger.
            </p>

          </div>

          <div className="print:hidden rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
            Final cost confirmation and payment recording will be
            available after secure financial transaction integration.
          </div>

        </>
      )}

    </section>
  );
}
