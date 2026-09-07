"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  RefreshCw,
  X,
  Eye,
  Paperclip,
} from "lucide-react";

export default function PurchaseRecords({ setActiveScreen }) {
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const loadPurchases = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/purchases", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load purchase records.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid purchase records response.");
      }

      setPurchases(data);
    } catch (err) {
      console.error("Purchase records load error:", err);
      setError(err.message || "Failed to load purchase records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPurchases();
  }, []);

  const availableMonths = useMemo(() => {
    const months = purchases
      .map((purchase) => purchase.purchase_date)
      .filter(Boolean)
      .map((date) => String(date).slice(0, 7));

    return [...new Set(months)].sort().reverse();
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    if (selectedMonth === "all") {
      return purchases;
    }

    return purchases.filter(
      (purchase) =>
        String(purchase.purchase_date || "").slice(0, 7) === selectedMonth,
    );
  }, [purchases, selectedMonth]);

  const totals = useMemo(() => {
    return filteredPurchases.reduce(
      (summary, purchase) => ({
        subtotal: summary.subtotal + Number(purchase.subtotal || 0),
        vat: summary.vat + Number(purchase.vat_amount || 0),
        grandTotal: summary.grandTotal + Number(purchase.grand_total || 0),
      }),
      {
        subtotal: 0,
        vat: 0,
        grandTotal: 0,
      },
    );
  }, [filteredPurchases]);

  const formatCurrency = (value) => `﷼${Number(value || 0).toFixed(2)}`;

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB");
  };

  const formatMonth = (value) => {
    if (!value) return "All Months";

    const date = new Date(`${value}-01T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Purchase Records
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              View and manage purchase records and supplier invoices.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveScreen("dashboard")}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-bold
              text-slate-700
              shadow-sm
              transition-all
              hover:border-blue-300
              hover:bg-blue-50
              hover:text-blue-700
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Purchase Ledger */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                "
              >
                <FileText className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Purchase Ledger
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Purchase transactions and supplier invoice history.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-slate-700
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
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
                onClick={loadPurchases}
                disabled={isLoading}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-slate-700
                  shadow-sm
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                Total Purchases
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {formatCurrency(totals.subtotal)}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Without VAT
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                VAT
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {formatCurrency(totals.vat)}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                VAT included
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                Grand Total
              </p>

              <p className="mt-2 text-2xl font-black text-blue-700">
                {formatCurrency(totals.grandTotal)}
              </p>

              <p className="mt-1 text-xs font-medium text-blue-600">
                Including VAT
              </p>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="p-10 text-center">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600" />
              <p className="mt-3 text-sm font-bold text-slate-500">
                Loading purchase records...
              </p>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="p-10 text-center">
              <p className="text-sm font-bold text-rose-600">{error}</p>

              <button
                type="button"
                onClick={loadPurchases}
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Records */}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      S.No
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      Purchase No
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      Supplier
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      Invoice No
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                      Without VAT
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                      VAT
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                      Total
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      Invoice
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredPurchases.map((purchase, index) => (
                    <tr
                      key={purchase.id}
                      className="transition-colors hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-4 text-sm font-bold text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-black text-blue-700">
                          {purchase.purchase_no}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-700">
                        {formatDate(purchase.purchase_date)}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-900">
                        {purchase.supplier || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {purchase.supplier_invoice_no || "-"}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-bold text-slate-800">
                        {formatCurrency(purchase.subtotal)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-bold text-slate-800">
                        {formatCurrency(purchase.vat_amount)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-black text-slate-900">
                        {formatCurrency(purchase.grand_total)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${
                            String(
                              purchase.payment_status || "",
                            ).toLowerCase() === "paid"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {purchase.payment_status || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedPurchase(purchase)}
                          className="
      inline-flex
      items-center
      gap-1.5
      rounded-lg
      border
      border-blue-200
      bg-blue-50
      px-3
      py-2
      text-xs
      font-black
      text-blue-700
      transition-all
      hover:border-blue-300
      hover:bg-blue-100
    "
                        >
                          <Eye className="h-4 w-4" />
                          View Full
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredPurchases.length === 0 && (
                    <tr>
                      <td
                        colSpan="10"
                        className="px-5 py-12 text-center text-sm font-bold text-slate-500"
                      >
                        No purchase records found for{" "}
                        {selectedMonth === "all"
                          ? "the selected period"
                          : formatMonth(selectedMonth)}
                        .
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      {selectedPurchase && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-950/50
            p-4
          "
          onClick={() => setSelectedPurchase(null)}
        >
          <div
            className="
              w-full
              max-w-3xl
              max-h-[90vh]
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                  Purchase Details
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  {selectedPurchase.purchase_no}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPurchase(null)}
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Supplier Information */}
              <section>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
                  Supplier Information
                </h3>

                <div className="mt-3 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500">Supplier</p>
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {selectedPurchase.supplier || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500">
                      Supplier Invoice No.
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {selectedPurchase.supplier_invoice_no || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500">
                      Purchase Date
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {formatDate(selectedPurchase.purchase_date)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">
                    VAT Registration Number
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {selectedPurchase.vat_registration_number || "-"}
                  </p>
                </div>
              </section>

              {/* Purchase Items */}
              <section>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
                  Purchase Items
                </h3>

                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-xs font-black uppercase text-slate-500">
                          #
                        </th>
                        <th className="px-4 py-3 text-xs font-black uppercase text-slate-500">
                          Item / Part
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">
                          Discount
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {(selectedPurchase.purchase_items || []).map(
                        (item, itemIndex) => (
                          <tr key={item.id || itemIndex}>
                            <td className="px-4 py-3 text-sm font-bold text-slate-500">
                              {itemIndex + 1}
                            </td>

                            <td className="px-4 py-3 text-sm font-black text-slate-900">
                              {item.item_name || "-"}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-bold text-slate-700">
                              {item.quantity}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-bold text-slate-700">
                              {formatCurrency(item.unit_price)}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-bold text-slate-700">
                              {formatCurrency(item.discount)}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-black text-slate-900">
                              {formatCurrency(item.line_total)}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Purchase Summary */}
              <section>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
                  Purchase Summary
                </h3>

                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-bold text-slate-600">
                      Subtotal
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(selectedPurchase.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 py-2">
                    <span className="text-sm font-bold text-slate-600">
                      VAT 15%
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(selectedPurchase.vat_amount)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-slate-300 pt-4">
                    <span className="text-base font-black text-slate-900">
                      Grand Total
                    </span>
                    <span className="text-xl font-black text-blue-700">
                      {formatCurrency(selectedPurchase.grand_total)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Invoice */}
              <section>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
                  Supplier Invoice
                </h3>

                <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  {selectedPurchase.invoice_file_name ? (
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900">
                            {selectedPurchase.invoice_file_name}
                          </p>

                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            Supplier invoice attached
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              `/api/purchases/invoice?path=${encodeURIComponent(
                                selectedPurchase.invoice_file_path,
                              )}`,
                            );

                            const data = await response.json();

                            if (!response.ok || !data.url) {
                              throw new Error(
                                data.error ||
                                  "Failed to open purchase invoice.",
                              );
                            }

                            window.open(
                              data.url,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          } catch (error) {
                            console.error(
                              "Purchase invoice open error:",
                              error,
                            );
                            alert(
                              error.message ||
                                "Failed to open purchase invoice.",
                            );
                          }
                        }}
                        className="
    w-full
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-blue-600
    px-4
    py-3
    text-sm
    font-black
    text-white
    shadow-sm
    transition
    hover:bg-blue-700
  "
                      >
                        <Paperclip className="h-4 w-4" />
                        View Purchase Invoice
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-500">
                      No supplier invoice is attached to this purchase.
                    </p>
                  )}
                </div>
              </section>

              {/* Close */}
              <div className="border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setSelectedPurchase(null)}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    font-black
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
