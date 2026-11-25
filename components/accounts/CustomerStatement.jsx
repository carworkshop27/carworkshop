"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { FileSpreadsheet, Printer } from "lucide-react";

import {
  ArrowLeft,
  BookOpen,
  Search,
  ChevronDown,
  RefreshCw,
  Users,
  Wallet,
  FileText,
  CalendarDays,
  X
} from "lucide-react";

const API = "/api/customer-statement";

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50";

const transactionLabels = {
  SALES_INVOICE: "Sales Invoice",

  PAYMENT: "Payment",
  PAYMENT_REVERSAL: "Payment Reversal"
};

function amount(value) {
  return Number(value ?? 0).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(value) {
  if (!value) return "-";

  const parts = String(value).slice(0, 10).split("-");

  if (parts.length !== 3) return String(value);

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

async function readApi(url, signal) {
  const response = await fetch(url, {
    cache: "no-store",
    signal
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || "Unable to load Customer Statement."
    );
  }

  return data;
}

function SummaryCard({
  label,
  value,
  tone = "slate",
  currency = true
}) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-900",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700"
  };

  return (
    <div className={`rounded-xl border p-5 ${tones[tone]}`}>
      <p className="text-xs font-black uppercase tracking-wider opacity-80">
        {label}
      </p>

      <p className="mt-3 break-words text-2xl font-black tabular-nums">
        {currency ? amount(value) : Number(value || 0)}
      </p>

      {currency && (
        <p className="mt-1 text-xs font-semibold opacity-70">
          SAR
        </p>
      )}
    </div>
  );
}

