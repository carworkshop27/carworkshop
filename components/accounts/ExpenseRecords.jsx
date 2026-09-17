"use client";

import { useEffect, useMemo, useState } from "react";

export default function ExpenseRecords({ setActiveScreen }) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isOpeningInvoice, setIsOpeningInvoice] = useState(false);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/expenses", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load expense records.");
      }

      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Expense records load error:", err);
      setError(err.message || "Failed to load expense records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadExpenses();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const availableMonths = useMemo(() => {
    const months = new Set();

    expenses.forEach((expense) => {
      if (expense.expense_date) {
        months.add(expense.expense_date.slice(0, 7));
      }
    });

    return Array.from(months).sort().reverse();
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonth === "all") {
      return expenses;
    }

    return expenses.filter(
      (expense) =>
        expense.expense_date &&
        expense.expense_date.slice(0, 7) === selectedMonth,
    );
  }, [expenses, selectedMonth]);

  const totals = useMemo(() => {
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

  const formatAmount = (value) => {
    return Number(value || 0).toFixed(2);
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-GB");
  };

  const formatMonth = (value) => {
    if (!value) return "";

    const [year, month] = value.split("-");

    const date = new Date(Number(year), Number(month) - 1, 1);

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleViewInvoice = async () => {
    if (!selectedExpense?.invoice_file_path) {
      return;
    }

    try {
      setIsOpeningInvoice(true);

      const response = await fetch(
        `/api/expenses/invoice?path=${encodeURIComponent(
          selectedExpense.invoice_file_path,
        )}`,
      );

      const data = await response.json();

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Unable to open the expense invoice.");
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Expense invoice error:", err);
      alert(err.message || "Unable to open the expense invoice.");
    } finally {
      setIsOpeningInvoice(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <button
            type="button"
            onClick={() => setActiveScreen("dashboard")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Back to Dashboard
          </button>

          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Expense Records
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              View and manage expense records and expense invoices.
            </p>
          </div>
        </div>

        {/* Ledger */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Expense Ledger
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Review recorded expenses and their totals.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Months</option>

                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {formatMonth(month)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={loadExpenses}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Total Expenses
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {formatAmount(totals.subtotal)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                VAT
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {formatAmount(totals.vat)}
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                Grand Total
              </p>

              <p className="mt-2 text-2xl font-black text-blue-700">
                {formatAmount(totals.grandTotal)}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[1150px] w-full">
              <thead>
                <tr className="border-y border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                    Expense No.
                  </th>

                  <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                    Expense Type
                  </th>

                  <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                    VAT Registration
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Without VAT
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    VAT
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Grand Total
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                    Invoice
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-12 text-center text-sm font-bold text-slate-500"
                    >
                      Loading expense records...
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-12 text-center text-sm font-bold text-slate-500"
                    >
                      No expense records found.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-black text-slate-900">
                        {expense.expense_no || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {formatDate(expense.expense_date)}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-800">
                        {expense.expense_type || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        {expense.vat_registration_number || "-"}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-bold text-slate-800">
                        {formatAmount(expense.subtotal)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-bold text-slate-800">
                        {formatAmount(expense.vat_amount)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-black text-slate-900">
                        {formatAmount(expense.grand_total)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {expense.invoice_file_path ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                            Attached
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                            None
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedExpense(expense)}
                          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white transition hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredExpenses.length > 0 && (
            <div className="border-t border-slate-200 px-5 py-4 text-sm font-bold text-slate-500">
              Showing {filteredExpenses.length} expense record
              {filteredExpenses.length === 1 ? "" : "s"}
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedExpense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedExpense(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Expense Details
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {selectedExpense.expense_no || "Expense Record"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Expense Information */}
              <section>
                <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                  Expense Information
                </h3>

                <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold text-slate-500">
                      Expense No.
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {selectedExpense.expense_no || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500">
                      Expense Date
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {formatDate(selectedExpense.expense_date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500">
                      Expense Type
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {selectedExpense.expense_type || "-"}
                    </p>
                  </div>

                  <div className="md:col-span-3">
                    <p className="text-xs font-bold text-slate-500">
                      VAT Registration Number
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {selectedExpense.vat_registration_number || "-"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Expense Details */}
              <section>
                <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                  Expense Details
                </h3>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left">
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">
                          Description
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                          Amount
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                          VAT
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                          Line Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedExpense.items?.length > 0 ? (
                        selectedExpense.items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                              {item.description || "-"}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-bold text-slate-800">
                              {formatAmount(item.amount)}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-bold text-slate-800">
                              {formatAmount(item.vat)}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-black text-slate-900">
                              {formatAmount(item.line_total)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-sm font-semibold text-slate-500"
                          >
                            No expense details available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Expense Summary */}
              <section>
                <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                  Expense Summary
                </h3>

                <div className="ml-auto max-w-md space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-600">
                      Without VAT
                    </span>

                    <span className="text-sm font-black text-slate-900">
                      {formatAmount(selectedExpense.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-600">
                      VAT
                    </span>

                    <span className="text-sm font-black text-slate-900">
                      {formatAmount(selectedExpense.vat_amount)}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base font-black text-slate-900">
                        Grand Total
                      </span>

                      <span className="text-lg font-black text-blue-700">
                        {formatAmount(selectedExpense.grand_total)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Invoice */}
              <section>
                <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                  Attached Expense Invoice
                </h3>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  {selectedExpense.invoice_file_path ? (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {selectedExpense.invoice_file_name ||
                            "Expense Invoice"}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Invoice document attached to this expense.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleViewInvoice}
                        disabled={isOpeningInvoice}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isOpeningInvoice
                          ? "Opening..."
                          : "View Expense Invoice"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">
                      No expense invoice is attached to this record.
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
