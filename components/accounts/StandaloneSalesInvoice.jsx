"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, House, Phone, Plus, Printer, Trash2 } from "lucide-react";

const DISCLAIMER_EN =
  "This is not a tax invoice. Please request a tax invoice if required.";

const DISCLAIMER_AR =
  "هذه ليست فاتورة ضريبية. يرجى طلب فاتورة ضريبية عند الحاجة.";

const money = (value) =>
  Number(value || 0).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const newItem = (category = "item") => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  category,
  description: "",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
});

export default function StandaloneSalesInvoice({
  template = "professional",
  setActiveScreen,
  initialInvoice = null,
  backScreen = "sales",
}) {
  const workshop = template === "workshop";

  const [invoice, setInvoice] = useState(() => ({
    number: "",
    date: new Date().toISOString().slice(0, 10),
    company: "",
    companyArabic: "",
    companyPhone: "",
    companyAddress: "",
    customer: "",
    customerArabic: "",
    customerPhone: "",
    customerAddress: "",
    vehicleMake: "",
    vehicleModel: "",
    plateNumber: "",
    chassisNumber: "",
    mileage: "",
    notes: "",
    discount: 0,
    ...(initialInvoice
      ? {
          number: initialInvoice.invoice_no || "",
          date: initialInvoice.invoice_date || "",
          company: initialInvoice.company_name || "",
          companyArabic: initialInvoice.company_name_ar || "",
          companyPhone: initialInvoice.company_phone || "",
          companyAddress: initialInvoice.company_address || "",
          customer: initialInvoice.customer_name || "",
          customerArabic: initialInvoice.customer_name_ar || "",
          customerPhone: initialInvoice.customer_phone || "",
          customerAddress: initialInvoice.customer_address || "",
          vehicleMake: initialInvoice.vehicle_make || "",
          vehicleModel: initialInvoice.vehicle_model || "",
          plateNumber: initialInvoice.plate_number || "",
          chassisNumber: initialInvoice.chassis_number || "",
          mileage: initialInvoice.mileage || "",
          notes: initialInvoice.notes || "",
          discount: initialInvoice.discount || 0,
        }
      : {}),
  }));

  const [saving, setSaving] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(initialInvoice);
  const [saveError, setSaveError] = useState("");
  const [items, setItems] = useState(() =>
    initialInvoice?.items?.length
      ? initialInvoice.items.map((item) => ({
          ...item,
          id: newItem().id,
        }))
      : [newItem(workshop ? "part" : "item")],
  );

  // RW_CUSTOMER_LOOKUP_V1
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerMatches, setCustomerMatches] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // CW_CUSTOMER_SEARCH_BOTH_V1
  const searchCustomers = async () => {
    const query = customerSearch.trim().toLowerCase();

    if (!query) {
      setCustomerMatches([]);
      setCustomerError("Enter a name, phone number, email or customer ID.");
      return;
    }

    setCustomerLoading(true);
    setCustomerError("");
    setCustomerMatches([]);

    try {
      const results = await Promise.allSettled([
        fetch("/api/crm/customers", {
          credentials: "same-origin",
          cache: "no-store",
        }).then(async (response) => {
          if (!response.ok) throw new Error("CRM customer lookup failed");
          return response.json();
        }),
        fetch("/api/quotations", {
          credentials: "same-origin",
          cache: "no-store",
        }).then(async (response) => {
          if (!response.ok) throw new Error("Quotation customer lookup failed");
          return response.json();
        }),
      ]);

      const crmRecords =
        results[0].status === "fulfilled" && Array.isArray(results[0].value)
          ? results[0].value
          : [];

      const quotations =
        results[1].status === "fulfilled" && Array.isArray(results[1].value)
          ? results[1].value
          : [];

      if (results.every((result) => result.status === "rejected")) {
        throw new Error("Unable to load customers from either source.");
      }

      const normalized = [
        ...crmRecords.map((customer) => ({
          id: `crm-${customer.id}`,
          originalId: customer.id,
          source: "CRM",
          name: [customer.first_name, customer.last_name]
            .filter(Boolean)
            .join(" ")
            .trim(),
          phone: customer.phone || "",
          address: customer.address || "",
          email: customer.email || "",
        })),
        ...quotations.map((quotation) => ({
          id: `quotation-${quotation.id}`,
          originalId: null,
          source: "Quotation",
          name: quotation.customer_name || "",
          phone: quotation.contact_number || "",
          address: quotation.address || "",
          email: quotation.email || "",
        })),
      ];

      const seen = new Set();

      const matches = normalized.filter((customer) => {
        const searchable = [
          customer.name,
          customer.phone,
          customer.address,
          customer.email,
          customer.originalId,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );

        if (!searchable) return false;

        const identity = customer.phone.trim()
          ? `phone:${customer.phone.replace(/\D/g, "")}`
          : `name:${customer.name.trim().toLowerCase()}`;

        if (seen.has(identity)) return false;
        seen.add(identity);
        return true;
      });

      setCustomerMatches(matches.slice(0, 30));

      if (matches.length === 0) {
        setCustomerError("No matching customer found.");
      }
    } catch (error) {
      setCustomerError(error.message || "Customer search failed.");
    } finally {
      setCustomerLoading(false);
    }
  };

  const selectExistingCustomer = (customer) => {
    setInvoice((previous) => ({
      ...previous,
      customer: customer.name || "",
      customerPhone: customer.phone || "",
      customerAddress: customer.address || "",
    }));

    setSelectedCustomerId(customer.originalId || customer.id);
    setCustomerSearch(customer.name || "");
    setCustomerMatches([]);
    setCustomerError("");
  };
  const updateInvoice = (key, value) =>
    setInvoice((previous) => ({ ...previous, [key]: value }));

  const updateItem = (id, key, value) =>
    setItems((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        Math.max(
          0,
          Number(item.quantity || 0) * Number(item.unitPrice || 0) -
            Number(item.discount || 0),
        ),
      0,
    );

    const discount = Math.max(0, Number(invoice.discount || 0));

    return {
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
    };
  }, [items, invoice.discount]);

  const handleSaveInvoice = async () => {
    if (saving || (savedInvoice && !initialInvoice)) return;

    setSaveError("");

    if (!invoice.customer.trim()) {
      setSaveError("Customer name is required.");
      return;
    }

    if (
      !items.length ||
      items.some(
        (item) => !item.description.trim() || Number(item.quantity) <= 0,
      )
    ) {
      setSaveError("Enter at least one valid invoice item.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/standalone-sales-invoices", {
        method: initialInvoice ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          ...(initialInvoice ? { id: initialInvoice.id } : {}),
          template_type: template,
          invoice_date: invoice.date,
          company_name: invoice.company,
          company_name_ar: invoice.companyArabic,
          company_phone: invoice.companyPhone,
          company_address: invoice.companyAddress,
          customer_name: invoice.customer,
          customer_name_ar: invoice.customerArabic,
          customer_phone: invoice.customerPhone,
          customer_address: invoice.customerAddress,
          vehicle_make: invoice.vehicleMake,
          vehicle_model: invoice.vehicleModel,
          plate_number: invoice.plateNumber,
          chassis_number: invoice.chassisNumber,
          mileage: invoice.mileage,
          items,
          discount: invoice.discount,
          notes: invoice.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save invoice.");
      }

      if (
        result.customerRegistration &&
        ["failed", "skipped"].includes(result.customerRegistration.status)
      ) {
        setSaveError(result.customerRegistration.message);
      } else {
        setSaveError("");
      }

      setSavedInvoice(result.invoice);
      updateInvoice("number", result.invoice.invoice_no);
    } catch (error) {
      setSaveError(error.message || "Failed to save invoice.");
    } finally {
      setSaving(false);
    }
  };
  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500";

  const field = (label, key, type = "text") => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      <input
        type={type}
        value={invoice[key]}
        onChange={(event) => updateInvoice(key, event.target.value)}
        className={inputClass}
      />
    </label>
  );

  const renderTable = (category, heading) => {
    const filtered = workshop
      ? items.filter((item) => item.category === category)
      : items;

    return (
      <section className="mb-6">
        {heading && (
          <h3 className="mb-3 border-b pb-2 text-base font-bold text-slate-800">
            {heading}
          </h3>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-left text-slate-700">
                <th className="border p-2">Description / الوصف</th>
                <th className="border p-2">Qty / الكمية</th>
                <th className="border p-2">Price / السعر</th>
                <th className="border p-2">Discount / الخصم</th>
                <th className="border p-2 text-right">Amount / المبلغ</th>
                <th className="no-print border p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => {
                const amount = Math.max(
                  0,
                  Number(item.quantity || 0) * Number(item.unitPrice || 0) -
                    Number(item.discount || 0),
                );

                return (
                  <tr key={item.id}>
                    <td className="border p-2">
                      <input
                        value={item.description}
                        onChange={(event) =>
                          updateItem(item.id, "description", event.target.value)
                        }
                        className="w-full min-w-40 bg-transparent outline-none"
                        placeholder="Item or service"
                      />
                    </td>
                    {["quantity", "unitPrice", "discount"].map((key) => (
                      <td className="border p-2" key={key}>
                        <input
                          type="number"
                          min="0"
                          step={key === "quantity" ? "1" : "0.01"}
                          value={item[key]}
                          onChange={(event) =>
                            updateItem(item.id, key, event.target.value)
                          }
                          className="w-20 bg-transparent outline-none"
                        />
                      </td>
                    ))}
                    <td className="border p-2 text-right font-semibold">
                      {money(amount)}
                    </td>
                    <td className="no-print border p-2">
                      <button
                        type="button"
                        onClick={() =>
                          setItems((previous) =>
                            previous.filter((row) => row.id !== item.id),
                          )
                        }
                        className="text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={() =>
            setItems((previous) => [...previous, newItem(category)])
          }
          className="no-print mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700"
        >
          <Plus size={16} /> Add {category === "labor" ? "Labor" : "Item"}
        </button>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 md:px-8">
      <style jsx global>{`
      
        /* CW_SALES_INVOICE_ALL_BLACK_TEXT_V1 */
        .invoice-paper,
        .invoice-paper h1,
        .invoice-paper h2,
        .invoice-paper h3,
        .invoice-paper p,
        .invoice-paper span,
        .invoice-paper label,
        .invoice-paper td,
        .invoice-paper th,
        .invoice-paper input,
        .invoice-paper textarea,
        .invoice-paper button {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }

        .invoice-paper input::placeholder,
        .invoice-paper textarea::placeholder {
          color: #000000 !important;
          opacity: 1 !important;
        }

        .cw-print-logo {
          display: none;
        }

        @media print {
          /* CW_FINAL_PRINT_HEADER_V1 */

          .invoice-paper > header {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
            grid-template-rows: auto auto !important;
            align-items: start !important;
            column-gap: 16px !important;
          }

          .invoice-paper > header > .cw-print-logo {
            grid-column: 1 !important;
            grid-row: 1 !important;
            align-self: start !important;
            justify-self: start !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
          }

          .invoice-paper > header > .cw-print-logo img {
            width: 220px !important;
            max-width: 100% !important;
            max-height: 110px !important;
            height: auto !important;
            margin: 0 !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) {
            display: contents !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) > div:last-child {
            grid-column: 2 !important;
            grid-row: 1 / span 2 !important;
            align-self: start !important;
            justify-self: stretch !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .invoice-paper
            > header
            > div:not(.cw-print-logo)
            > div:last-child
            h1 {
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.1 !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) > div:first-child {
            grid-column: 1 !important;
            grid-row: 2 !important;
            align-self: start !important;
          }
          /* CW_EXACT_TOP_ALIGNMENT_V1 */

          .invoice-paper > header {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto auto !important;
            align-items: start !important;
            column-gap: 16px !important;
          }

          .invoice-paper > header > .cw-print-logo {
            grid-column: 1 !important;
            grid-row: 1 !important;
            align-self: start !important;
            justify-self: start !important;
            display: flex !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .invoice-paper > header > .cw-print-logo img {
            display: block !important;
            max-width: 220px !important;
            max-height: 110px !important;
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) {
            display: contents !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) > div:last-child {
            grid-column: 2 !important;
            grid-row: 1 !important;
            align-self: start !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .invoice-paper
            > header
            > div:not(.cw-print-logo)
            > div:last-child
            h1 {
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1 !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) > div:first-child {
            grid-column: 1 !important;
            grid-row: 2 !important;
          }
          /* CW_PRINT_HEADER_ALIGNMENT_V1 */

          .invoice-paper > header {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            column-gap: 16px !important;
            align-items: start !important;
          }

          .invoice-paper > header > .cw-print-logo {
            grid-column: 1 !important;
            grid-row: 1 !important;
            display: flex !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
            margin: 0 !important;
          }

          .invoice-paper > header > .cw-print-logo img {
            max-width: 220px !important;
            max-height: 110px !important;
            width: auto !important;
            height: auto !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) {
            display: contents !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) > div:first-child {
            grid-column: 1 !important;
            grid-row: 2 !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) > div:last-child {
            grid-column: 2 !important;
            grid-row: 1 / span 2 !important;
            align-self: start !important;
          }

          .invoice-paper > header h1 {
            margin-top: 0 !important;
            line-height: 1.2 !important;
          }
          /* CW_HIDE_PRINT_COMPANY_NAMES_V1 */
          .invoice-paper
            > header
            > div:not(.cw-print-logo)
            > div:first-child
            > input:nth-of-type(1),
          .invoice-paper
            > header
            > div:not(.cw-print-logo)
            > div:first-child
            > input:nth-of-type(2) {
            display: none !important;
          }
          /* CW_PRINT_HEADER_FIX_V1 */
          .invoice-paper > header {
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            height: auto !important;
            overflow: visible !important;
            break-inside: avoid !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) {
            display: flex !important;
            visibility: visible !important;
          }

          .invoice-paper > header input,
          .invoice-paper > header h1,
          .invoice-paper > header p,
          .invoice-paper > header span {
            visibility: visible !important;
          }

          .invoice-paper .cw-print-logo {
            display: flex !important;
            justify-content: flex-start !important;
            width: 100% !important;
          }
          .cw-print-logo {
            display: flex !important;
            justify-content: flex-start !important;
            align-items: center !important;
            width: 100% !important;
            margin-bottom: 14px !important;
          }

          .cw-print-logo img {
            display: block !important;
            width: auto !important;
            max-width: 190px !important;
            max-height: 90px !important;
            object-fit: contain !important;
          }


          /* CW_WINDOWS_A4_HEADER_ALIGNMENT_V2 */
          .invoice-paper > header {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
            grid-template-rows: auto auto !important;
            column-gap: 16px !important;
            align-items: start !important;
          }

          .invoice-paper > header > .cw-print-logo {
            display: flex !important;
            grid-column: 1 !important;
            grid-row: 1 !important;
            width: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            align-items: flex-start !important;
          }

          .invoice-paper > header > .cw-print-logo img {
            display: block !important;
            max-width: 190px !important;
            max-height: 90px !important;
            width: auto !important;
            height: auto !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) {
            display: contents !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) > div:first-child {
            grid-column: 1 !important;
            grid-row: 2 !important;
            align-self: start !important;
          }

          .invoice-paper > header > div:not(.cw-print-logo) > div:last-child {
            grid-column: 2 !important;
            grid-row: 1 / span 2 !important;
            align-self: start !important;
            margin: 0 !important;
            padding: 0 !important;
          }


          @page {
            size: A4 portrait;
            margin: 0.1in;
          }
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-paper {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: none !important;
          }
          .invoice-paper input,
          .invoice-paper textarea {
            border: none !important;
            box-shadow: none !important;
            resize: none !important;
          }

          
          /* CW_PRINT_INVOICE_DATE_ALIGNMENT_V2 */
          .invoice-paper > header
          > div:not(.cw-print-logo)
          > div:last-child
          > div.grid {
            display: grid !important;
            grid-template-columns: 75px 110px !important;
justify-content: end !important;
            width: 100% !important;
            gap: 6px 8px !important;
            align-items: center !important;
          }

          .invoice-paper > header
          > div:not(.cw-print-logo)
          > div:last-child
          > div.grid input {
            display: block !important;
            box-sizing: border-box !important;
            width: 110px !important;
            min-width: 0 !important;
            max-width: 110px !important;
            margin: 0 !important;
            padding: 0 !important;
            text-align: right !important;
            border: none !important;
          }

          .invoice-paper > header input[type="date"] {
            appearance: none !important;
            -webkit-appearance: none !important;
          }

          .invoice-paper > header
          input[type="date"]::-webkit-calendar-picker-indicator {
            display: none !important;
            -webkit-appearance: none !important;
          }

          .invoice-paper > header
          input[type="date"]::-webkit-datetime-edit {
            display: block !important;
            width: 100% !important;
            text-align: right !important;
          }

          .invoice-paper > header
          input[type="date"]::-webkit-datetime-edit-fields-wrapper {
            display: flex !important;
            width: 100% !important;
            justify-content: flex-end !important;
          }


          /* CW_PRINT_CUSTOMER_FIELD_BORDERS_V1 */
          .invoice-paper > section:first-of-type label input {
            border: 1px solid #000 !important;
            border-radius: 6px !important;
            padding: 8px 12px !important;
            background: #fff !important;
            box-shadow: none !important;
          }

          .invoice-paper table {
            page-break-inside: auto;
          }
          .invoice-paper tr {
            page-break-inside: avoid;
          }
          
          /* CW_PRINT_COMPACT_NOTES_V1 */
          .invoice-paper > section:has(textarea) {
            margin-top: 12px !important;
            margin-bottom: 0 !important;
          }

          .invoice-paper > section textarea {
          border: 1px solid #000 !important;
border-radius: 6px !important;
box-sizing: border-box !important;
            height: 28px !important;
            min-height: 28px !important;
            max-height: 28px !important;
            padding: 4px 6px !important;
            margin-top: 4px !important;
            overflow: hidden !important;
          }
          
          /* CW_PRINT_INVOICE_FOOTER_V2 */
          .invoice-paper > footer {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            margin-top: 8px !important;
            padding-top: 8px !important;
            border-top: 1px solid #000 !important;
            text-align: center !important;
            break-inside: avoid !important;
          }


          .invoice-paper > footer p,
          .invoice-paper > footer div {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

        }
      `}</style>

      <div className="no-print mx-auto mb-5 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setActiveScreen(backScreen)}
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-semibold"
        >
          <ArrowLeft size={17} />{" "}
          {initialInvoice ? "Back to Records" : "Back to Sales"}
        </button>

        <button
          type="button"
          onClick={handleSaveInvoice}
          disabled={saving || (Boolean(savedInvoice) && !initialInvoice)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2 font-bold text-white disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : initialInvoice
              ? "Save Changes"
              : savedInvoice
                ? `Saved: ${savedInvoice.invoice_no}`
                : "Save to Database"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2 font-bold text-white"
        >
          <Printer size={17} /> Print / Save as PDF
        </button>
      </div>

      {saveError && (
        <p className="no-print mx-auto mb-4 max-w-5xl rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
          {saveError}
        </p>
      )}

      {savedInvoice && (
        <p className="no-print mx-auto mb-4 max-w-5xl rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          Invoice saved successfully. Invoice No: {savedInvoice.invoice_no}
        </p>
      )}
      <section className="no-print mx-auto mb-4 max-w-5xl rounded-xl border border-blue-200 bg-white p-4">
        <h2 className="mb-3 text-base font-black text-slate-800">
          Existing Customer Search / البحث عن عميل
        </h2>

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={customerSearch}
            onChange={(event) => setCustomerSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                searchCustomers();
              }
            }}
            placeholder="Search by customer name, phone, email or ID"
            className="min-w-56 flex-1 rounded-lg border px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={searchCustomers}
            disabled={customerLoading}
            className="rounded-lg bg-blue-700 px-5 py-2 font-bold text-white disabled:opacity-50"
          >
            {customerLoading ? "Searching..." : "Search Customer"}
          </button>
        </div>

        {customerError && (
          <p className="mt-2 text-sm text-red-700">{customerError}</p>
        )}

        {selectedCustomerId && (
          <p className="mt-2 text-sm font-semibold text-emerald-700">
            Existing customer selected.
          </p>
        )}

        {customerMatches.length > 0 && (
          <div className="mt-3 max-h-60 overflow-y-auto rounded-lg border">
            {customerMatches.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => selectExistingCustomer(customer)}
                className="flex w-full items-center justify-between gap-3 border-b px-3 py-3 text-left text-sm hover:bg-blue-50"
              >
                <span className="font-semibold">{customer.name}</span>
                <span className="text-slate-500">
                  {customer.phone || customer.email || ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
      <main className="invoice-paper mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <header className="mb-8 border-b-2 border-slate-800 pb-5">
          {/* CW_PRINT_LOGO_V1 */}
          <div className="cw-print-logo">
            <img src="/images/garage-logo.png" alt="Company Logo" />
          </div>
          <div className="flex flex-wrap justify-between gap-5">
            <div className="min-w-64 flex-1 space-y-2">
              <input
                className="w-full text-2xl font-black outline-none"
                placeholder="Workshop / Company Name"
                value={invoice.company}
                onChange={(event) =>
                  updateInvoice("company", event.target.value)
                }
              />
              <input
                dir="rtl"
                className="w-full text-right text-lg font-bold outline-none"
                placeholder="اسم الشركة / الورشة"
                value={invoice.companyArabic}
                onChange={(event) =>
                  updateInvoice("companyArabic", event.target.value)
                }
              />
              
              {/* CW_COMPANY_CONTACT_ICONS_V1 */}
              <div className="flex items-center gap-2">
                <House
                  size={15}
                  strokeWidth={1.8}
                  className="shrink-0 text-slate-700"
                />
                <input
                  className="min-w-0 flex-1 text-sm outline-none"
                  placeholder="JEDDAH-SMART CITY ASFAN SHOP NO.2162 A.B"
                  value={invoice.companyAddress}
                  onChange={(event) =>
                    updateInvoice("companyAddress", event.target.value)
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Phone
                  size={15}
                  strokeWidth={1.8}
                  className="shrink-0 text-slate-700"
                />
                <input
                  className="min-w-0 flex-1 text-sm outline-none"
                  placeholder="+966 506620654"
                  value={invoice.companyPhone}
                  onChange={(event) =>
                    updateInvoice("companyPhone", event.target.value)
                  }
                />
              </div>

            </div>

            <div className="min-w-56">
              <h1 className="text-right text-2xl font-black">
                {workshop ? "WORKSHOP SALES INVOICE" : "SALES INVOICE"}
              </h1>
              <p className="text-right text-lg font-bold" dir="rtl">
                فاتورة مبيعات
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <span>Invoice No.</span>
                <input
                  className="w-full border-b outline-none"
                  placeholder="Number"
                  value={invoice.number}
                  onChange={(event) =>
                    updateInvoice("number", event.target.value)
                  }
                />
                <span>Date</span>
                <input
                  type="date"
                  className="w-full border-b outline-none"
                  value={invoice.date}
                  onChange={(event) =>
                    updateInvoice("date", event.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </header>

        <section className="mb-7">
          <h2 className="mb-3 text-base font-black">
            Customer Details / بيانات العميل
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {field("Customer Name", "customer")}
            {field("اسم العميل", "customerArabic")}
            {field("Phone / الهاتف", "customerPhone")}
            {field("Address / العنوان", "customerAddress")}
          </div>
        </section>

        {workshop && (
          <section className="mb-7 rounded-lg border bg-slate-50 p-4">
            <h2 className="mb-3 text-base font-black">
              Vehicle Details / بيانات المركبة
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {field("Make / الشركة", "vehicleMake")}
              {field("Model / الطراز", "vehicleModel")}
              {field("Plate Number / اللوحة", "plateNumber")}
              {field("Chassis / الهيكل", "chassisNumber")}
              {field("Mileage / العداد", "mileage")}
            </div>
          </section>
        )}

        {workshop ? (
          <>
            {renderTable("part", "Parts & Materials / قطع الغيار والمواد")}
            {renderTable("labor", "Services & Labor / الخدمات وأجور العمل")}
          </>
        ) : (
          renderTable("item", "Invoice Items / بنود الفاتورة")
        )}

        <section className="ml-auto mt-6 w-full max-w-sm space-y-3 rounded-lg border p-4">
          <div className="flex justify-between">
            <span>Subtotal / المجموع</span>
            <strong>{money(totals.subtotal)} SAR</strong>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span>Additional Discount / خصم إضافي</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={invoice.discount}
              onChange={(event) =>
                updateInvoice("discount", event.target.value)
              }
              className="w-24 rounded border px-2 py-1 text-right"
            />
          </div>

          <div className="flex justify-between border-t-2 pt-3 text-lg font-black">
            <span>Total / الإجمالي</span>
            <span>{money(totals.total)} SAR</span>
          </div>
        </section>

        <section className="mt-8">
          <label className="block text-sm font-bold">
            Notes / ملاحظات
            <textarea
              value={invoice.notes}
              onChange={(event) => updateInvoice("notes", event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border p-3 text-sm font-normal"
              placeholder="Additional notes..."
            />
          </label>
        </section>

        {workshop && (
          <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
            <div className="border-t pt-2">Prepared By / أعد بواسطة</div>
            <div className="border-t pt-2">
              Customer Signature / توقيع العميل
            </div>
          </div>
        )}

        <footer className="mt-12 border-t pt-5 text-center">
          <p className="font-bold">Thank you for your business!</p>
          <p className="font-bold" dir="rtl">
            شكراً لتعاملكم معنا
          </p>

          <div className="mt-5 text-[9px] leading-relaxed text-slate-500">
            <p>{DISCLAIMER_EN}</p>
            <p dir="rtl">{DISCLAIMER_AR}</p>
          </div>
        </footer>
      </main>

      <p className="no-print mx-auto mt-4 max-w-5xl text-center text-xs text-amber-700">
        Save the invoice to the database before printing the final copy.
      </p>
    </div>
  );
}