export default function CustomerStatement({ setActiveScreen, embedded = false }) {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [statement, setStatement] = useState(null);

  const [customersLoading, setCustomersLoading] = useState(true);
  const [statementLoading, setStatementLoading] = useState(false);

  const [customerError, setCustomerError] = useState("");
  const [statementError, setStatementError] = useState("");

  const [refreshVersion, setRefreshVersion] = useState(0);

  const dropdownRef = useRef(null);

  const selectedCustomer = useMemo(
    () => customers.find(
      (customer) => customer.customer_id === customerId
    ),
    [customers, customerId]
  );

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) =>
      `${customer.customer_number || ""} ${customer.customer_name || ""} ${customer.phone || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [customers, search]);

  const invalidDateRange =
    Boolean(dateFrom && dateTo && dateFrom > dateTo);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCustomers() {
      setCustomersLoading(true);
      setCustomerError("");

      try {
        const data = await readApi(
          API,
          controller.signal
        );

        if (!controller.signal.aborted) {
          const rows = Array.isArray(data.customers)
            ? data.customers
            : [];

          setCustomers(rows);

          setCustomerId((previous) =>
            rows.some((row) => row.customer_id === previous)
              ? previous
              : ""
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setCustomerError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCustomersLoading(false);
        }
      }
    }

    loadCustomers();

    return () => controller.abort();
  }, [refreshVersion]);

  useEffect(() => {
    const controller = new AbortController();

    setStatement(null);
    setStatementError("");

    if (!customerId || invalidDateRange) {
      setStatementLoading(false);

      return () => controller.abort();
    }

    async function loadStatement() {
      setStatementLoading(true);

      try {
        const params = new URLSearchParams({
          customerId
        });

        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);

        const data = await readApi(
          `${API}?${params.toString()}`,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setStatement(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setStatementError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setStatementLoading(false);
        }
      }
    }

    loadStatement();

    return () => controller.abort();
  }, [
    customerId,
    dateFrom,
    dateTo,
    invalidDateRange,
    refreshVersion
  ]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => document.removeEventListener(
      "mousedown",
      handleOutsideClick
    );
  }, []);

  function selectCustomer(customer) {
    if (customer.customer_id === customerId) {
      setSearch("");
      setDropdownOpen(false);
      return;
    }
    setStatement(null);
    setCustomerId(customer.customer_id);
    setSearch("");
    setDropdownOpen(false);
  }

  function clearCustomer() {
    setCustomerId("");
    setStatement(null);
    setSearch("");
    setDropdownOpen(false);
  }

  function clearDates() {
    setDateFrom("");
    setDateTo("");
  }

  const currentStatement =
    statement?.customer?.customer_id === customerId &&
    (statement?.filters?.dateFrom || "") === dateFrom &&
    (statement?.filters?.dateTo || "") === dateTo
      ? statement
      : null;

  const summary = currentStatement?.summary;

  function getStatementFilename() {
    const customer = currentStatement?.customer;

    const safeName = String(
      customer?.customer_name || "Customer"
    )
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100)
      .replace(/[. ]+$/g, "") || "Customer";

    const period = !dateFrom && !dateTo
      ? "All_Dates"
      : `${dateFrom || "Beginning"}_to_${dateTo || "Latest"}`;

    return `${safeName}_${period}`;
  }

  // WORKSHOP_LEDGER_PRINT_V1

  function handlePrintStatement() {
    if (
      !currentStatement ||
      !summary ||
      customersLoading ||
      statementLoading ||
      invalidDateRange
    ) {
      return;
    }

    const escapeHtml = (value) =>
      String(value ?? "").replace(
        /[&<>"']/g,
        (character) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        })[character]
      );

    const customer = currentStatement.customer;

    const rows = Array.isArray(
      currentStatement.transactions
    )
      ? currentStatement.transactions
      : [];

    const periodFrom = dateFrom
      ? formatDate(dateFrom)
      : "Beginning";

    const periodTo = dateTo
      ? formatDate(dateTo)
      : "Latest";

    const generatedAt = new Date().toLocaleString(
      "en-GB",
      {
        timeZone: "Asia/Riyadh"
      }
    );

    const transactionRows = rows.map((row) => `
      <tr>
        <td>${escapeHtml(formatDate(row.transaction_date))}</td>
        <td class="job">${escapeHtml(row.reference_no)}</td>
        <td>${escapeHtml(
          transactionLabels[row.transaction_type]
          || row.transaction_type
        )}</td>
        <td>${escapeHtml(row.description)}</td>
        <td class="number debit">${amount(row.debit)}</td>
        <td class="number credit">${amount(row.credit)}</td>
        <td class="number balance">${amount(row.running_balance)}</td>
      </tr>
    `).join("");

    const printWindow = window.open(
      "",
      "_blank",
      "width=1200,height=850"
    );

    if (!printWindow) {
      window.alert(
        "Please allow pop-ups to print the Customer Statement."
      );
      return;
    }

    try {
      printWindow.opener = null;

      printWindow.document.open();

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">

          <title>${escapeHtml(getStatementFilename())}</title>

          <style>

            @page {
              size: A4 landscape;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              background: #ffffff;
              color: #172033;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #1d4ed8;
              padding-bottom: 14px;
              margin-bottom: 18px;
            }

            .company {
              font-size: 25px;
              font-weight: 800;
              color: #172033;
            }

            .subtitle {
              font-size: 16px;
              font-weight: 700;
              color: #1d4ed8;
              margin-top: 6px;
            }

            .generated {
              text-align: right;
              line-height: 1.7;
              color: #64748b;
            }

            .customer {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              border: 1px solid #cbd5e1;
              background: #f8fafc;
              padding: 12px;
              margin-bottom: 18px;
              break-inside: avoid;
            }

            .customer p {
              margin: 5px 0;
              line-height: 1.5;
            }

            .section-title {
              margin: 16px 0 8px;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              font-weight: 800;
              color: #475569;
            }

            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-bottom: 14px;
              break-inside: avoid;
            }

            .summary-card {
              border: 1px solid #cbd5e1;
              border-radius: 5px;
              padding: 12px;
              background: #f8fafc;
            }

            .summary-label {
              font-size: 10px;
              text-transform: uppercase;
              font-weight: 700;
              margin-bottom: 8px;
            }

            .summary-value {
              font-size: 20px;
              font-weight: 800;
            }

            .currency {
              font-size: 9px;
              margin-top: 4px;
            }

            .red-card {
              background: #fff1f2;
              border-color: #fecdd3;
              color: #be123c;
            }

            .green-card {
              background: #ecfdf5;
              border-color: #a7f3d0;
              color: #047857;
            }

            .blue-card {
              background: #eff6ff;
              border-color: #bfdbfe;
              color: #1d4ed8;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              table-layout: fixed;
            }

            thead {
              display: table-header-group;
            }

            th {
              padding: 10px 7px;
              background: #e2e8f0;
              border: 1px solid #cbd5e1;
              text-align: left;
              font-size: 10px;
              text-transform: uppercase;
            }

            td {
              padding: 9px 7px;
              border: 1px solid #cbd5e1;
              vertical-align: top;
              overflow-wrap: anywhere;
            }

            tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            tbody tr:nth-child(even) {
              background: #f8fafc;
            }

            .number {
              text-align: right;
              font-variant-numeric: tabular-nums;
            }

            .debit {
              color: #be123c;
              font-weight: 700;
            }

            .credit {
              color: #047857;
              font-weight: 700;
            }

            .balance {
              font-weight: 800;
            }

            .job {
              color: #1d4ed8;
              font-weight: 700;
            }

            .opening {
              background: #f1f5f9;
              font-weight: 700;
            }

            .closing {
              background: #e2e8f0 !important;
              font-weight: 800;
            }

            .empty {
              text-align: center;
              color: #64748b;
              padding: 20px;
            }

            .footer {
              margin-top: 18px;
              padding-top: 10px;
              border-top: 1px solid #cbd5e1;
              color: #64748b;
              font-size: 9px;
              line-height: 1.6;
              break-inside: avoid;
            }

            .print-controls {
              display: flex;
              justify-content: flex-end;
              gap: 10px;
              margin-bottom: 20px;
            }

            .print-controls button {
              padding: 10px 20px;
              border: 0;
              border-radius: 5px;
              background: #1d4ed8;
              color: white;
              font-weight: 700;
              cursor: pointer;
            }

            @media screen {
              body {
                padding: 25px;
                max-width: 1400px;
                margin: auto;
              }
            }

            @media print {
              .print-controls {
                display: none !important;
              }
            }

          </style>
        </head>

        <body>

          <div class="print-controls">
            <button id="print-button">Print / Save PDF</button>
            <button id="close-button">Close</button>
          </div>

          <div class="header">
            <div>
              <div class="company">CAR WORKSHOP</div>
              <div class="subtitle">
                CUSTOMER ACCOUNT STATEMENT
              </div>
            </div>

            <div class="generated">
              Generated: ${escapeHtml(generatedAt)}
              <br>
              Currency: SAR
            </div>
          </div>

          <div class="customer">

            <div>
              <p>
                <strong>Customer Name:</strong>
                ${escapeHtml(customer.customer_number)} - ${escapeHtml(customer.customer_name)}
              </p>

              <p>
                <strong>Mobile Number:</strong>
                ${escapeHtml(customer.phone || "-")}
              </p>
            </div>

            <div>
              <p>
                <strong>Statement From:</strong>
                ${escapeHtml(periodFrom)}
              </p>

              <p>
                <strong>Statement To:</strong>
                ${escapeHtml(periodTo)}
              </p>
            </div>

          </div>

          <div class="section-title">
            Overall Customer Balance - All Dates
          </div>

          <div class="summary-grid">

            <div class="summary-card red-card">
              <div class="summary-label">Total Invoiced</div>
              <div class="summary-value">
                ${amount(summary.total_debit)}
              </div>
              <div class="currency">SAR</div>
            </div>

            <div class="summary-card green-card">
              <div class="summary-label">Net Payments Received</div>
              <div class="summary-value">
                ${amount(summary.total_credit)}
              </div>
              <div class="currency">SAR</div>
            </div>

            <div class="summary-card blue-card">
              <div class="summary-label">
                Outstanding Balance
              </div>
              <div class="summary-value">
                ${amount(summary.outstanding_balance)}
              </div>
              <div class="currency">SAR</div>
            </div>

            <div class="summary-card">
              <div class="summary-label">
                Total Invoices
              </div>
              <div class="summary-value">
                ${Number(summary.total_invoices || 0)}
              </div>
            </div>

          </div>

          <div class="section-title">
            Selected Statement Period
          </div>

          <div class="summary-grid">

            <div class="summary-card">
              <div class="summary-label">
                Opening Balance
              </div>
              <div class="summary-value">
                ${amount(summary.opening_balance)}
              </div>
              <div class="currency">SAR</div>
            </div>

            <div class="summary-card red-card">
              <div class="summary-label">Period Debit</div>
              <div class="summary-value">
                ${amount(summary.period_debit)}
              </div>
              <div class="currency">SAR</div>
            </div>

            <div class="summary-card green-card">
              <div class="summary-label">Period Credit</div>
              <div class="summary-value">
                ${amount(summary.period_credit)}
              </div>
              <div class="currency">SAR</div>
            </div>

            <div class="summary-card blue-card">
              <div class="summary-label">
                Closing Balance
              </div>
              <div class="summary-value">
                ${amount(summary.closing_balance)}
              </div>
              <div class="currency">SAR</div>
            </div>

          </div>

          <div class="section-title">
            Transaction History - ${rows.length} Transactions
          </div>

          <table>

            <colgroup>
              <col style="width:10%">
              <col style="width:11%">
              <col style="width:16%">
              <col style="width:27%">
              <col style="width:12%">
              <col style="width:12%">
              <col style="width:12%">
            </colgroup>

            <thead>
              <tr>
                <th>Date</th>
                <th>Reference Number</th>
                <th>Transaction Type</th>
                <th>Description</th>
                <th class="number">Debit</th>
                <th class="number">Credit</th>
                <th class="number">Balance</th>
              </tr>
            </thead>

            <tbody>

              <tr class="opening">
                <td colspan="6">Opening Balance</td>
                <td class="number">
                  ${amount(summary.opening_balance)}
                </td>
              </tr>

              ${transactionRows}

              ${rows.length === 0
                ? `<tr>
                    <td colspan="7" class="empty">
                      No transactions in the selected period.
                    </td>
                  </tr>`
                : ""
              }

              <tr class="closing">
                <td colspan="4">
                  Period Totals / Closing Balance
                </td>

                <td class="number debit">
                  ${amount(summary.period_debit)}
                </td>

                <td class="number credit">
                  ${amount(summary.period_credit)}
                </td>

                <td class="number balance">
                  ${amount(summary.closing_balance)}
                </td>
              </tr>

            </tbody>

          </table>

          <div class="footer">
            This statement includes linked issued sales invoices and recorded payments or payment reversals. Drafts, quotations, duplicate tax invoices and provisional estimates are excluded.

            <br>

            Computer-generated statement.
            All financial amounts are expressed in SAR.
          </div>

        </body>
        </html>
      `);

      printWindow.document.close();

      printWindow.document
        .getElementById("print-button")
        .addEventListener("click", () => {
          printWindow.print();
        });

      printWindow.document
        .getElementById("close-button")
        .addEventListener("click", () => {
          printWindow.close();
        });

      printWindow.focus();

    } catch (error) {
      printWindow.close();

      console.error(
        "Customer Statement print error:",
        error
      );

      window.alert(
        "Unable to prepare the Customer Account Statement."
      );
    }
  }

  // WORKSHOP_LEDGER_EXCEL_V1
  function handleExportExcel() {
    if (
      !currentStatement ||
      !summary ||
      statementLoading ||
      customersLoading ||
      invalidDateRange
    ) {
      return;
    }

    try {
      const customer = currentStatement.customer;

      const rows = Array.isArray(
        currentStatement.transactions
      )
        ? currentStatement.transactions
        : [];

      const periodFrom = dateFrom
        ? formatDate(dateFrom)
        : "Beginning";

      const periodTo = dateTo
        ? formatDate(dateTo)
        : "Latest";

      const workbook = XLSX.utils.book_new();

      // ACCOUNT SUMMARY

      const summaryRows = [
        ["CAR WORKSHOP"],
        ["CUSTOMER ACCOUNT STATEMENT"],
        [],
        ["Customer Name", customer.customer_name],
        ["Mobile Number", String(customer.phone || "")],
        ["Customer Number", customer.customer_number],
        ["Statement From", periodFrom],
        ["Statement To", periodTo],
        ["Currency", "SAR"],
        [],
        ["OVERALL CUSTOMER BALANCE - ALL DATES"],
        ["Total Invoiced", Number(summary.total_debit)],
        ["Net Payments Received", Number(summary.total_credit)],
        [
          "Outstanding Balance",
          Number(summary.outstanding_balance)
        ],
        [
          "Total Invoices",
          Number(summary.total_invoices)
        ],
        [],
        ["SELECTED STATEMENT PERIOD"],
        ["Opening Balance", Number(summary.opening_balance)],
        ["Period Debit", Number(summary.period_debit)],
        ["Period Credit", Number(summary.period_credit)],
        ["Closing Balance", Number(summary.closing_balance)],
        ["Transaction Count", rows.length],
        [],
        [
          "Note",
          "This statement includes linked issued sales invoices and recorded payments or payment reversals. Drafts, quotations, duplicate tax invoices and provisional estimates are excluded."
        ]
      ];

      const summarySheet =
        XLSX.utils.aoa_to_sheet(summaryRows);

      summarySheet["!cols"] = [
        { wch: 38 },
        { wch: 65 }
      ];

      summarySheet["!merges"] = [
        XLSX.utils.decode_range("A1:B1"),
        XLSX.utils.decode_range("A2:B2"),
        XLSX.utils.decode_range("A11:B11"),
        XLSX.utils.decode_range("A17:B17")
      ];

      [
        "B12",
        "B13",
        "B14",
        "B18",
        "B19",
        "B20",
        "B21"
      ].forEach((address) => {
        if (summarySheet[address]) {
          summarySheet[address].z = "#,##0.00";
        }
      });

      XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Account Summary"
      );

      // TRANSACTION HISTORY

      const transactionRows = [
        ["CAR WORKSHOP"],
        ["CUSTOMER TRANSACTION HISTORY"],
        ["Customer", customer.customer_name],
        ["Mobile", String(customer.phone || "")],
        ["Period", `${periodFrom} to ${periodTo}`],
        ["Currency", "SAR"],
        [],
        [
          "Date",
          "Reference Number",
          "Transaction Type",
          "Description",
          "Debit (SAR)",
          "Credit (SAR)",
          "Balance (SAR)"
        ],
        [
          "",
          "",
          "",
          "Opening Balance",
          null,
          null,
          Number(summary.opening_balance)
        ],
        ...rows.map((row) => [
          formatDate(row.transaction_date),
          row.reference_no,
          transactionLabels[row.transaction_type]
            || row.transaction_type,
          row.description,
          Number(row.debit),
          Number(row.credit),
          Number(row.running_balance)
        ]),
        [
          "",
          "",
          "",
          "Period Totals / Closing Balance",
          Number(summary.period_debit),
          Number(summary.period_credit),
          Number(summary.closing_balance)
        ]
      ];

      const transactionSheet =
        XLSX.utils.aoa_to_sheet(transactionRows);

      transactionSheet["!cols"] = [
        { wch: 15 },
        { wch: 18 },
        { wch: 25 },
        { wch: 55 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 }
      ];

      transactionSheet["!merges"] = [
        XLSX.utils.decode_range("A1:G1"),
        XLSX.utils.decode_range("A2:G2")
      ];

      for (
        let row = 9;
        row <= transactionRows.length;
        row++
      ) {
        ["E", "F", "G"].forEach((column) => {
          const address = `${column}${row}`;

          if (transactionSheet[address]) {
            transactionSheet[address].z = "#,##0.00";
          }
        });
      }

      if (rows.length > 0) {
        transactionSheet["!autofilter"] = {
          ref: `A8:G${9 + rows.length}`
        };
      }

      XLSX.utils.book_append_sheet(
        workbook,
        transactionSheet,
        "Transactions"
      );

      const filename = `${getStatementFilename()}.xlsx`;

      XLSX.writeFile(workbook, filename);

    } catch (error) {
      console.error("Customer Statement Excel export:", error);

      window.alert(
        "Unable to export Customer Statement to Excel."
      );
    }
  }

  const transactions = Array.isArray(
    currentStatement?.transactions
  )
    ? currentStatement.transactions
    : [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="mx-auto max-w-[1600px] p-4 lg:p-8">

        {/* PAGE HEADER */}

        <div className="mb-6 flex flex-wrap items-center gap-4">

          {!embedded && (<button
            type="button"
            onClick={() => setActiveScreen?.("desktop")}
            className={buttonClass}
          >
            <ArrowLeft size={16} />
            Back to Applications
          </button>)}

          <div className="flex-1">
            <h1 className="text-3xl font-black text-slate-900">
              Customer Statement
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Customer financial balances and account statements.
            </p>
          </div>

          <button
            type="button"
            disabled={
              !currentStatement ||
              customersLoading ||
              statementLoading ||
              invalidDateRange
            }
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet size={17} />
            Export Excel
          </button>

          <button
            type="button"
            disabled={
              !currentStatement ||
              customersLoading ||
              statementLoading ||
              invalidDateRange
            }
            onClick={handlePrintStatement}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer size={17} className="text-blue-600" />
            Print Statement
          </button>

          <button
            type="button"
            disabled={customersLoading || statementLoading}
            onClick={() => {
              setStatement(null);
              setRefreshVersion((value) => value + 1);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                customersLoading || statementLoading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>

        </div>

        {/* CUSTOMER AND DATE FILTERS */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 rounded-t-2xl">
            <Users className="text-blue-600" size={22} />

            <h2 className="text-lg font-black text-slate-900">
              Customer Selection
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 xl:grid-cols-4">

            <div
              ref={dropdownRef}
              className="relative xl:col-span-2"
            >
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                Customer
              </label>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  disabled={customersLoading}
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen(
                    (previous) => !previous
                  )}
                  className={`${fieldClass} flex items-center justify-between gap-3 text-left disabled:opacity-60`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Search size={16} className="shrink-0 text-blue-600" />

                    <span className="truncate">
                      {customersLoading
                        ? "Loading customers..."
                        : selectedCustomer
                          ? `${selectedCustomer.customer_number} - ${selectedCustomer.customer_name}`
                          : "Select a customer"}
                    </span>
                  </span>

                  <ChevronDown size={18} />
                </button>

                {customerId && (
                  <button
                    type="button"
                    title="Clear customer"
                    onClick={clearCustomer}
                    className={buttonClass}
                  >
                    <X size={16} />
                  </button>
                )}

              </div>

              {dropdownOpen && (
                <div
                  className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setDropdownOpen(false);
                    }
                  }}
                >
                  <input
                    autoFocus
                    value={search}
                    onChange={(event) => setSearch(
                      event.target.value
                    )}
                    placeholder="Search customer number, name or mobile..."
                    aria-label="Search customers"
                    className={fieldClass}
                  />

                  <div className="mt-2 max-h-72 overflow-y-auto">

                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.customer_id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className={`w-full rounded-lg px-3 py-3 text-left hover:bg-blue-50 ${
                          customer.customer_id === customerId
                            ? "bg-blue-50 text-blue-700"
                            : ""
                        }`}
                      >
                        <p className="text-sm font-bold">
                          {customer.customer_number} - {customer.customer_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {customer.phone || "No mobile number"}
                        </p>
                      </button>
                    ))}

                    {filteredCustomers.length === 0 && (
                      <p className="p-4 text-center text-sm text-slate-500">
                        No customers found.
                      </p>
                    )}

                  </div>
                </div>
              )}

              {selectedCustomer && (
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Mobile: {selectedCustomer.phone || "-"}
                </p>
              )}

            </div>

            <div>
              <label
                htmlFor="ledger-date-from"
                className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500"
              >
                Date From
              </label>

              <input
                id="ledger-date-from"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(
                  event.target.value
                )}
                className={fieldClass}
              />
            </div>

            <div>
              <label
                htmlFor="ledger-date-to"
                className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500"
              >
                Date To
              </label>

              <input
                id="ledger-date-to"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(
                  event.target.value
                )}
                className={fieldClass}
              />
            </div>

          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-3">

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CalendarDays size={16} />

              {dateFrom || dateTo
                ? `${dateFrom ? formatDate(dateFrom) : "Beginning"} to ${dateTo ? formatDate(dateTo) : "Latest"}`
                : "All Dates"}
            </div>

            <button
              type="button"
              onClick={clearDates}
              className="text-sm font-bold text-blue-600 hover:underline"
            >
              Clear Date Filters
            </button>

          </div>

        </section>

        {/* ERROR AND LOADING STATES */}

        {(customerError || statementError || invalidDateRange) && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700"
          >
            {invalidDateRange
              ? "Date From cannot exceed Date To."
              : customerError || statementError}
          </div>
        )}

        {statementLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <RefreshCw className="mx-auto animate-spin text-blue-600" size={28} />

            <p className="mt-4 text-sm font-bold text-slate-500">
              Loading Customer Account Statement...
            </p>
          </div>
        )}

        {!customerId && !customersLoading && !customerError && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto text-slate-300" size={48} />

            <h2 className="mt-4 text-lg font-black text-slate-700">
              Select a Customer
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select a customer to view the financial statement.
            </p>
          </div>
        )}

        {/* CUSTOMER STATEMENT */}

        {summary && !statementLoading && !invalidDateRange && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 p-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <FileText className="text-blue-600" size={24} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Customer Account Statement
                </h2>

                <p className="mt-1 text-sm font-bold text-slate-600">
                  {currentStatement.customer.customer_number} - {currentStatement.customer.customer_name}
                </p>

                <p className="text-xs text-slate-500">
                  Mobile: {currentStatement.customer.phone || "-"}
                </p>
              </div>

            </div>

            {/* LIFETIME FINANCIAL TOTALS */}

            <div className="p-6">

              <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-500">
                Overall Customer Balance - All Dates
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                  label="Total Invoiced"
                  value={summary.total_debit}
                  tone="red"
                />

                <SummaryCard
                  label="Net Payments Received"
                  value={summary.total_credit}
                  tone="green"
                />

                <SummaryCard
                  label="Outstanding Balance"
                  value={summary.outstanding_balance}
                  tone="blue"
                />

                <SummaryCard
                  label="Total Invoices"
                  value={summary.total_invoices}
                  currency={false}
                />

              </div>

            </div>

            {/* SELECTED PERIOD TOTALS */}

            <div className="border-t border-slate-200 p-6">

              <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                <Wallet size={16} className="text-blue-600" />
                Selected Statement Period
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                  label="Opening Balance"
                  value={summary.opening_balance}
                />

                <SummaryCard
                  label="Period Debit"
                  value={summary.period_debit}
                  tone="red"
                />

                <SummaryCard
                  label="Period Credit"
                  value={summary.period_credit}
                  tone="green"
                />

                <SummaryCard
                  label="Closing Balance"
                  value={summary.closing_balance}
                  tone="blue"
                />

              </div>

            </div>

            {/* TRANSACTION HISTORY */}

            <div className="border-t border-slate-200 p-6">

              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">

                <h3 className="text-lg font-black text-slate-900">
                  Transaction History
                </h3>

                <span className="text-xs font-bold text-slate-500">
                  {transactions.length} Transactions | SAR
                </span>

              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">

                <table className="w-full min-w-[850px] text-left text-sm">

                  <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">

                    <tr>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Reference Number</th>
                      <th className="px-4 py-4">Transaction Type</th>
                      <th className="px-4 py-4">Description</th>
                      <th className="px-4 py-4 text-right">Debit</th>
                      <th className="px-4 py-4 text-right">Credit</th>
                      <th className="px-4 py-4 text-right">Balance</th>
                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-200">

                    <tr className="bg-slate-50">

                      <td
                        colSpan={6}
                        className="px-4 py-3 font-bold text-slate-600"
                      >
                        Opening Balance
                      </td>

                      <td className="px-4 py-3 text-right font-black tabular-nums">
                        {amount(summary.opening_balance)}
                      </td>

                    </tr>

                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4">
                          {formatDate(transaction.transaction_date)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-black text-blue-700">
                          {transaction.reference_no}
                        </td>

                        <td className="px-4 py-4 font-semibold">
                          {transactionLabels[transaction.transaction_type]
                            || transaction.transaction_type}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {transaction.description}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right font-bold tabular-nums text-rose-700">
                          {amount(transaction.debit)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right font-bold tabular-nums text-emerald-700">
                          {amount(transaction.credit)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right font-black tabular-nums text-slate-900">
                          {amount(transaction.running_balance)}
                        </td>

                      </tr>
                    ))}

                    {transactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-sm text-slate-500"
                        >
                          No transactions in the selected period.
                        </td>
                      </tr>
                    )}

                  </tbody>

                  <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-black">

                    <tr>
                      <td colSpan={4} className="px-4 py-4">
                        Period Totals / Closing Balance
                      </td>

                      <td className="px-4 py-4 text-right tabular-nums text-rose-700">
                        {amount(summary.period_debit)}
                      </td>

                      <td className="px-4 py-4 text-right tabular-nums text-emerald-700">
                        {amount(summary.period_credit)}
                      </td>

                      <td className="px-4 py-4 text-right tabular-nums text-blue-700">
                        {amount(summary.closing_balance)}
                      </td>
                    </tr>

                  </tfoot>

                </table>

              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                This statement includes linked issued sales invoices and recorded payments or payment reversals. Drafts, quotations, duplicate tax invoices and provisional estimates are excluded.
              </p>

            </div>

          </section>
        )}

      </main>
    </div>
  );
}
