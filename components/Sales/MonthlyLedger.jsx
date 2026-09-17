"use client";

import { useEffect, useState } from "react";
import { FileText, ArrowLeft, CalendarDays } from "lucide-react";

export default function MonthlyLedger({
  jobs,
  getDamageInfo,
  handleOpenInvoice,
  setActiveScreen,
}) {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    today.toISOString().slice(0, 7),
  );

  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const [savedInvoices, setSavedInvoices] = useState([]);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const response = await fetch("/api/invoices");

        if (!response.ok) {
          throw new Error("Failed to load invoices");
        }

        const data = await response.json();

        setSavedInvoices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load invoices:", error);
        setSavedInvoices([]);
      }
    };

    loadInvoices();
  }, []);

  const selectedYear = Number(selectedMonth.slice(0, 4));

  const selectedMonthNumber = Number(selectedMonth.slice(5, 7));

  const months = [
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

    const jobMonth = `${jobDate.getFullYear()}-${String(
      jobDate.getMonth() + 1,
    ).padStart(2, "0")}`;

    return jobMonth === selectedMonth;
  });

  const selectedInvoices = savedInvoices.filter((invoice) => {
    if (!invoice.invoice_date) return false;

    return String(invoice.invoice_date).slice(0, 7) === selectedMonth;
  });

  const ledgerRows = [
    ...selectedJobs.map((job) => {
      const invoice = calculateInvoice(job);

      return {
        type: "job",
        id: job.id,
        job,
        subtotal: invoice.subtotal,
        vat: invoice.vat,
        grandTotal: invoice.grandTotal,
      };
    }),

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

  const totalEarnings = ledgerRows.reduce((total, row) => {
    return total + row.grandTotal;
  }, 0);

  const formattedMonth = (() => {
    const [year, month] = selectedMonth.split("-");
    return `${month}/${year}`;
  })();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Monthly Ledger
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Monthly sales and invoice transactions.
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
              onClick={() => setIsMonthPickerOpen((open) => !open)}
              className="flex h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <CalendarDays className="h-5 w-5 text-blue-600" />

              <span className="text-sm font-bold text-slate-700">
                {formattedMonth}
              </span>

              <span className="ml-1 text-xs text-slate-500">▼</span>
            </button>

            {isMonthPickerOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonth(
                        `${selectedYear - 1}-${String(selectedMonthNumber).padStart(2, "0")}`,
                      );
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                    aria-label="Previous year"
                  >
                    ‹
                  </button>

                  <span className="text-lg font-black text-slate-900">
                    {selectedYear}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonth(
                        `${selectedYear + 1}-${String(selectedMonthNumber).padStart(2, "0")}`,
                      );
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                    aria-label="Next year"
                  >
                    ›
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {months.map((month, index) => {
                    const monthNumber = index + 1;
                    const monthValue = `${selectedYear}-${String(
                      monthNumber,
                    ).padStart(2, "0")}`;

                    const isSelected = monthNumber === selectedMonthNumber;

                    return (
                      <button
                        key={month}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(monthValue);
                          setIsMonthPickerOpen(false);
                        }}
                        className={`rounded-lg px-2 py-2.5 text-sm font-bold transition ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {month}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
                  ledgerRows.map((row, index) => {
                    const invoice =
                      row.type === "job"
                        ? calculateInvoice(row.job)
                        : {
                            subtotal: row.subtotal,
                            vat: row.vat,
                            grandTotal: row.grandTotal,
                          };

                    return (
                      <tr
                        key={`${row.type}-${row.id}`}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 font-bold text-slate-700">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4 font-black text-blue-600">
                          {row.type === "job" ? row.job.id : row.displayNumber}
                        </td>

                        <td className="px-5 py-4 text-right font-bold text-slate-700">
                          ⃁{invoice.subtotal.toFixed(2)}
                        </td>

                        <td className="px-5 py-4 text-right font-bold text-slate-700">
                          ⃁{invoice.vat.toFixed(2)}
                        </td>

                        <td className="px-5 py-4 text-right font-black text-slate-900">
                          ⃁{invoice.grandTotal.toFixed(2)}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              row.type === "job"
                                ? handleOpenInvoice(row.job)
                                : handleOpenInvoice(row.invoice)
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-indigo-700"
                          >
                            <FileText className="h-4 w-4" />
                            Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
