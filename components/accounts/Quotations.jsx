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
    window.print();
  };

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

        body * {
          visibility: hidden !important;
        }

        .quotation-print,
        .quotation-print * {
          visibility: visible !important;
        }

        .quotation-print {
          display: block !important;
          position: absolute;
          inset: 0;
          width: 210mm;
          height: 297mm;
          background: white;
          color: #123b3b;
          font-family: Arial, Helvetica, sans-serif;
        }

        .quotation-print-page {
  width: 180mm;
  height: 267mm;
  min-height: 0;
  margin: 15mm auto;
  position: relative;
  background: white;
  box-sizing: border-box;
  overflow: hidden;
}

        /* HEADER */
        .quotation-print-header {
          display: flex;
          width: 100%;
          min-height: 50mm;
          background: #d8f3f1;
        }

        .quotation-print-left-bar {
          width: 9mm;
          background: #148f8a;
          flex-shrink: 0;
        }

        .quotation-print-header-content {
          flex: 1;
          padding: 7mm 8mm 6mm 8mm;
        }

        .quotation-print-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .quotation-print-title-row h1 {
          margin: 0;
          font-size: 25pt;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 0.5px;
          color: #073f40;
        }

        .quotation-print-logo {
  height: 24mm;
  width: auto;
  object-fit: contain;
  display: block;
  mix-blend-mode: multiply;
}

        .quotation-print-meta {
          display: flex;
          flex-direction: column;
          gap: 1.2mm;
          font-size: 7.5pt;
        }

        .quotation-print-meta div {
          display: grid;
          grid-template-columns: 25mm 25mm;
          gap: 2mm;
        }

        .quotation-print-meta strong {
          text-align: right;
        }

        .quotation-print-parties {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15mm;
          margin-top: 6mm;
          font-size: 8pt;
          line-height: 1.35;
        }

        .quotation-print-parties strong {
          display: block;
          margin-bottom: 1.5mm;
          font-size: 9pt;
        }

        .quotation-print-parties p {
          margin: 0;
        }

        /* SALESPERSON */
        .quotation-print-sales {
          margin-top: 5mm;
          border: 0.35mm solid #55bcb7;
        }

        .quotation-print-sales-header,
        .quotation-print-sales-body {
          display: grid;
          grid-template-columns: 1.1fr repeat(4, 1fr) 1.1fr;
        }

        .quotation-print-sales-header {
          background: #d8f3f1;
          font-size: 7.5pt;
          font-weight: 800;
        }

        .quotation-print-sales-header span,
        .quotation-print-sales-body span {
          padding: 2mm 2.5mm;
          border-right: 0.25mm solid #72c8c3;
        }

        .quotation-print-sales-header span:last-child,
        .quotation-print-sales-body span:last-child {
          border-right: none;
        }

        .quotation-print-sales-header span:last-child {
          text-align: right;
        }

        .quotation-print-sales-body {
          min-height: 7mm;
          font-size: 7.5pt;
        }

        /* ITEMS */
        .quotation-print-items {
          width: 100%;
          margin-top: 5mm;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 7.5pt;
        }

        .quotation-print-items th {
          background: #d8f3f1;
          color: #073f40;
          font-weight: 800;
        }

        .quotation-print-items th,
        .quotation-print-items td {
          border: 0.3mm solid #72c8c3;
          padding: 2mm 2.5mm;
          height: 7mm;
        }

        .quotation-print-items th:nth-child(1) {
  width: 10%;
}

.quotation-print-items th:nth-child(2) {
  width: 14%;
}

.quotation-print-items th:nth-child(3) {
  width: 34%;
}

.quotation-print-items th:nth-child(4) {
  width: 19%;
}

.quotation-print-items th:nth-child(5) {
  width: 23%;
}

        .quotation-print-items td:nth-child(1),
.quotation-print-items td:nth-child(2) {
  text-align: center;
}

.quotation-print-items td:nth-child(4),
.quotation-print-items td:nth-child(5) {
  text-align: right;
}

        /* BOTTOM */
        .quotation-print-bottom {
          display: grid;
          grid-template-columns: 1fr 43%;
          gap: 7mm;
          margin-top: 4mm;
          min-height: 48mm;
        }

        .quotation-print-note {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          font-size: 7.5pt;
          line-height: 1.4;
          padding: 0 2.5mm 2mm 2.5mm;
        }

        .quotation-print-note p {
          margin: 0;
        }

        .quotation-print-terms {
  border: 0.3mm solid #55bcb7;
  min-height: 48mm;
}

.quotation-print-terms-title {
  background: #d8f3f1;
  padding: 2.5mm 3mm;
  font-size: 8.5pt;
  font-weight: 800;
  color: #073f40;
}

.quotation-print-terms-body {
  padding: 3mm 3mm;
}

.quotation-print-term-row {
  display: grid;
  grid-template-columns: 7mm 1fr;
  font-size: 7.5pt;
  line-height: 1.45;
  min-height: 5mm;
}

.quotation-print-term-number {
  font-weight: 600;
}

