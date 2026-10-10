"use client";

import { useEffect, useMemo, useState } from "react";

const ADMIN_ID = "4502b4f1-2e5b-4e62-81c5-0b6e93ec66a1";
const newRow = () => ({ key: `new-${Date.now()}-${Math.random()}`, id: null, description: "", amount: "", vat: "" });
const formatMoney = (n) => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ExpenseEdit({ expense, currentUser, onCancel, onSaved }) {
  const isAdmin = currentUser?.id === ADMIN_ID && currentUser?.username?.trim().toLowerCase() === "admin";
  const [expenseDate, setExpenseDate] = useState(expense?.expense_date?.slice(0, 10) || "");
  const [expenseType, setExpenseType] = useState(expense?.expense_type || "");
  const [vatRegistrationNumber, setVatRegistrationNumber] = useState(expense?.vat_registration_number || "");
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState("");
  const [rows, setRows] = useState(() => (expense?.items || []).map((item) => ({
    key: item.id,
    id: item.id,
    description: item.description || "",
    amount: String(item.amount ?? ""),
    vat: String(item.vat ?? ""),
  })));
  const [replacementInvoice, setReplacementInvoice] = useState(null);
  const [openingInvoice, setOpeningInvoice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/expense-subcategories", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) throw new Error(data?.error || "Unable to load expense categories.");
        if (!cancelled) setCategories(data);
      })
      .catch((err) => { if (!cancelled) setCategoryError(err.message); });
    return () => { cancelled = true; };
  }, []);

  const totals = useMemo(() => {
    const subtotal = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const vat = rows.reduce((sum, row) => sum + (Number(row.vat) || 0), 0);
    return { subtotal, vat, grandTotal: subtotal + vat };
  }, [rows]);

  const changeRow = (key, field, value) => setRows((previous) => previous.map((row) => row.key === key ? { ...row, [field]: value } : row));

  const handleSave = async () => {
    if (!isAdmin || saving) return;
    setError("");

    if (!expense?.id || !expenseDate || !/^\d{4}-\d{2}-\d{2}$/.test(expenseDate) || !expenseType.trim() || rows.length === 0) {
      setError("Please complete the date, expense type, and at least one detail row.");
      return;
    }
    const validMoney = (value) => /^\d+(\.\d{1,2})?$/.test(String(value).trim());
    if (rows.some((row) => !row.description.trim() || !validMoney(row.amount) || !validMoney(row.vat))) {
      setError("Each detail needs a description and non-negative amounts with at most two decimal places.");
      return;
    }
    try {
      setSaving(true);
      const expenseData = {
        id: expense.id,
        expenseDate,
        expenseType: expenseType.trim(),
        vatRegistrationNumber: vatRegistrationNumber.trim(),
        expectedInvoicePath: expense.invoice_file_path || null,
        items: rows.map((row) => ({
          ...(row.id ? { id: row.id } : {}),
          description: row.description.trim(),
          amount: row.amount.trim(),
          vat: row.vat.trim(),
        })),
      };

      let requestOptions;

      if (replacementInvoice) {
        const formData = new FormData();
        formData.append("expenseData", JSON.stringify(expenseData));
        formData.append("invoiceFile", replacementInvoice);

        requestOptions = {
          method: "PUT",
          body: formData,
        };
      } else {
        requestOptions = {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expenseData),
        };
      }

      const response = await fetch("/api/expenses", requestOptions);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to save expense changes.");
      onSaved?.();
    } catch (err) {
      setError(err.message || "Unable to save expense changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin || !expense) {
    return <div className="p-8 text-red-700">You are not authorized to edit this expense.</div>;
  }

  const categoryOptions = categories.some((item) => item.name_en === expenseType)
    ? categories
    : expenseType ? [{ id: "current", name_en: expenseType, name_ar: "" }, ...categories] : categories;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Expense</h1>
            <p className="mt-1 text-sm text-slate-600">Expense No: <strong>{expense.expense_no}</strong> (cannot be changed)</p>
          </div>
          <button type="button" onClick={onCancel} disabled={saving} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium">Back to Expense Records</button>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Expense Information</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">Purchase Date
              <input type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 p-2.5" />
            </label>
            <label className="text-sm font-medium text-slate-700">Expense Type
              <select value={expenseType} onChange={(event) => setExpenseType(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2.5">
                {!expenseType && <option value="">Select expense type</option>}
                {categoryOptions.map((item) => <option key={item.id} value={item.name_en}>{item.name_en}{item.name_ar ? ` — ${item.name_ar}` : ""}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">VAT Registration Number
              <input type="text" value={vatRegistrationNumber} onChange={(event) => setVatRegistrationNumber(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 p-2.5" />
            </label>
          </div>
          {categoryError && <p className="mt-3 text-sm text-red-700">{categoryError}</p>}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold">Expense Details</h2>
            <button type="button" onClick={() => setRows((previous) => [...previous, newRow()])} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">+ Add Detail</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600"><tr><th className="p-4">Description</th><th className="p-4">Amount</th><th className="p-4">VAT</th><th className="p-4">Action</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.key} className="border-t border-slate-100">
                <td className="p-3"><input aria-label="Description" value={row.description} onChange={(event) => changeRow(row.key, "description", event.target.value)} className="w-full min-w-48 rounded-lg border border-slate-300 p-2.5" /></td>
                <td className="p-3"><input aria-label="Amount" type="number" min="0" step="0.01" value={row.amount} onChange={(event) => changeRow(row.key, "amount", event.target.value)} className="w-36 rounded-lg border border-slate-300 p-2.5" /></td>
                <td className="p-3"><input aria-label="VAT" type="number" min="0" step="0.01" value={row.vat} onChange={(event) => changeRow(row.key, "vat", event.target.value)} className="w-36 rounded-lg border border-slate-300 p-2.5" /></td>
                <td className="p-3"><button type="button" disabled={rows.length === 1} onClick={() => setRows((previous) => previous.filter((item) => item.key !== row.key))} className="text-red-600 disabled:text-slate-300">Remove</button></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Expense Invoice</h2>
            <p className="break-words text-sm text-slate-700">
              Current: {expense.invoice_file_name || "No invoice attached"}
            </p>

            {expense.invoice_file_path && (
              <button
                type="button"
                disabled={openingInvoice}
                onClick={async () => {
                  try {
                    setOpeningInvoice(true);
                    setError("");
                    const response = await fetch(
                      `/api/expenses/invoice?path=${encodeURIComponent(expense.invoice_file_path)}`,
                      { cache: "no-store" }
                    );
                    const result = await response.json();
                    if (!response.ok || !result.url) {
                      throw new Error(result.error || "Unable to open invoice.");
                    }
                    window.open(result.url, "_blank", "noopener,noreferrer");
                  } catch (err) {
                    setError(err.message || "Unable to open invoice.");
                  } finally {
                    setOpeningInvoice(false);
                  }
                }}
                className="mt-3 rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700"
              >
                {openingInvoice ? "Opening..." : "View Existing Invoice"}
              </button>
            )}

            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Replace Invoice (PDF, JPG, JPEG, PNG; maximum 10 MB)
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={saving}
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  if (!file) {
                    setReplacementInvoice(null);
                    return;
                  }
                  if (
                    !["application/pdf", "image/jpeg", "image/png"].includes(file.type) ||
                    file.size > 10 * 1024 * 1024 ||
                    file.size === 0
                  ) {
                    setError("Choose a PDF, JPG, JPEG, or PNG file up to 10 MB.");
                    setReplacementInvoice(null);
                    event.target.value = "";
                    return;
                  }
                  setError("");
                  setReplacementInvoice(file);
                }}
                className="mt-2 block w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </label>

            {replacementInvoice && (
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                Selected replacement: <strong>{replacementInvoice.name}</strong>
                <button
                  type="button"
                  onClick={() => setReplacementInvoice(null)}
                  className="ml-3 font-semibold underline"
                >
                  Keep Existing Invoice
                </button>
              </div>
            )}

            <p className="mt-3 text-xs text-slate-500">
              The existing invoice remains unchanged until you save.
              A successful replacement updates the expense record and attachment.
            </p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Expense Summary</h2>
            <div className="space-y-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><strong>SAR {formatMoney(totals.subtotal)}</strong></div><div className="flex justify-between"><span>VAT</span><strong>SAR {formatMoney(totals.vat)}</strong></div><div className="flex justify-between border-t pt-3 text-base"><span>Grand Total</span><strong>SAR {formatMoney(totals.grandTotal)}</strong></div></div>
          </section>
        </div>

        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" disabled={saving} onClick={onCancel} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium">Cancel</button>
          <button type="button" disabled={saving} onClick={handleSave} className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      </div>
    </main>
  );
}
