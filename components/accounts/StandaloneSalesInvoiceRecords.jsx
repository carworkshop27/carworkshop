"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";

const money = (value) =>
  Number(value || 0).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function StandaloneSalesInvoiceRecords({ setActiveScreen, onEdit }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/standalone-sales-invoices", {
        cache: "no-store",
        credentials: "same-origin",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load invoices.");
      }

      setRecords(result.invoices || []);
    } catch (err) {
      setError(err.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) =>
      [
        record.invoice_no,
        record.customer_name,
        record.customer_phone,
        record.plate_number,
        record.template_type,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [records, search]);

  return (
    <div className="min-h-screen bg-slate-100 p-5 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">Sales Invoice Records</h1>
            <p className="text-sm text-slate-500">
              Professional and Detailed Workshop Sales Invoices
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadRecords}
              disabled={loading}
              className="rounded-lg border bg-white px-4 py-2 font-semibold disabled:opacity-50"
            >
              <RefreshCw size={15} className="mr-2 inline" />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setActiveScreen("dashboard")}
              className="rounded-lg border bg-white px-4 py-2 font-semibold"
            >
              <ArrowLeft size={15} className="mr-2 inline" />
              Back
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-xl border bg-white p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice number, customer, phone, or plate..."
              className="w-full rounded-lg border px-10 py-2"
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                {[
                  "Invoice No",
                  "Date",
                  "Type",
                  "Customer",
                  "Total (SAR)",
                  "Status",
                  "Action",
                ].map((title) => (
                  <th key={title} className="px-4 py-3">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="px-4 py-3 font-bold">
                    {record.invoice_no}
                  </td>
                  <td className="px-4 py-3">
                    {record.invoice_date}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {record.template_type}
                  </td>
                  <td className="px-4 py-3">
                    {record.customer_name}
                  </td>
                  <td className="px-4 py-3">
                    {money(record.total_amount)}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {record.status}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelected(record)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      className="ml-2 rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white"
                    >
                      Edit / Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <p className="p-8 text-center text-slate-500">
              Loading invoices...
            </p>
          )}

          {!loading && !filtered.length && (
            <p className="p-8 text-center text-slate-500">
              No matching invoices found.
            </p>
          )}
        </div>

        {selected && (
          <div className="mt-5 rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">
                {selected.invoice_no}
              </h2>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border px-3 py-2"
              >
                Close
              </button>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              <p>Customer: {selected.customer_name}</p>
              <p>Date: {selected.invoice_date}</p>
              <p>Type: {selected.template_type}</p>
              <p>Status: {selected.status}</p>
            </div>

            <div className="mt-4 space-y-2">
              {(selected.items || []).map((item, index) => (
                <div key={index} className="rounded-lg border p-3 text-sm">
                  {item.description} — Qty {item.quantity} × SAR{" "}
                  {money(item.unitPrice)}
                </div>
              ))}
            </div>

            <p className="mt-4 text-lg font-black">
              Total: SAR {money(selected.total_amount)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}