.quotation-print-term-text {
  min-width: 0;
}

        .quotation-print-totals {
          border-left: 0.3mm solid #72c8c3;
          border-top: 0.3mm solid #72c8c3;
        }

        .quotation-print-totals > div {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-right: 0.3mm solid #72c8c3;
          border-bottom: 0.3mm solid #72c8c3;
          min-height: 7mm;
          font-size: 7.5pt;
        }

        .quotation-print-totals strong,
        .quotation-print-totals span {
          padding: 1.8mm 2.5mm;
        }

        .quotation-print-totals span {
          text-align: right;
        }

        .quotation-print-total {
          background: #c5ebe8;
          font-size: 8.5pt !important;
        }

        /* FOOTER */
        .quotation-print-footer {
          display: flex;
          align-items: center;
          min-height: 12mm;
          margin-top: 5mm;
          background: #d8f3f1;
          font-size: 8.5pt;
        }

        .quotation-print-footer-bar {
          width: 9mm;
          align-self: stretch;
          background: #148f8a;
          margin-right: 8mm;
        }

        .quotation-print-footer strong {
          color: #073f40;
        }
      }
    `}</style>
      <main className="px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Quotation</h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Create a new quotation for a customer or company.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveScreen(
                quotationToEdit ? "quotation-records" : "dashboard",
              )
            }
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        {/* BOX 1 — CUSTOMER INFORMATION */}
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
        {/* BOX 2 — QUOTATION ITEMS */}
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
                    Unit Price (⃁)
                  </th>
                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-black text-slate-600">
                    Amount (⃁)
                  </th>
                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-black text-slate-600">
                    VAT 15% (⃁)
                  </th>
                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-black text-slate-600">
                    Total (⃁)
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

        {/* BOX 3 — TERMS & CONDITIONS */}
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
                Bank Information - IBAN - Talaa Fahir
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
                    ×
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
            Print Quotation
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
          <div className="quotation-print-page">
            {/* HEADER */}
            <div className="quotation-print-header">
              <div className="quotation-print-left-bar"></div>

              <div className="quotation-print-header-content">
                <div className="quotation-print-title-row">
                  <img
                    src="/images/garage-logo.png"
                    alt="Garage AlTalaa AlFahir"
                    className="quotation-print-logo"
                  />

                  <div className="quotation-print-meta">
                    <div>
                      <strong>Date</strong>
                      <span>{new Date().toLocaleDateString("en-GB")}</span>
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

                <div className="quotation-print-parties">
                  <div>
                    <strong>Garage AlTalaa AlFahir</strong>
                    <p>Jeddah-Smart City Asfan shop No.2162 A.B</p>
                    <p>Phone: +966 50 662 0654</p>
                    <p>Email: talaa.alfakhir@gmail.com</p>
                  </div>

                  <div>
                    <strong>Quotation for:</strong>
                    <p>{customerName || "-"}</p>
                    <p>{customerAddress || "-"}</p>
                    <p>{contactNumber || "-"}</p>
                    <p>{email || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SALESPERSON / TERMS */}
            <div className="quotation-print-sales">
              <div className="quotation-print-sales-header">
                <span>Salesperson</span>
                <span>Terms</span>
              </div>

              <div className="quotation-print-sales-body">
                <span>Admin</span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
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
                {quotationItems.map((item, index) => {
                  const quantity = Number(item.quantity) || 0;
                  const unitPrice = Number(item.unitPrice) || 0;
                  const amount = quantity * unitPrice;

                  return (
                    <tr key={index}>
                      <td>{item.serialNumber}</td>
                      <td>{quantity}</td>
                      <td>{item.description || ""}</td>
                      <td>{unitPrice.toFixed(2)}</td>
                      <td>{amount.toFixed(2)}</td>
                    </tr>
                  );
                })}

                {/* EMPTY ROWS */}
                {Array.from({
                  length: Math.max(0, 5 - quotationItems.length),
                }).map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* BOTTOM CONTENT */}
            <div className="quotation-print-bottom">
              {/* TERMS & CONDITIONS */}
              <div className="quotation-print-terms">
                <div className="quotation-print-terms-title">
                  Terms & Conditions
                </div>

                <div className="quotation-print-terms-body">
                  {["Bank Information - IBAN - Talaa Fahir", ...quotationTerms]
                    .slice(0, 5)
                    .map((term, index) => (
                      <div key={index} className="quotation-print-term-row">
                        <span className="quotation-print-term-number">
                          {index + 1}.
                        </span>

                        <span className="quotation-print-term-text">
                          {term.trim() || " "}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* TOTALS */}
              <div className="quotation-print-totals">
                {(() => {
                  const subtotal = quotationItems.reduce(
                    (sum, item) =>
                      sum +
                      (Number(item.quantity) || 0) *
                        (Number(item.unitPrice) || 0),
                    0,
                  );

                  const vat = subtotal * 0.15;
                  const total = subtotal + vat;

                  return (
                    <>
                      <div>
                        <strong>Subtotal</strong>
                        <span>{subtotal.toFixed(2)}</span>
                      </div>

                      <div>
                        <strong>Tax Rate</strong>
                        <span>15.00%</span>
                      </div>

                      <div>
                        <strong>VAT 15%</strong>
                        <span>{vat.toFixed(2)}</span>
                      </div>

                      <div>
                        <strong>Other</strong>
                        <span>-</span>
                      </div>

                      <div className="quotation-print-total">
                        <strong>Total</strong>
                        <span>{total.toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* FOOTER */}
            <div className="quotation-print-footer">
              <div className="quotation-print-footer-bar"></div>
              <strong>Thank you!</strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
