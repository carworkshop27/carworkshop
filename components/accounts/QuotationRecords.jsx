"use client";

import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

export default function QuotationRecords({ setActiveScreen, onOpenQuotation }) {
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quotationToGenerate, setQuotationToGenerate] = useState(null);
  const [generatedInvoices, setGeneratedInvoices] = useState({});
  const handleGenerateInvoice = async () => {
    if (!quotationToGenerate) return;

    try {
      const items = Array.isArray(quotationToGenerate.items)
        ? quotationToGenerate.items.map((item, index) => ({
            serial_number: item.serial_number ?? index + 1,
            description: item.description || "",
            quantity: Number(item.quantity) || 0,
            unit_price: Number(item.unit_price) || 0,
            total: Number(item.quantity || 0) * Number(item.unit_price || 0),
          }))
        : [];

      const subtotal = items.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0,
      );

      const vatAmount = subtotal * 0.15;
      const totalAmount = subtotal + vatAmount;

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotationId: quotationToGenerate.id,
          quotationNo: quotationToGenerate.quotation_no,
          customerName: quotationToGenerate.customer_name,
          address: quotationToGenerate.address,
          contactNumber: quotationToGenerate.contact_number,
          email: quotationToGenerate.email,
          items,
          terms: Array.isArray(quotationToGenerate.terms)
            ? quotationToGenerate.terms
            : [],
          subtotal,
          vatAmount,
          totalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate invoice.");
      }

      setGeneratedInvoices((previous) => ({
        ...previous,
        [quotationToGenerate.id]: true,
      }));

      setQuotationToGenerate(null);

      alert(
        `Invoice generated successfully.\nInvoice No.: ${
          data?.invoice?.invoice_no || `INV-${quotationToGenerate.quotation_no}`
        }`,
      );
    } catch (error) {
      console.error("Generate invoice error:", error);

      alert(error.message || "Failed to generate invoice.");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadQuotations = async () => {
      try {
        const [quotationsResponse, invoicesResponse] = await Promise.all([
          fetch("/api/quotations"),
          fetch("/api/invoices"),
        ]);

        const quotationsData = await quotationsResponse.json();
        const invoicesData = await invoicesResponse.json();

        if (!quotationsResponse.ok) {
          throw new Error(
            quotationsData?.error || "Failed to load quotation records.",
          );
        }

        if (!invoicesResponse.ok) {
          throw new Error(invoicesData?.error || "Failed to load invoices.");
        }

        if (!cancelled) {
          const quotationList = Array.isArray(quotationsData)
            ? quotationsData
            : [];

          const invoiceList = Array.isArray(invoicesData) ? invoicesData : [];

          const savedInvoices = {};

          invoiceList.forEach((invoice) => {
            if (invoice?.quotation_id) {
              savedInvoices[invoice.quotation_id] = true;
            }
          });

          setQuotations(quotationList);
          setGeneratedInvoices(savedInvoices);
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
              Quotation Records
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and edit saved quotations.
            </p>
          </div>
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

                      {/* GENERATE INVOICE */}
                      <td className="px-5 py-4 text-center align-top">
                        <div className="flex flex-col items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQuotationToGenerate(quotation)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-amber-600"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Generate Invoice
                          </button>

                          <div
                            className={`w-full rounded-lg px-4 py-2 text-xs font-black ${
                              generatedInvoices[quotation.id]
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-300 text-slate-600"
                            }`}
                          >
                            {generatedInvoices[quotation.id]
                              ? "Invoice Saved"
                              : "Invoice Not Saved"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {quotationToGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-black text-slate-900">
              Generate Invoice
            </h2>

            <p className="mt-3 text-sm font-medium text-slate-600">
              Do you want to generate the invoice of quotation{" "}
              <span className="font-black text-slate-900">
                {quotationToGenerate.quotation_no || "-"}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setQuotationToGenerate(null)}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                No
              </button>

              <button
                type="button"
                onClick={handleGenerateInvoice}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
