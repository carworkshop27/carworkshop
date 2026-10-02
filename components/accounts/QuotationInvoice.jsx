"use client";

import { ArrowLeft, Printer } from "lucide-react";
import QRCode from "react-qr-code";

export default function QuotationInvoice({
  quotation,
  setActiveScreen,
  backScreen = "quotation-records",
  backLabel = "Back to Quotation Records",
}) {
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

  const items = Array.isArray(quotation.items)
    ? quotation.items.map((item, index) => ({
        serial_number: item.serial_number ?? item.serialNumber ?? index + 1,
        description: item.description || "",
        quantity: Number(item.quantity || 0),
        unit_price: Number(item.unit_price ?? item.unitPrice ?? 0),
      }))
    : [];

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0,
  );

  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const terms = Array.isArray(quotation.terms)
    ? quotation.terms
        .map((term) =>
          typeof term === "string"
            ? term
            : term?.term_text || term?.termText || "",
        )
        .filter(Boolean)
    : [];

  const quotationDate = quotation.quotation_date || quotation.created_at;

  const formattedDate = quotationDate
    ? new Date(quotationDate).toLocaleDateString("en-GB")
    : "-";

  const qrData = JSON.stringify({
    invoice: `INV-${quotation.quotation_no || "-"}`,
    quotation: quotation.quotation_no || "-",
    date: formattedDate,
    customer: quotation.customer_name || "-",
    address: quotation.address || "-",
    phone: quotation.contact_number || "-",
    email: quotation.email || "-",
    items: items.map((item) => ({
      description: item.description || "-",
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.unit_price || 0),
      amount: (
        Number(item.quantity || 0) * Number(item.unit_price || 0)
      ).toFixed(2),
    })),
    subtotal: subtotal.toFixed(2),
    vat: vat.toFixed(2),
    total: total.toFixed(2),
  });

  const handlePrint = () => {
    window.print();
  };

  const ITEMS_PER_PRINT_PAGE = 7;

  const invoicePrintPages = Array.from(
    {
      length: Math.max(1, Math.ceil(items.length / ITEMS_PER_PRINT_PAGE)),
    },
    (_, pageIndex) =>
      items.slice(
        pageIndex * ITEMS_PER_PRINT_PAGE,
        (pageIndex + 1) * ITEMS_PER_PRINT_PAGE,
      ),
  );

  return (
    <div className="quotation-invoice-screen min-h-screen bg-slate-100 p-6 text-slate-800">
      <style>{`
        .invoice-print {
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

          .quotation-invoice-screen > * {
            display: none !important;
          }

          .invoice-print,
          .invoice-print * {
            visibility: visible !important;
          }

          .quotation-invoice-screen > .invoice-print {
            display: block !important;
          }

          .quotation-invoice-screen {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .invoice-print {
            display: block !important;
            position: static;
            width: 210mm;
            margin: 0;
            padding: 0;
            background: white;
            color: #142f31;
            font-family: Arial, Helvetica, sans-serif;
          }

          .invoice-print-page {
            width: 210mm;
            height: 296mm;
            margin: 0;
            padding: 3mm;
            position: relative;
            background: white;
            box-sizing: border-box;
            overflow: hidden;
            break-after: page;
            page-break-after: always;
          }

          .invoice-print-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .invoice-print-header {
            display: flex;
            width: 100%;
            height: 44mm;
            background: #eefaf9;
            box-sizing: border-box;
          }

          .invoice-print-left-bar {
            width: 8mm;
            background: #10a99d;
            flex-shrink: 0;
          }

          .invoice-print-header-content {
            flex: 1;
            padding: 3mm 6mm 3mm 7mm;
            box-sizing: border-box;
          }

          .invoice-print-title-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
          }

          .invoice-print-logo {
            display: block;
            width: auto;
            height: 22mm;
            object-fit: contain;
            mix-blend-mode: multiply;
          }

                    .invoice-print-qr {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 1mm;
          }

          .invoice-print-qr svg {
            width: 24mm;
            height: 24mm;
            display: block;
          }

          .invoice-print-heading-meta {
            width: 55mm;
          }

          .invoice-print-heading-meta h1 {
            margin: 0 0 4mm 0;
            color: #075b5b;
            font-size: 20pt;
            line-height: 1;
            font-weight: 900;
            text-align: left;
            letter-spacing: 0.2px;
          }

          .invoice-print-meta {
            display: flex;
            flex-direction: column;
            gap: 1.2mm;
            font-size: 9pt;
            transform: translateX(-6mm);
          }

          .invoice-print-meta > div {
            display: grid;
            grid-template-columns: 27mm 3mm 1fr;
            gap: 0;
          }

          .invoice-print-meta > div::after {
            content: ":";
            grid-column: 2;
            grid-row: 1;
            text-align: center;
            font-weight: 800;
          }

          .invoice-print-meta strong {
            text-align: left;
            font-weight: 800;
            color: #142f31;
          }

          .invoice-print-meta span {
            grid-column: 3;
            white-space: nowrap;
            text-align: left;
          }

          .invoice-print-company {
            margin-top: -4.5mm;
            font-size: 9pt;
            line-height: 1.42;
          }

          .invoice-print-company strong {
            display: block;
            margin-bottom: 0.6mm;
            font-size: 9pt;
            font-weight: 800;
            color: #142f31;
          }

          .invoice-print-company p {
            margin: 0;
          }

          .invoice-print-info-row {
            display: grid;
            grid-template-columns: 57% 21.5% 21.5%;
            width: 100%;
            margin-top: 3mm;
            min-height: 25mm;
            box-sizing: border-box;
          }

          .invoice-print-customer-box,
          .invoice-print-small-box {
            border: 0.3mm solid #67c9c3;
            box-sizing: border-box;
            font-size: 9pt;
          }

          .invoice-print-customer-box {
            padding: 2.5mm 3mm;
          }

          .invoice-print-customer-box strong {
            display: block;
            margin-bottom: 1.5mm;
            font-size: 9pt;
            font-weight: 800;
          }

          .invoice-print-customer-box p {
            margin: 0;
            line-height: 1.45;
          }

          .invoice-print-small-box {
            border-left: none;
            display: flex;
            flex-direction: column;
          }

          .invoice-print-small-box strong {
            display: block;
            min-height: 8mm;
            padding: 2.5mm 3mm;
            background: #eefaf9;
            border-bottom: 0.3mm solid #67c9c3;
            box-sizing: border-box;
            font-size: 8pt;
            font-weight: 800;
          }

          .invoice-print-small-box span {
            display: block;
            padding: 3mm;
            font-size: 8pt;
          }

          .invoice-print-items {
            width: 100%;
            margin-top: 3mm;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 8pt;
          }

          .invoice-print-items th {
            height: 8mm;
            padding: 1.5mm 2mm;
            border: 0.3mm solid #4fb6b0;
            background: #087d78;
            color: white;
            font-weight: 800;
            vertical-align: middle;
          }

          .invoice-print-items td {
            height: 8mm;
            padding: 1.5mm 2mm;
            border: 0.3mm solid #9ed7d3;
            box-sizing: border-box;
            vertical-align: middle;
          }

          .invoice-print-items th:nth-child(1) { width: 11%; text-align: center; }
          .invoice-print-items th:nth-child(2) { width: 14%; text-align: center; }
          .invoice-print-items th:nth-child(3) { width: 42%; text-align: center; }
          .invoice-print-items th:nth-child(4) { width: 16.5%; text-align: center; }
          .invoice-print-items th:nth-child(5) { width: 16.5%; text-align: center; }

          .invoice-print-items td:nth-child(1),
          .invoice-print-items td:nth-child(2) {
            text-align: center;
          }

          .invoice-print-items td:nth-child(4),
          .invoice-print-items td:nth-child(5) {
            text-align: right;
          }

          .invoice-print-bottom {
            display: grid;
            grid-template-columns: 53% 47%;
            width: 100%;
            margin-top: 3mm;
            min-height: 39mm;
            box-sizing: border-box;
          }

          .invoice-print-terms {
            border: 0.3mm solid #67c9c3;
            min-height: 39mm;
            box-sizing: border-box;
          }

          .invoice-print-terms-title {
            padding: 2.5mm 3mm;
            background: #eefaf9;
            font-size: 9pt;
            font-weight: 900;
            color: #142f31;
          }

          .invoice-print-terms-body {
            padding: 2.5mm 3mm;
          }

          .invoice-print-term-row {
            display: grid;
            grid-template-columns: 7mm 1fr;
            min-height: 5mm;
            font-size: 7.5pt;
            line-height: 1.4;
          }

          .invoice-print-term-number {
            font-weight: 600;
          }

          .invoice-print-term-text {
            min-width: 0;
          }

          .invoice-print-totals {
            border-top: 0.3mm solid #67c9c3;
            box-sizing: border-box;
          }

          .invoice-print-totals > div {
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 7.2mm;
            border-right: 0.3mm solid #67c9c3;
            border-bottom: 0.3mm solid #67c9c3;
            font-size: 9pt;
            box-sizing: border-box;
          }

          .invoice-print-totals strong,
          .invoice-print-totals span {
            padding: 2mm 3mm;
          }

          .invoice-print-totals strong {
            font-weight: 800;
          }

          .invoice-print-totals span {
            text-align: right;
          }

          .invoice-print-total {
            background: #83e1da;
            font-size: 11pt !important;
            font-weight: 900;
          }

          .invoice-print-footer {
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

          .invoice-print-thankyou {
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

          .invoice-print-thankyou span {
            display: inline-block;
            transform: skewX(-24deg);
            font-family: cursive;
            font-size: 19pt;
            font-style: italic;
            line-height: 1;
            white-space: nowrap;
          }

          .invoice-print-page-number {
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

      <div className="quotation-invoice-actions mx-auto mb-5 flex max-w-5xl items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveScreen(backScreen)}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700"
        >
          <Printer className="h-4 w-4" />
          Print Invoice
        </button>
      </div>

      {/* SCREEN PREVIEW */}
      <main className="mx-auto max-w-5xl">
        <div className="relative flex min-h-[1123px] flex-col overflow-hidden bg-white shadow-lg">
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

                <div className="flex flex-1 items-start justify-center pt-2">
                  <QRCode
                    value={qrData}
                    size={102}
                    bgColor="#eefaf9"
                    fgColor="#075b5b"
                    level="M"
                  />
                </div>

                <div className="ml-auto w-[300px]">
                  <h1 className="mb-3 text-left text-3xl font-black tracking-tight text-teal-800">
                    INVOICE
                  </h1>

                  <div className="w-[261px] space-y-2 text-sm text-slate-700">
                    <div className="grid grid-cols-[105px_10px_130px] gap-2">
                      <strong className="text-left">Date</strong>
                      <span className="text-center">:</span>
                      <span className="text-left">{formattedDate}</span>
                    </div>

                    <div className="grid grid-cols-[105px_10px_130px] gap-2">
                      <strong className="text-left">Invoice #</strong>
                      <span className="text-center">:</span>
                      <span className="text-left">
                        INV-{quotation.quotation_no || "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[105px_10px_130px] gap-2">
                      <strong className="text-left">Customer ID</strong>
                      <span className="text-center">:</span>
                      <span className="text-left">
                        {quotation.quotation_no || "-"}
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
              <strong className="mb-2 block font-black">Invoice for:</strong>
              <p>{quotation.customer_name || quotation.customerName || "-"}</p>
              <p>{quotation.address || "-"}</p>
              <p>
                {quotation.contact_number || quotation.contactNumber || "-"}
              </p>
              <p>{quotation.email || "-"}</p>
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
                {items.slice(0, ITEMS_PER_PRINT_PAGE).map((item, index) => {
                  const quantity = Number(item.quantity || 0);
                  const unitPrice = Number(item.unit_price || 0);
                  const amount = quantity * unitPrice;

                  return (
                    <tr key={index}>
                      <td className="h-9 border border-teal-200 px-3 text-center">
                        {item.serial_number ?? index + 1}
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
                    ITEMS_PER_PRINT_PAGE -
                      Math.min(items.length, ITEMS_PER_PRINT_PAGE),
                  ),
                }).map((_, emptyIndex) => (
                  <tr key={`preview-empty-${emptyIndex}`}>
                    <td className="h-9 border border-teal-200">&nbsp;</td>
                    <td className="h-9 border border-teal-200">&nbsp;</td>
                    <td className="h-9 border border-teal-200">&nbsp;</td>
                    <td className="h-9 border border-teal-200">&nbsp;</td>
                    <td className="h-9 border border-teal-200">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TERMS + TOTALS */}
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

                {terms.slice(0, 4).map((term, termIndex) => (
                  <div
                    key={termIndex}
                    className="mt-1 grid grid-cols-[25px_1fr] gap-2"
                  >
                    <span className="font-semibold">{termIndex + 2}.</span>
                    <span>{term || " "}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-teal-300">
              <div className="grid grid-cols-2 border-b border-r border-teal-300 text-sm">
                <strong className="px-4 py-3">Subtotal</strong>
                <span className="px-4 py-3 text-right">
                  {subtotal.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 border-b border-r border-teal-300 text-sm">
                <strong className="px-4 py-3">Tax Rate</strong>
                <span className="px-4 py-3 text-right">15.00%</span>
              </div>

              <div className="grid grid-cols-2 border-b border-r border-teal-300 text-sm">
                <strong className="px-4 py-3">VAT 15%</strong>
                <span className="px-4 py-3 text-right">{vat.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 border-b border-r border-teal-300 text-sm">
                <strong className="px-4 py-3">Other</strong>
                <span className="px-4 py-3 text-right">-</span>
              </div>

              <div className="grid grid-cols-2 border-b border-r border-teal-300 bg-teal-200 text-lg">
                <strong className="px-4 py-3">Total</strong>
                <span className="px-4 py-3 text-right font-black">
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

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
              Page 1 of {invoicePrintPages.length}
            </div>
          </div>
        </div>
      </main>

      {/* PRINT-ONLY INVOICE */}
      <div className="invoice-print">
        {invoicePrintPages.map((pageItems, pageIndex) => {
          const isLastPage = pageIndex === invoicePrintPages.length - 1;

          return (
            <div
              className="invoice-print-page"
              key={`invoice-print-page-${pageIndex}`}
            >
              <div className="invoice-print-header">
                <div className="invoice-print-left-bar"></div>

                <div className="invoice-print-header-content">
                  <div className="invoice-print-title-row">
                    <img
                      src="/images/quotation-logo.png"
                      alt="Garage AlTalaa AlFahir"
                      className="invoice-print-logo"
                    />

                    <div className="invoice-print-qr">
                      <QRCode
                        value={qrData}
                        size={91}
                        bgColor="#eefaf9"
                        fgColor="#075b5b"
                        level="M"
                      />
                    </div>

                    <div className="invoice-print-heading-meta">
                      <h1>INVOICE</h1>

                      <div className="invoice-print-meta">
                        <div>
                          <strong>Date</strong>
                          <span>{formattedDate}</span>
                        </div>

                        <div>
                          <strong>Invoice #</strong>
                          <span>INV-{quotation.quotation_no || "-"}</span>
                        </div>

                        <div>
                          <strong>Customer ID</strong>
                          <span>{quotation.quotation_no || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="invoice-print-company">
                    <strong>Garage AlTalaa AlFahir</strong>
                    <p>Jeddah-Smart City Asfan shop No.2162 A.B</p>
                    <p>Phone: +966 50 662 0654</p>
                    <p>Email: talaa.alfakhir@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="invoice-print-info-row">
                <div className="invoice-print-customer-box">
                  <strong>Invoice for:</strong>
                  <p>
                    {quotation.customer_name || quotation.customerName || "-"}
                  </p>
                  <p>{quotation.address || "-"}</p>
                  <p>
                    {quotation.contact_number || quotation.contactNumber || "-"}
                  </p>
                  <p>{quotation.email || "-"}</p>
                </div>

                <div className="invoice-print-small-box">
                  <strong>Salesperson</strong>
                  <span>Admin</span>
                </div>

                <div className="invoice-print-small-box">
                  <strong>Terms</strong>
                  <span>&nbsp;</span>
                </div>
              </div>

              <table className="invoice-print-items">
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
                    const quantity = Number(item.quantity || 0);
                    const unitPrice = Number(item.unit_price || 0);
                    const amount = quantity * unitPrice;

                    return (
                      <tr key={`${pageIndex}-${itemIndex}`}>
                        <td>{item.serial_number ?? itemIndex + 1}</td>
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

              {isLastPage && (
                <div className="invoice-print-bottom">
                  <div className="invoice-print-terms">
                    <div className="invoice-print-terms-title">
                      Terms & Conditions
                    </div>

                    <div className="invoice-print-terms-body">
                      <div className="invoice-print-term-row">
                        <span className="invoice-print-term-number">1.</span>

                        <div className="invoice-print-term-text">
                          <div>Bank Information - IBAN - Talaa Fakhir</div>
                          <div>مؤسسة محمد عبدالله الملا</div>
                          <div>IBAN: SA51 8000 0451 6080 1631 0298</div>
                        </div>
                      </div>

                      {terms.slice(0, 4).map((term, termIndex) => (
                        <div key={termIndex} className="invoice-print-term-row">
                          <span className="invoice-print-term-number">
                            {termIndex + 2}.
                          </span>

                          <span className="invoice-print-term-text">
                            {term || " "}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="invoice-print-totals">
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

                    <div className="invoice-print-total">
                      <strong>Total</strong>
                      <span>{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="invoice-print-footer">
                <div className="invoice-print-thankyou">
                  <span>Thank you!</span>
                </div>

                <div className="invoice-print-page-number">
                  Page {pageIndex + 1} of {invoicePrintPages.length}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
