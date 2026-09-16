"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ArrowLeft, CalendarDays } from "lucide-react";

export default function DailyLedger({
  jobs,
  getDamageInfo,
  handleOpenInvoice,
  setActiveScreen,
}) {
  const today = new Date();
  const formattedToday = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
    today.getDate(),
  ).padStart(2, "0")}/${today.getFullYear()}`;

  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`,
  );

  const dateInputRef = useRef(null);

  const [savedInvoices, setSavedInvoices] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadInvoices = async () => {
      try {
        const response = await fetch("/api/invoices");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load invoices.");
        }

        if (!cancelled) {
          setSavedInvoices(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Load daily ledger invoices error:", error);
      }
    };

    loadInvoices();

    return () => {
      cancelled = true;
    };
  }, []);

  const calculateInvoice = (job) => {
    const repairCost = (job.panels || [])
      .filter((panel) => panel.status !== "ok")
      .reduce(
        (sum, panel) =>
          sum +
          (panel.customRepairCost !== undefined && panel.customRepairCost !== ""
            ? Number(panel.customRepairCost)
            : Number(getDamageInfo(panel.status).cost || 0)),
        0,
      );

    const partsCost = (job.parts || []).reduce(
      (sum, part) => sum + Number(part.price || 0),
      0,
    );

    const electricalCost = (job.electricalItems || []).reduce(
      (sum, item) => sum + Number(item.cost || 0),
      0,
    );

    const mechanicalCost = (job.mechanicalItems || []).reduce(
      (sum, item) => sum + Number(item.cost || 0),
      0,
    );

    const subtotal = repairCost + partsCost + electricalCost + mechanicalCost;

    const vat = subtotal * 0.15;
    const grandTotal = subtotal + vat;

    return {
      subtotal,
      vat,
      grandTotal,
    };
  };

  const selectedJobs = jobs.filter((job) => {
    const jobDateValue = job.createdAt || job.date || job.created_at;

    if (!jobDateValue) {
      return false;
    }

    const jobDate = new Date(jobDateValue);

    if (Number.isNaN(jobDate.getTime())) {
      return false;
    }

    const jobDateString = `${String(jobDate.getMonth() + 1).padStart(2, "0")}/${String(
      jobDate.getDate(),
    ).padStart(2, "0")}/${jobDate.getFullYear()}`;

    const selectedDateParts = selectedDate.split("-");
    const selectedDateString = `${selectedDateParts[1]}/${selectedDateParts[2]}/${selectedDateParts[0]}`;

    return jobDateString === selectedDateString;
  });

  const selectedInvoices = savedInvoices.filter((invoice) => {
    if (!invoice.invoice_date) {
      return false;
    }

    const invoiceDate = new Date(invoice.invoice_date);

    if (Number.isNaN(invoiceDate.getTime())) {
      return false;
    }

    const invoiceDateString = `${invoiceDate.getFullYear()}-${String(
      invoiceDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(invoiceDate.getDate()).padStart(2, "0")}`;

    return invoiceDateString === selectedDate;
  });

  const ledgerRows = [
    ...selectedJobs.map((job) => ({
      type: "job",
      id: job.id,
      job,
      subtotal: calculateInvoice(job).subtotal,
      vat: calculateInvoice(job).vat,
      grandTotal: calculateInvoice(job).grandTotal,
    })),
    ...selectedInvoices.map((invoice) => ({
      type: "quotation-invoice",
      id: invoice.id,
      invoice,
      displayNumber: invoice.invoice_no || invoice.quotation_no,
      subtotal: Number(invoice.subtotal || 0),
      vat: Number(invoice.vat_amount || 0),
      grandTotal: Number(invoice.total_amount || 0),
    })),
  ];

  const totalEarnings = ledgerRows.reduce(
    (total, row) => total + row.grandTotal,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Daily Ledger</h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Daily sales and invoice transactions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveScreen("sales")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sales
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker?.()}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <CalendarDays className="h-5 w-5 text-blue-600" />

              <span className="text-sm font-bold text-slate-700">
                {selectedDate.split("-").reverse().join("/")}
              </span>

              <span className="ml-1 text-xs text-slate-500">▼</span>
            </button>

            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Select date"
            />
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Total Earnings
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              ⃁{totalEarnings.toFixed(2)}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              Including VAT
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-600">
                    S.No
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-600">
                    Job Card No.
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-600">
                    Invoice Total Without VAT
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-600">
                    Invoice VAT
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-600">
                    Invoice Total + VAT
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-600">
                    Invoice
                  </th>
                </tr>
              </thead>

              <tbody>
                {ledgerRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 text-center text-sm font-semibold text-slate-400"
                    >
                      No sales transactions available.
                    </td>
                  </tr>
                ) : (
                  ledgerRows.map((row, index) => (
                    <tr
                      key={`${row.type}-${row.id}`}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-bold text-slate-700">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-black text-blue-600">
                        {row.type === "job" ? row.id : row.displayNumber}
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-slate-700">
                        ⃁{row.subtotal.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-slate-700">
                        ⃁{row.vat.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-right font-black text-slate-900">
                        ⃁{row.grandTotal.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {row.type === "job" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenInvoice(row.job)}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-indigo-700"
                          >
                            <FileText className="h-4 w-4" />
                            Invoice
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-indigo-700"
                          >
                            <FileText className="h-4 w-4" />
                            Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
