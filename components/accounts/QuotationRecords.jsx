"use client";

import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

export default function QuotationRecords({ setActiveScreen, onOpenQuotation }) {
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadQuotations = async () => {
      try {
        const response = await fetch("/api/quotations");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load quotation records.");
        }

        if (!cancelled) {
          setQuotations(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Load quotation records error:", error);
          setIsLoading(false);
          alert(error.message || "Failed to load quotation records.");
        }
      }
    };

    loadQuotations();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-GB");
  };

  const getQuotationTotal = (quotation) => {
    if (
      quotation?.total != null ||
      quotation?.grand_total != null ||
      quotation?.quotation_total != null
    ) {
      return Number(
        quotation.total ??
          quotation.grand_total ??
          quotation.quotation_total ??
          0,
      ).toFixed(2);
    }

    const total = Array.isArray(quotation?.items)
      ? quotation.items.reduce((sum, item) => {
          if (item?.total != null) {
            return sum + Number(item.total || 0);
          }

          const quantity = Number(item?.quantity || 0);
          const unitPrice = Number(item?.unit_price || 0);

          return sum + quantity * unitPrice * 1.15;
        }, 0)
      : 0;

    return total.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-800">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Quotation Records
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and edit saved quotations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveScreen("dashboard")}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
        </div>

        {/* RECORDS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-10 text-center text-sm font-semibold text-slate-500">
              Loading quotation records...
            </div>
          ) : quotations.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="text-sm font-bold text-slate-500">
                No quotation records found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-left text-xs font-black uppercase tracking-wide text-white">
                    <th className="px-5 py-4">Quotation Number</th>

                    <th className="px-5 py-4">Customer Info</th>

                    <th className="px-5 py-4">Quotation Date</th>

                    <th className="px-5 py-4 text-right">Quotation Total</th>

                    <th className="px-5 py-4 text-center">Open</th>

                    <th className="px-5 py-4 text-center">Invoice</th>
                  </tr>
                </thead>

                <tbody>
                  {quotations.map((quotation) => (
                    <tr
                      key={quotation.id}
                      className="border-t border-slate-200 transition hover:bg-slate-50"
                    >
                      {/* QUOTATION NUMBER */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-black text-slate-900">
                          {quotation.quotation_no || "-"}
                        </div>
                      </td>

                      {/* CUSTOMER INFO */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-bold text-slate-900">
                          {quotation.customer_name || "-"}
                        </div>

                        {quotation.address && (
                          <div className="mt-1 text-xs text-slate-500">
                            {quotation.address}
                          </div>
                        )}

                        {quotation.contact_number && (
                          <div className="mt-1 text-xs text-slate-500">
                            {quotation.contact_number}
                          </div>
                        )}

                        {quotation.email && (
                          <div className="mt-1 text-xs text-slate-500">
                            {quotation.email}
                          </div>
                        )}
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700">
                        {formatDate(
                          quotation.quotation_date || quotation.created_at,
                        )}
                      </td>

                      {/* TOTAL */}
                      <td className="px-5 py-4 text-right align-top text-sm font-black text-slate-900">
                        ⃁ {getQuotationTotal(quotation)}
                      </td>

                      {/* OPEN */}
                      <td className="px-5 py-4 text-center align-top">
                        <button
                          type="button"
                          onClick={() => onOpenQuotation(quotation)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-blue-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Open
                        </button>
                      </td>

                      {/* INVOICE */}
                      <td className="px-5 py-4 text-center align-top">
                        <button
                          type="button"
                          onClick={() => onOpenQuotation(quotation, true)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Invoice
                        </button>
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
