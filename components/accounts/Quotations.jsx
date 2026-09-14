"use client";

import { ArrowLeft, FileText, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Quotation({ setActiveScreen }) {
  const [quotationItems, setQuotationItems] = useState([
    {
      serialNumber: 1,
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [quotationTerms, setQuotationTerms] = useState([""]);

  const [customerNo, setCustomerNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        `Quotation saved successfully.\nQuotation No.: ${
          data?.quotation_no || "Generated"
        }`,
      );
    } catch (error) {
      console.error("Save quotation error:", error);
      alert(error.message || "Failed to save quotation.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
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
            onClick={() => setActiveScreen("dashboard")}
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
                Customer No.
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

        {/* SAVE QUOTATION */}
        <div className="flex justify-end pb-8">
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
      </main>
    </div>
  );
}
