"use client";

import { ArrowLeft, FileText, Plus, Printer, Save, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Quotation({ setActiveScreen, quotationToEdit = null }) {
  const [quotationItems, setQuotationItems] = useState(() =>
    Array.isArray(quotationToEdit?.items) && quotationToEdit.items.length > 0
      ? quotationToEdit.items.map((item, index) => ({
          serialNumber: item.serial_number ?? index + 1,
          description: item.description || "",
          quantity: item.quantity ?? 1,
          unitPrice: item.unit_price ?? 0,
        }))
      : [
          {
            serialNumber: 1,
            description: "",
            quantity: 1,
            unitPrice: 0,
          },
        ],
  );

  const [quotationTerms, setQuotationTerms] = useState(() =>
    Array.isArray(quotationToEdit?.terms)
      ? quotationToEdit.terms
          .filter((term) => !term.is_hardcoded)
          .map((term) => term.term_text || "")
      : [""],
  );

  const [customerNo, setCustomerNo] = useState(
    quotationToEdit?.quotation_no || "",
  );

  const [customerName, setCustomerName] = useState(
    quotationToEdit?.customer_name || "",
  );

  const [customerAddress, setCustomerAddress] = useState(
    quotationToEdit?.address || "",
  );

  const [contactNumber, setContactNumber] = useState(
    quotationToEdit?.contact_number || "",
  );

  const [email, setEmail] = useState(quotationToEdit?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showQuotationPreview, setShowQuotationPreview] = useState(false);
  const [quotationId, setQuotationId] = useState(quotationToEdit?.id || "");

  const updateQuotationItem = (index, field, value) => {
    setQuotationItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addQuotationItem = () => {
    setQuotationItems((currentItems) => [
      ...currentItems,
      {
        serialNumber: currentItems.length + 1,
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeQuotationItem = (index) => {
    setQuotationItems((currentItems) =>
      currentItems
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          serialNumber: itemIndex + 1,
        })),
    );
  };

  const updateQuotationTerm = (index, value) => {
    setQuotationTerms((currentTerms) =>
      currentTerms.map((term, termIndex) =>
        termIndex === index ? value : term,
      ),
    );
  };

  const addQuotationTerm = () => {
    setQuotationTerms((currentTerms) => [...currentTerms, ""]);
  };

  const removeQuotationTerm = (index) => {
    setQuotationTerms((currentTerms) =>
      currentTerms.filter((_, termIndex) => termIndex !== index),
    );
  };

  const handleSaveQuotation = async () => {
    if (!customerName.trim()) {
      alert("Please enter Customer / Company.");
      return;
    }

    const invalidItemIndex = quotationItems.findIndex(
      (item) => !item.description.trim(),
    );

    if (invalidItemIndex !== -1) {
      alert(`Description is required for item ${invalidItemIndex + 1}.`);
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/quotations", {
        method: quotationId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: quotationId || undefined,
          customerName: customerName.trim(),
          address: customerAddress.trim(),
          contactNumber: contactNumber.trim(),
          email: email.trim(),
          items: quotationItems.map((item) => ({
            serialNumber: item.serialNumber,
            description: item.description.trim(),
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
          })),
          terms: quotationTerms.map((term) => term.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to save quotation.");
      }

      setCustomerNo(data?.quotation_no || "");

      alert(
        `${quotationId ? "Quotation updated successfully." : "Quotation saved successfully."}\nQuotation No.: ${
          data?.quotation_no || customerNo || "Generated"
        }`,
      );
    } catch (error) {
      console.error("Save quotation error:", error);
      alert(error.message || "Failed to save quotation.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintQuotation = () => {
    setShowQuotationPreview(true);
  };

  // Target quotation print layout: maximum 10 items per A4 page.
  const ITEMS_PER_PRINT_PAGE = 7;

  const quotationPrintPages = Array.from(
    {
      length: Math.max(
        1,
        Math.ceil(quotationItems.length / ITEMS_PER_PRINT_PAGE),
      ),
    },
    (_, pageIndex) =>
      quotationItems.slice(
        pageIndex * ITEMS_PER_PRINT_PAGE,
        (pageIndex + 1) * ITEMS_PER_PRINT_PAGE,
      ),
  );

  const quotationSubtotal = quotationItems.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0,
  );

  const quotationVat = quotationSubtotal * 0.15;
  const quotationTotal = quotationSubtotal + quotationVat;

  if (showQuotationPreview) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-6">
          {/* PREVIEW ACTION BAR */}
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowQuotationPreview(false)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Quotation
            </button>

            <button
              type="button"
              onClick={() => {
                setShowQuotationPreview(false);
                setTimeout(() => window.print(), 150);
              }}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700"
            >
              <Printer className="h-4 w-4" />
              Print Quotation
            </button>
          </div>

          {/* QUOTATION PREVIEW */}
          <div className="space-y-8">
            {quotationPrintPages.map((pageItems, pageIndex) => {
              const isLastPage = pageIndex === quotationPrintPages.length - 1;

              return (
                <div
                  key={`quotation-preview-page-${pageIndex}`}
                  className="quotation-preview-sheet relative mx-auto flex min-h-[1123px] flex-col overflow-hidden bg-white shadow-lg"
                >
                  {/* HEADER */}
                  <div className="mx-5 mt-5 flex min-h-[155px] bg-teal-50">
                    <div className="w-8 shrink-0 bg-teal-600"></div>

                    <div className="flex-1 px-7 py-4">
                      <div className="flex items-start justify-between gap-8">
                        <img
                          src="/images/quotation-logo.png"
                          alt="Garage AlTalaa AlFahir"
                          className="h-28 w-auto object-contain mix-blend-multiply"
                        />

                        <div className="ml-auto w-[300px] text-right">
                          <h1 className="mb-3 text-right text-3xl font-black tracking-tight text-teal-800">
                            QUOTATION
                          </h1>

                          <div className="ml-auto w-[261px] space-y-2 text-sm text-slate-700">
                            <div className="grid grid-cols-[105px_10px_130px] gap-2">
                              <strong className="text-right">Date</strong>
                              <span className="text-center">:</span>
                              <span className="text-left">
                                {new Date().toLocaleDateString("en-GB")}
                              </span>
                            </div>

                            <div className="grid grid-cols-[105px_10px_130px] gap-2">
                              <strong className="text-right">
                                Quotation #
                              </strong>
                              <span className="text-center">:</span>
                              <span className="text-left">
                                {customerNo || "Pending"}
                              </span>
                            </div>

                            <div className="grid grid-cols-[105px_10px_130px] gap-2">
                              <strong className="text-right">
                                Customer ID
                              </strong>
                              <span className="text-center">:</span>
                              <span className="text-left">
                                {customerNo || "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-1 text-sm leading-5 text-slate-800">
                        <strong className="block text-base">
                          Garage AlTalaa AlFahir
                        </strong>
                        <p>Jeddah-Smart City Asfan shop No.2162 A.B</p>
                        <p>Phone: +966 50 662 0654</p>
                        <p>Email: talaa.alfakhir@gmail.com</p>
                      </div>
                    </div>
                  </div>

                  {/* CUSTOMER / SALESPERSON / TERMS */}
                  <div className="mx-5 mt-4 grid min-h-[115px] grid-cols-[57%_21.5%_21.5%]">
                    <div className="border border-teal-300 px-4 py-3 text-sm">
                      <strong className="mb-2 block font-black">
                        Quotation for:
                      </strong>
                      <p>{customerName || "-"}</p>
                      <p>{customerAddress || "-"}</p>
                      <p>{contactNumber || "-"}</p>
                      <p>{email || "-"}</p>
                    </div>

                    <div className="flex flex-col border-y border-r border-teal-300 text-sm">
                      <strong className="border-b border-teal-300 bg-teal-50 px-4 py-3">
                        Salesperson
                      </strong>
                      <span className="px-4 py-4">Admin</span>
                    </div>

                    <div className="flex flex-col border-y border-r border-teal-300 text-sm">
                      <strong className="border-b border-teal-300 bg-teal-50 px-4 py-3">
                        Terms
                      </strong>
                      <span className="px-4 py-4">&nbsp;</span>
                    </div>
                  </div>

                  {/* ITEMS */}
                  <div className="mx-5 mt-4">
                    <table className="w-full table-fixed border-collapse text-sm">
                      <thead>
                        <tr className="bg-teal-700 text-white">
                          <th className="w-[11%] border border-teal-500 px-3 py-3 text-center">
                            S.No.
                          </th>
                          <th className="w-[14%] border border-teal-500 px-3 py-3 text-center">
                            Quantity
                          </th>
                          <th className="w-[42%] border border-teal-500 px-3 py-3 text-center">
                            Description
                          </th>
                          <th className="w-[16.5%] border border-teal-500 px-3 py-3 text-center">
                            Unit Price
                          </th>
                          <th className="w-[16.5%] border border-teal-500 px-3 py-3 text-center">
                            Amount
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {pageItems.map((item, itemIndex) => {
                          const quantity = Number(item.quantity) || 0;
                          const unitPrice = Number(item.unitPrice) || 0;
                          const amount = quantity * unitPrice;

                          return (
                            <tr key={`${pageIndex}-${itemIndex}`}>
                              <td className="h-9 border border-teal-200 px-3 text-center">
                                {item.serialNumber}
                              </td>
                              <td className="h-9 border border-teal-200 px-3 text-center">
                                {quantity}
                              </td>
                              <td className="h-9 border border-teal-200 px-3">
                                {item.description || ""}
                              </td>
                              <td className="h-9 border border-teal-200 px-3 text-right">
                                {unitPrice.toFixed(2)}
                              </td>
                              <td className="h-9 border border-teal-200 px-3 text-right">
                                {amount.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}

                        {Array.from({
                          length: Math.max(
                            0,
                            ITEMS_PER_PRINT_PAGE - pageItems.length,
                          ),
                        }).map((_, emptyIndex) => (
                          <tr key={`preview-empty-${pageIndex}-${emptyIndex}`}>
                            <td className="h-9 border border-teal-200">
                              &nbsp;
                            </td>
                            <td className="h-9 border border-teal-200">
                              &nbsp;
                            </td>
                            <td className="h-9 border border-teal-200">
                              &nbsp;
                            </td>
                            <td className="h-9 border border-teal-200">
                              &nbsp;
                            </td>
                            <td className="h-9 border border-teal-200">
                              &nbsp;
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* FINAL PAGE ONLY */}
                  {isLastPage && (
                    <div className="mx-5 mt-4 grid grid-cols-[53%_47%]">
                      <div className="min-h-[150px] border border-teal-300">
                        <div className="bg-teal-50 px-4 py-3 text-sm font-black">
                          Terms & Conditions
                        </div>

                        <div className="px-4 py-3 text-sm">
                          <div className="grid grid-cols-[25px_1fr] gap-2">
                            <span className="font-semibold">1.</span>

                            <div className="leading-6">
                              <div>Bank Information - IBAN - Talaa Fakhir</div>
                              <div>مؤسسة محمد عبدالله الملا</div>
                              <div>IBAN: SA51 8000 0451 6080 1631 0298</div>
                            </div>
                          </div>

                          {quotationTerms.slice(0, 4).map((term, termIndex) => (
                            <div
                              key={termIndex}
                              className="mt-1 grid grid-cols-[25px_1fr] gap-2"
                            >
                              <span className="font-semibold">
                                {termIndex + 2}.
                              </span>
                              <span>{term.trim() || " "}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-teal-300">
                        <div className="grid grid-cols-2 border-b border-r border-teal-300 text-sm">
                          <strong className="px-4 py-3">Subtotal</strong>
                          <span className="px-4 py-3 text-right">
                            {quotationSubtotal.toFixed(2)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 border-b border-r border-teal-300 text-sm">
                          <strong className="px-4 py-3">Tax Rate</strong>
                          <span className="px-4 py-3 text-right">15.00%</span>
                        </div>

                        <div className="grid grid-cols-2 border-b border-r border-teal-300 text-sm">
                          <strong className="px-4 py-3">VAT 15%</strong>
                          <span className="px-4 py-3 text-right">
                            {quotationVat.toFixed(2)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 border-b border-r border-teal-300 text-sm">
                          <strong className="px-4 py-3">Other</strong>
                          <span className="px-4 py-3 text-right">-</span>
                        </div>

                        <div className="grid grid-cols-2 border-b border-r border-teal-300 bg-teal-200 text-lg">
                          <strong className="px-4 py-3">Total</strong>
                          <span className="px-4 py-3 text-right font-black">
                            {quotationTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="mx-5 mb-5 mt-auto flex h-14 overflow-hidden bg-teal-50">
                    <div
                      className="flex w-[54%] items-center bg-teal-700 pl-8 text-white"
                      style={{
                        clipPath: "polygon(0 0, 88% 0, 100% 100%, 0 100%)",
                      }}
                    >
                      <span className="text-2xl italic">Thank you!</span>
                    </div>

                    <div className="flex flex-1 items-center justify-end pr-7 text-sm text-slate-900">
                      Page {pageIndex + 1} of {quotationPrintPages.length}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <style>{`
      .quotation-print {
        display: none;
      }

      @media print {
        @page {
          size: A4 portrait;
          margin: 0;
        }

        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }

        main {
          margin: 0 !important;
          padding: 0 !important;
        }

        body * {
          visibility: hidden !important;
        }

        main > * {
          display: none !important;
        }

        .quotation-print,
        .quotation-print * {
          visibility: visible !important;
        }

        main > .quotation-print {
          display: block !important;
        }

        .quotation-print {
          display: block !important;
          position: static;
          width: 210mm;
          margin: 0;
          padding: 0;
          background: white;
          color: #142f31;
          font-family: Arial, Helvetica, sans-serif;
        }

        .quotation-print-page {
          width: 210mm;
          height: 297mm;
          margin: 0;
          padding: 3mm;
          position: relative;
          background: white;
          box-sizing: border-box;
          overflow: hidden;
          break-after: page;
          page-break-after: always;
        }

        .quotation-print-page:last-child {
          break-after: auto;
          page-break-after: auto;
        }

        /* TARGET HEADER */
        .quotation-print-header {
          display: flex;
          width: 100%;
          height: 44mm;
          background: #eefaf9;
          box-sizing: border-box;
        }

        .quotation-print-left-bar {
          width: 8mm;
          background: #10a99d;
          flex-shrink: 0;
        }

        .quotation-print-header-content {
          flex: 1;
          padding: 3mm 6mm 3mm 7mm;
          box-sizing: border-box;
        }

        .quotation-print-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .quotation-print-logo {
          display: block;
          width: auto;
          height: 22mm;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .quotation-print-heading-meta {
          width: 55mm;
        }

        .quotation-print-heading-meta h1 {
          margin: 0 0 4mm 0;
          color: #075b5b;
          font-size: 20pt;
          line-height: 1;
          font-weight: 900;
          text-align: left;
          letter-spacing: 0.2px;
        }

        .quotation-print-meta {
          display: flex;
          flex-direction: column;
          gap: 1.2mm;
          font-size: 9pt;
          transform: translateX(-6mm);
        }

        .quotation-print-meta > div {
          display: grid;
          grid-template-columns: 27mm 3mm 1fr;
          gap: 0;
        }

        .quotation-print-meta > div::after {
          content: ":";
          grid-column: 2;
          grid-row: 1;
          text-align: center;
          font-weight: 800;
        }

        .quotation-print-meta strong {
          text-align: left;
          font-weight: 800;
          color: #142f31;
        }

        .quotation-print-meta span {
          grid-column: 3;
          white-space: nowrap;
          text-align: left;
        }

        .quotation-print-company {
          margin-top: -4.5mm;
          font-size: 9pt;
          line-height: 1.42;
        }

        .quotation-print-company strong {
          display: block;
          margin-bottom: 0.6mm;
          font-size: 9pt;
          font-weight: 800;
          color: #142f31;
        }

        .quotation-print-company p {
          margin: 0;
        }

        /* CUSTOMER / SALESPERSON / TERMS */
        .quotation-print-info-row {
          display: grid;
          grid-template-columns: 57% 21.5% 21.5%;
          width: 100%;
          margin-top: 3mm;
          min-height: 25mm;
          box-sizing: border-box;
        }

        .quotation-print-customer-box,
        .quotation-print-small-box {
          border: 0.3mm solid #67c9c3;
          box-sizing: border-box;
          font-size: 9pt;
        }

        .quotation-print-customer-box {
          padding: 2.5mm 3mm;
        }

        .quotation-print-customer-box strong {
          display: block;
          margin-bottom: 1.5mm;
          font-size: 9pt;
          font-weight: 800;
        }

        .quotation-print-customer-box p {
          margin: 0;
          line-height: 1.45;
        }

        .quotation-print-small-box {
          border-left: none;
          display: flex;
          flex-direction: column;
        }

        .quotation-print-small-box strong {
          display: block;
          min-height: 8mm;
          padding: 2.5mm 3mm;
          background: #eefaf9;
          border-bottom: 0.3mm solid #67c9c3;
          box-sizing: border-box;
          font-size: 8pt;
          font-weight: 800;
        }

        .quotation-print-small-box span {
          display: block;
          padding: 3mm;
          font-size: 8pt;
        }

        /* ITEMS */
        .quotation-print-items {
          width: 100%;
          margin-top: 3mm;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 8pt;
        }

        .quotation-print-items th {
          height: 8mm;
          padding: 1.5mm 2mm;
          border: 0.3mm solid #4fb6b0;
          background: #087d78;
          color: white;
          font-weight: 800;
          vertical-align: middle;
        }

        .quotation-print-items td {
          height: 8mm;
          padding: 1.5mm 2mm;
          border: 0.3mm solid #9ed7d3;
          box-sizing: border-box;
          vertical-align: middle;
        }

        .quotation-print-items th:nth-child(1) {
          width: 11%;
          text-align: center;
        }

        .quotation-print-items th:nth-child(2) {
          width: 14%;
          text-align: center;
        }

        .quotation-print-items th:nth-child(3) {
          width: 42%;
          text-align: center;
        }

        .quotation-print-items th:nth-child(4) {
          width: 16.5%;
          text-align: center;
        }

        .quotation-print-items th:nth-child(5) {
          width: 16.5%;
          text-align: center;
        }

        .quotation-print-items td:nth-child(1),
        .quotation-print-items td:nth-child(2) {
          text-align: center;
        }

        .quotation-print-items td:nth-child(4),
        .quotation-print-items td:nth-child(5) {
          text-align: right;
        }

        /* FINAL PAGE TERMS + TOTALS */
        .quotation-print-bottom {
          display: grid;
          grid-template-columns: 53% 47%;
          width: 100%;
          margin-top: 3mm;
          min-height: 39mm;
          box-sizing: border-box;
        }

        .quotation-print-terms {
          border: 0.3mm solid #67c9c3;
          min-height: 39mm;
          box-sizing: border-box;
        }

        .quotation-print-terms-title {
          padding: 2.5mm 3mm;
          background: #eefaf9;
          font-size: 9pt;
          font-weight: 900;
          color: #142f31;
        }

        .quotation-print-terms-body {
          padding: 2.5mm 3mm;
        }

        .quotation-print-term-row {
          display: grid;
          grid-template-columns: 7mm 1fr;
          min-height: 5mm;
          font-size: 7.5pt;
          line-height: 1.4;
        }

        .quotation-print-term-number {
          font-weight: 600;
        }

        .quotation-print-term-text {
          min-width: 0;
        }

        .quotation-print-totals {
          border-top: 0.3mm solid #67c9c3;
          box-sizing: border-box;
        }

        .quotation-print-totals > div {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 7.2mm;
          border-right: 0.3mm solid #67c9c3;
          border-bottom: 0.3mm solid #67c9c3;
          font-size: 9pt;
          box-sizing: border-box;
        }

        .quotation-print-totals strong,
        .quotation-print-totals span {
          padding: 2mm 3mm;
        }

        .quotation-print-totals strong {
          font-weight: 800;
        }

        .quotation-print-totals span {
          text-align: right;
        }

        .quotation-print-total {
          background: #83e1da;
          font-size: 11pt !important;
          font-weight: 900;
        }

        /* TARGET FOOTER */
        .quotation-print-footer {
          position: absolute;
          left: 3mm;
          right: 3mm;
          bottom: 3mm;
          height: 13mm;
          display: flex;
          align-items: stretch;
          background: #eefaf9;
          box-sizing: border-box;
          overflow: hidden;
        }

        .quotation-print-thankyou {
          position: relative;
          width: 54%;
          height: 100%;
          display: flex;
          align-items: center;
          padding-left: 8mm;
          background: #087d78;
          color: white;
          box-sizing: border-box;
          transform: skewX(24deg);
          transform-origin: bottom left;
        }

        .quotation-print-thankyou span {
          display: inline-block;
          transform: skewX(-24deg);
          font-family: cursive;
          font-size: 19pt;
          font-style: italic;
          line-height: 1;
          white-space: nowrap;
        }

        .quotation-print-page-number {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 7mm;
          font-size: 9pt;
          color: #111827;
          box-sizing: border-box;
        }
      }
    `}</style>
      <main className="px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveScreen("dashboard")}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div>
            <h1 className="text-3xl font-black text-slate-900">Quotation</h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Create a new quotation for a customer or company.
            </p>
          </div>
        </div>

        {/* BOX 1 â€” CUSTOMER INFORMATION */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Customer Information
              </h2>

              <p className="text-xs font-medium text-slate-500">
                Enter the customer or company details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            {/* Customer No. */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Quotation No.
              </label>

              <input
                type="text"
                value={customerNo || "Auto-generated on Save"}
                readOnly
                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500 outline-none"
              />
            </div>

            {/* Customer / Company */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Customer / Company
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer or company name"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Address
              </label>

              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Enter customer address"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Contact Number
              </label>

              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter contact number"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>
        {/* BOX 2 â€” QUOTATION ITEMS */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Quotation Items
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Add the items or services included in this quotation.
              </p>
            </div>

            <button
              type="button"
              onClick={addQuotationItem}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto p-6">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-black text-slate-600">
                    S.No.
                  </th>
                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-black text-slate-600">
                    Description
                  </th>
                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-black text-slate-600">
                    Quantity
                  </th>
                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-black text-slate-600">
                    Unit Price (âƒ)
                  </th>
                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-black text-slate-600">
                    Amount (âƒ)
                  </th>
                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-black text-slate-600">
                    VAT 15% (âƒ)
                  </th>
                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-black text-slate-600">
                    Total (âƒ)
                  </th>
                  <th className="border border-slate-200 px-3 py-3 text-center text-xs font-black text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {quotationItems.map((item, index) => {
                  const quantity = Number(item.quantity) || 0;
                  const unitPrice = Number(item.unitPrice) || 0;
                  const amount = quantity * unitPrice;
                  const vat = amount * 0.15;
                  const total = amount + vat;

                  return (
                    <tr key={index}>
                      <td className="border border-slate-200 px-3 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.serialNumber}
                          onChange={(e) =>
                            updateQuotationItem(
                              index,
                              "serialNumber",
                              e.target.value,
                            )
                          }
                          className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>

                      <td className="border border-slate-200 px-3 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateQuotationItem(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Enter description"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>

                      <td className="border border-slate-200 px-3 py-3">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuotationItem(
                              index,
                              "quantity",
                              e.target.value,
                            )
                          }
                          className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>

                      <td className="border border-slate-200 px-3 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateQuotationItem(
                              index,
                              "unitPrice",
                              e.target.value,
                            )
                          }
                          className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>

                      <td className="border border-slate-200 bg-slate-50 px-3 py-3 text-right text-sm font-bold text-slate-700">
                        {amount.toFixed(2)}
                      </td>

                      <td className="border border-slate-200 bg-slate-50 px-3 py-3 text-right text-sm font-bold text-slate-700">
                        {vat.toFixed(2)}
                      </td>

                      <td className="border border-slate-200 bg-slate-50 px-3 py-3 text-right text-sm font-black text-slate-900">
                        {total.toFixed(2)}
                      </td>

                      <td className="border border-slate-200 px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeQuotationItem(index)}
                          disabled={quotationItems.length === 1}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* BOX 3 â€” TERMS & CONDITIONS */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-black text-slate-900">
              Terms & Conditions
            </h2>

            <p className="text-xs font-medium text-slate-500">
              Add any terms and conditions for this quotation.
            </p>
          </div>

          <div className="p-6">
            {/* Hardcoded Bank Information */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                Bank Information مؤسسة محمد عبدالله الملا IBAN: SA51 8000 0451
                6080 1631 0298
              </div>
            </div>

            {/* Editable Terms */}
            <div className="space-y-3">
              {quotationTerms.map((term, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => updateQuotationTerm(index, e.target.value)}
                    placeholder="Enter terms and conditions"
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => removeQuotationTerm(index)}
                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                    title="Delete term"
                  >
                    {String.fromCharCode(215)}
                  </button>
                </div>
              ))}
            </div>

            {/* Add Term */}
            <div className="mt-4">
              <button
                type="button"
                onClick={addQuotationTerm}
                className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" />
                Add Term
              </button>
            </div>
          </div>
        </section>

        {/* SAVE + PRINT QUOTATION */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={handlePrintQuotation}
            className="flex items-center gap-2 rounded-xl border border-teal-600 bg-white px-6 py-3 text-sm font-bold text-teal-700 shadow-sm transition hover:bg-teal-50"
          >
            <Printer className="h-4 w-4" />
            Quotation
          </button>

          <button
            type="button"
            onClick={handleSaveQuotation}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Quotation"}
          </button>
        </div>
        {/* PRINT-ONLY QUOTATION */}
        <div className="quotation-print">
          {quotationPrintPages.map((pageItems, pageIndex) => {
            const isLastPage = pageIndex === quotationPrintPages.length - 1;

            return (
              <div
                className="quotation-print-page"
                key={`quotation-print-page-${pageIndex}`}
              >
                {/* HEADER */}
                <div className="quotation-print-header">
                  <div className="quotation-print-left-bar"></div>

                  <div className="quotation-print-header-content">
                    <div className="quotation-print-title-row">
                      <img
                        src="/images/quotation-logo.png"
                        alt="Garage AlTalaa AlFahir"
                        className="quotation-print-logo"
                      />

                      <div className="quotation-print-heading-meta">
                        <h1>QUOTATION</h1>

                        <div className="quotation-print-meta">
                          <div>
                            <strong>Date</strong>
                            <span>
                              {new Date().toLocaleDateString("en-GB")}
                            </span>
                          </div>

                          <div>
                            <strong>Quotation #</strong>
                            <span>{customerNo || "Pending"}</span>
                          </div>

                          <div>
                            <strong>Customer ID</strong>
                            <span>{customerNo || "Pending"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="quotation-print-company">
                      <strong>Garage AlTalaa AlFahir</strong>
                      <p>Jeddah-Smart City Asfan shop No.2162 A.B</p>
                      <p>Phone: +966 50 662 0654</p>
                      <p>Email: talaa.alfakhir@gmail.com</p>
                    </div>
                  </div>
                </div>

                {/* CUSTOMER / SALESPERSON / TERMS */}
                <div className="quotation-print-info-row">
                  <div className="quotation-print-customer-box">
                    <strong>Quotation for:</strong>
                    <p>{customerName || "-"}</p>
                    <p>{customerAddress || "-"}</p>
                    <p>{contactNumber || "-"}</p>
                    <p>{email || "-"}</p>
                  </div>

                  <div className="quotation-print-small-box">
                    <strong>Salesperson</strong>
                    <span>Admin</span>
                  </div>

                  <div className="quotation-print-small-box">
                    <strong>Terms</strong>
                    <span>&nbsp;</span>
                  </div>
                </div>

                {/* ITEMS TABLE */}
                <table className="quotation-print-items">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Quantity</th>
                      <th>Description</th>
                      <th>Unit Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pageItems.map((item, itemIndex) => {
                      const quantity = Number(item.quantity) || 0;
                      const unitPrice = Number(item.unitPrice) || 0;
                      const amount = quantity * unitPrice;

                      return (
                        <tr key={`${pageIndex}-${itemIndex}`}>
                          <td>{item.serialNumber}</td>
                          <td>{quantity}</td>
                          <td>{item.description || ""}</td>
                          <td>{unitPrice.toFixed(2)}</td>
                          <td>{amount.toFixed(2)}</td>
                        </tr>
                      );
                    })}

                    {Array.from({
                      length: Math.max(
                        0,
                        ITEMS_PER_PRINT_PAGE - pageItems.length,
                      ),
                    }).map((_, emptyIndex) => (
                      <tr key={`empty-${pageIndex}-${emptyIndex}`}>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* FINAL PAGE ONLY */}
                {isLastPage && (
                  <div className="quotation-print-bottom">
                    <div className="quotation-print-terms">
                      <div className="quotation-print-terms-title">
                        Terms & Conditions
                      </div>

                      <div className="quotation-print-terms-body">
                        <div className="quotation-print-term-row">
                          <span className="quotation-print-term-number">
                            1.
                          </span>

                          <div className="quotation-print-term-text">
                            <div>Bank Information - IBAN - Talaa Fakhir</div>
                            <div>مؤسسة محمد عبدالله الملا</div>
                            <div>IBAN: SA51 8000 0451 6080 1631 0298</div>
                          </div>
                        </div>

                        {quotationTerms.slice(0, 4).map((term, termIndex) => (
                          <div
                            key={termIndex}
                            className="quotation-print-term-row"
                          >
                            <span className="quotation-print-term-number">
                              {termIndex + 2}.
                            </span>

                            <span className="quotation-print-term-text">
                              {term.trim() || " "}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="quotation-print-totals">
                      <div>
                        <strong>Subtotal</strong>
                        <span>{quotationSubtotal.toFixed(2)}</span>
                      </div>

                      <div>
                        <strong>Tax Rate</strong>
                        <span>15.00%</span>
                      </div>

                      <div>
                        <strong>VAT 15%</strong>
                        <span>{quotationVat.toFixed(2)}</span>
                      </div>

                      <div>
                        <strong>Other</strong>
                        <span>-</span>
                      </div>

                      <div className="quotation-print-total">
                        <strong>Total</strong>
                        <span>{quotationTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* FOOTER */}
                <div className="quotation-print-footer">
                  <div className="quotation-print-thankyou">
                    <span>Thank you!</span>
                  </div>

                  <div className="quotation-print-page-number">
                    Page {pageIndex + 1} of {quotationPrintPages.length}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
