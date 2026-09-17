"use client";

import { useMemo, useState } from "react";

const DEFAULT_EXPENSE_TYPES = [
  "Salaries",
  "Rent",
  "Office Stationary",
  "Workshop Equipment",
  "Workshop Tools",
  "Utilities Bill",
];

export default function ExpenseEntry({ setActiveScreen }) {
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [expenseTypes, setExpenseTypes] = useState(DEFAULT_EXPENSE_TYPES);
  const [expenseType, setExpenseType] = useState(DEFAULT_EXPENSE_TYPES[0]);
  const [vatRegistrationNumber, setVatRegistrationNumber] = useState("");

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [details, setDetails] = useState([
    {
      id: 1,
      description: "",
      amount: "",
      vat: "",
    },
  ]);

  const [invoiceFile, setInvoiceFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const addCategory = () => {
    const category = newCategory.trim();

    if (!category) return;

    const exists = expenseTypes.some(
      (type) => type.toLowerCase() === category.toLowerCase(),
    );

    if (exists) {
      setExpenseType(
        expenseTypes.find(
          (type) => type.toLowerCase() === category.toLowerCase(),
        ),
      );
      setNewCategory("");
      setShowAddCategory(false);
      return;
    }

    const updatedTypes = [...expenseTypes, category];

    setExpenseTypes(updatedTypes);
    setExpenseType(category);
    setNewCategory("");
    setShowAddCategory(false);
  };

  const addDetailRow = () => {
    setDetails((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        description: "",
        amount: "",
        vat: "",
      },
    ]);
  };

  const removeDetailRow = (id) => {
    setDetails((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  const updateDetail = (id, field, value) => {
    setDetails((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const summary = useMemo(() => {
    const subtotal = details.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );

    const vat = details.reduce((sum, item) => sum + (Number(item.vat) || 0), 0);

    return {
      subtotal,
      vat,
      grandTotal: subtotal + vat,
    };
  }, [details]);

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleInvoiceChange = (event) => {
    const file = event.target.files?.[0] || null;
    setInvoiceFile(file);
  };

  const handleSave = async () => {
    if (saving) return;

    const validDetails = details.filter(
      (item) => item.description.trim() || item.amount || item.vat,
    );

    if (!expenseDate) {
      alert("Please select an expense date.");
      return;
    }

    if (!expenseType) {
      alert("Please select an expense type.");
      return;
    }

    if (validDetails.length === 0) {
      alert("Please add at least one expense detail.");
      return;
    }

    const incompleteDetail = validDetails.find(
      (item) =>
        !item.description.trim() ||
        Number(item.amount || 0) < 0 ||
        Number(item.vat || 0) < 0,
    );

    if (incompleteDetail) {
      alert("Please complete all expense details correctly.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("expenseDate", expenseDate);
      formData.append("expenseType", expenseType);
      formData.append("vatRegistrationNumber", vatRegistrationNumber.trim());

      formData.append("subtotal", summary.subtotal.toFixed(2));

      formData.append("vatAmount", summary.vat.toFixed(2));

      formData.append("grandTotal", summary.grandTotal.toFixed(2));

      formData.append(
        "items",
        JSON.stringify(
          validDetails.map((item) => ({
            description: item.description.trim(),
            amount: Number(item.amount || 0),
            vat: Number(item.vat || 0),
          })),
        ),
      );

      if (invoiceFile) {
        formData.append("invoiceFile", invoiceFile);
      }

      const response = await fetch("/api/expenses", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save expense.");
      }

      alert(`Expense ${result.expense.expense_no} saved successfully.`);

      handleClear();
    } catch (error) {
      console.error("Save expense error:", error);
      alert(error.message || "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setExpenseType(expenseTypes[0] || "");
    setVatRegistrationNumber("");
    setInvoiceFile(null);

    setDetails([
      {
        id: Date.now(),
        description: "",
        amount: "",
        vat: "",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setActiveScreen("dashboard")}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Back to Dashboard
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Expense Entry</h1>
            <p className="mt-1 text-sm text-slate-500">
              Record and manage workshop expenses
            </p>
          </div>
        </div>

        {/* Expense Information */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Expense Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-3">
            {/* Purchase Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Purchase Date
              </label>

              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Expense Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Expense Type
              </label>

              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {expenseTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddCategory((prev) => !prev)}
                className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                + Add Expense Type
              </button>

              {showAddCategory && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCategory();
                        }
                      }}
                      placeholder="New expense type"
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />

                    <button
                      type="button"
                      onClick={addCategory}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* VAT Registration Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                VAT Registration Number
              </label>

              <input
                type="text"
                value={vatRegistrationNumber}
                onChange={(e) => setVatRegistrationNumber(e.target.value)}
                placeholder="Enter VAT registration number"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </section>

        {/* Expense Details */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Expense Details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add the details and amounts related to this expense
              </p>
            </div>

            <button
              type="button"
              onClick={addDetailRow}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Add Detail
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </th>
                  <th className="w-48 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>
                  <th className="w-48 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    VAT
                  </th>
                  <th className="w-20 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {details.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-5 py-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateDetail(item.id, "description", e.target.value)
                        }
                        placeholder="Enter expense description"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) =>
                          updateDetail(item.id, "amount", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.vat}
                        onChange={(e) =>
                          updateDetail(item.id, "vat", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      />
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeDetailRow(item.id)}
                        disabled={details.length === 1}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Invoice + Summary */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Expense Invoice */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Expense Invoice
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Upload the supporting expense invoice or document
              </p>
            </div>

            <div className="p-5">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-slate-400 hover:bg-slate-100">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                  📄
                </div>

                <span className="text-sm font-semibold text-slate-700">
                  Click to upload invoice
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  PDF, JPG, JPEG or PNG
                </span>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleInvoiceChange}
                  className="hidden"
                />
              </label>

              {invoiceFile && (
                <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {invoiceFile.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {(invoiceFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInvoiceFile(null)}
                    className="ml-4 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Expense Summary */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Expense Summary
              </h2>
            </div>

            <div className="p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Subtotal</span>
                  <span className="text-sm font-semibold text-slate-900">
                    SAR {formatAmount(summary.subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">VAT</span>
                  <span className="text-sm font-semibold text-slate-900">
                    SAR {formatAmount(summary.vat)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-slate-900">
                      Grand Total
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      SAR {formatAmount(summary.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
