"use client";

import { ArrowLeft, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function CustomerRecords({ setActiveScreen }) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCustomerRecords = async () => {
      try {
        const response = await fetch("/api/quotations");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load customer records.");
        }

        if (!cancelled) {
          setRecords(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Load customer records error:", error);
          setIsLoading(false);
          alert(error.message || "Failed to load customer records.");
        }
      }
    };

    loadCustomerRecords();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredRecords = records.filter((record) => {
    if (!normalizedSearch) return true;

    const searchableValues = [
      record.quotation_no,
      record.customer_name,
      record.address,
      record.contact_number,
      record.email,
    ];

    return searchableValues.some((value) =>
      String(value || "").toLowerCase().includes(normalizedSearch),
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveScreen("dashboard")}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>

          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Customer Records
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View customers and their quotation records.
            </p>
          </div>
        </div>

        <div className="mb-3 flex justify-start">
          <div className="w-full max-w-md">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search quotation number or customer info..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-10 text-center text-sm font-semibold text-slate-500">
              Loading customer records...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="text-sm font-bold text-slate-500">
                {searchTerm.trim()
                  ? "No customer matches your search."
                  : "No customer records found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-left text-xs font-black uppercase tracking-wide text-white">
                    <th className="px-5 py-4">Quotation Number</th>
                    <th className="px-5 py-4">Customer Name</th>
                    <th className="px-5 py-4">Address</th>
                    <th className="px-5 py-4">Contact Number</th>
                    <th className="px-5 py-4">Email</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-t border-slate-200 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 align-top font-black text-slate-900">
                        {record.quotation_no || "-"}
                      </td>

                      <td className="px-5 py-4 align-top font-bold text-slate-900">
                        {record.customer_name || "-"}
                      </td>

                      <td className="px-5 py-4 align-top text-sm text-slate-600">
                        {record.address || "-"}
                      </td>

                      <td className="px-5 py-4 align-top text-sm text-slate-600">
                        {record.contact_number || "-"}
                      </td>

                      <td className="px-5 py-4 align-top text-sm text-slate-600">
                        {record.email || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
