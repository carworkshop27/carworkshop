"use client";

import { ArrowLeft, Printer } from "lucide-react";

export default function QuotationInvoice({ quotation, setActiveScreen }) {
  if (!quotation) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="font-bold text-slate-600">No quotation selected.</p>

          <button
            type="button"
            onClick={() => setActiveScreen("quotation-records")}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            Back to Quotation Records
          </button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(quotation.items) ? quotation.items : [];

  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unit_price || 0);

    return sum + quantity * unitPrice;
  }, 0);

  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const terms = Array.isArray(quotation.terms)
    ? quotation.terms.map((term) => term.term_text).filter(Boolean)
    : [];

  const quotationDate = quotation.quotation_date || quotation.created_at;

  const formattedDate = quotationDate
    ? new Date(quotationDate).toLocaleDateString("en-GB")
    : "-";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-800">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }

        @media print {
          html,
          body {
            width: 210mm !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .quotation-invoice-screen {
            padding: 0 !important;
            background: #ffffff !important;
          }

          .quotation-invoice-actions {
            display: none !important;
          }

          .quotation-invoice-page {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* ACTION BAR */}
      <div className="quotation-invoice-actions mx-auto mb-5 flex max-w-5xl items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveScreen("quotation-records")}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quotation Records
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Printer className="h-4 w-4" />
          Print Invoice
        </button>
      </div>

      {/* INVOICE */}
      <main className="quotation-invoice-screen">
        <div className="quotation-invoice-page mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* HEADER */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex items-start justify-between gap-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                  Garage Altalaa Fahir
                </h1>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Vehicle Repair & Maintenance
                </p>

                <div className="mt-3 text-xs leading-5 text-slate-600">
                  <p>Jeddah, Saudi Arabia</p>
                  <p>Phone: 0501234567</p>
                  <p>Email: info@carworkshop.com</p>
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-3xl font-black uppercase tracking-wide text-slate-700">
                  Invoice
                </h2>

                <div className="mt-3 overflow-hidden rounded-lg border border-slate-300 text-sm">
                  <div className="grid grid-cols-2 bg-slate-100 text-xs font-black uppercase">
                    <div className="border-r border-slate-300 px-4 py-2">
                      Invoice #
                    </div>
                    <div className="px-4 py-2">Date</div>
                  </div>

                  <div className="grid grid-cols-2 font-semibold">
                    <div className="border-r border-slate-300 px-4 py-2">
                      INV-{quotation.quotation_no || "-"}
                    </div>
                    <div className="px-4 py-2">{formattedDate}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="mt-6 grid grid-cols-2 gap-8 text-sm">
            <div>
              <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                Bill To
              </h3>

              <p className="font-black text-slate-900">
                {quotation.customer_name || "-"}
              </p>

              <p className="mt-1 text-slate-600">{quotation.address || "-"}</p>

              <p className="mt-1 text-slate-600">
                {quotation.contact_number || "-"}
              </p>

              <p className="mt-1 text-slate-600">{quotation.email || "-"}</p>
            </div>

            <div className="text-right">
              <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                Quotation Reference
              </h3>

              <p className="font-black text-slate-900">
                {quotation.quotation_no || "-"}
              </p>

              <p className="mt-1 text-slate-600">
                Quotation Date: {formattedDate}
              </p>
            </div>
          </div>

          {/* ITEMS */}
          <div className="mt-7">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-800 text-left text-xs font-black uppercase text-white">
                  <th className="border border-slate-800 px-3 py-3">S.No.</th>
                  <th className="border border-slate-800 px-3 py-3">
                    Description
                  </th>
                  <th className="border border-slate-800 px-3 py-3 text-right">
                    Qty
                  </th>
                  <th className="border border-slate-800 px-3 py-3 text-right">
                    Unit Price
                  </th>
                  <th className="border border-slate-800 px-3 py-3 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => {
                  const quantity = Number(item.quantity || 0);
                  const unitPrice = Number(item.unit_price || 0);
                  const amount = quantity * unitPrice;

                  return (
                    <tr key={item.id || index}>
                      <td className="border border-slate-300 px-3 py-3">
                        {item.serial_number ?? index + 1}
                      </td>

                      <td className="border border-slate-300 px-3 py-3 font-semibold">
                        {item.description || "-"}
                      </td>

                      <td className="border border-slate-300 px-3 py-3 text-right">
                        {quantity}
                      </td>

                      <td className="border border-slate-300 px-3 py-3 text-right">
                        {unitPrice.toFixed(2)}
                      </td>

                      <td className="border border-slate-300 px-3 py-3 text-right font-bold">
                        {amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* BOTTOM */}
          <div className="mt-7 flex items-start justify-between gap-10">
            {/* TERMS */}
            <div className="flex-1">
              <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">
                Terms & Conditions
              </h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                {terms.length > 0 ? (
                  terms.map((term, index) => (
                    <p key={index}>
                      {index + 1}. {term}
                    </p>
                  ))
                ) : (
                  <p>1. Bank Information - IBAN - Talaa Fahir</p>
                )}
              </div>
            </div>

            {/* TOTALS */}
            <div className="w-80">
              <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                <span className="font-semibold text-slate-600">Subtotal</span>
                <span className="font-bold">⃁ {subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                <span className="font-semibold text-slate-600">VAT 15%</span>
                <span className="font-bold">⃁ {vat.toFixed(2)}</span>
              </div>

              <div className="mt-2 flex justify-between rounded-lg bg-slate-800 px-4 py-3 text-base font-black text-white">
                <span>Total</span>
                <span>⃁ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-10 border-t-2 border-slate-900 pt-4 text-center">
            <p className="text-sm font-black text-slate-700">Thank you!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
