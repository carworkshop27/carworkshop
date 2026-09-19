"use client";

import { ArrowLeft, FileText, Pencil } from "lucide-react";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";

export default function QuotationRecords({ setActiveScreen, onOpenQuotation }) {
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quotationToGenerate, setQuotationToGenerate] = useState(null);
  const [generatedInvoices, setGeneratedInvoices] = useState({});
  const [generatedTaxInvoices, setGeneratedTaxInvoices] = useState({});
  const [selectedTaxInvoice, setSelectedTaxInvoice] = useState(null);
  const handleGenerateInvoice = async () => {
    if (!quotationToGenerate) return;

    try {
      const items = Array.isArray(quotationToGenerate.items)
        ? quotationToGenerate.items.map((item, index) => ({
            serial_number: item.serial_number ?? index + 1,
            description: item.description || "",
            quantity: Number(item.quantity) || 0,
            unit_price: Number(item.unit_price) || 0,
            total: Number(item.quantity || 0) * Number(item.unit_price || 0),
          }))
        : [];

      const subtotal = items.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0,
      );

      const discount = 0;
      const taxableAmount = subtotal - discount;
      const vatRate = 15;
      const vatAmount = taxableAmount * (vatRate / 100);
      const totalAmount = taxableAmount + vatAmount;

      // =========================================================
      // REGULAR INVOICE
      // =========================================================

      let invoiceData = null;

      if (!generatedInvoices[quotationToGenerate.id]) {
        const invoiceResponse = await fetch("/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quotationId: quotationToGenerate.id,
            quotationNo: quotationToGenerate.quotation_no,
            customerName: quotationToGenerate.customer_name,
            address: quotationToGenerate.address,
            contactNumber: quotationToGenerate.contact_number,
            email: quotationToGenerate.email,
            items,
            terms: Array.isArray(quotationToGenerate.terms)
              ? quotationToGenerate.terms
              : [],
            subtotal,
            vatAmount,
            totalAmount,
          }),
        });

        invoiceData = await invoiceResponse.json();

        if (!invoiceResponse.ok) {
          throw new Error(invoiceData?.error || "Failed to generate invoice.");
        }
      }

      // =========================================================
      // TAX INVOICE
      // =========================================================

      const taxInvoiceResponse = await fetch("/api/tax-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotationId: quotationToGenerate.id,
          quotationNo: quotationToGenerate.quotation_no,

          customerName: quotationToGenerate.customer_name,
          address: quotationToGenerate.address,
          contactNumber: quotationToGenerate.contact_number,
          email: quotationToGenerate.email,

          customerVatNumber:
            quotationToGenerate.customer_vat_number ||
            quotationToGenerate.customerVatNumber ||
            null,

          customerCrNumber:
            quotationToGenerate.customer_cr_number ||
            quotationToGenerate.customerCrNumber ||
            null,

          items,

          subtotal,
          discount,
          taxableAmount,
          vatRate,
          vatAmount,
          totalAmount,
        }),
      });

      const taxInvoiceData = await taxInvoiceResponse.json();

      if (!taxInvoiceResponse.ok) {
        throw new Error(
          taxInvoiceData?.error || "Failed to generate tax invoice.",
        );
      }

      // =========================================================
      // BOTH SAVED
      // =========================================================

      setGeneratedInvoices((previous) => ({
        ...previous,
        [quotationToGenerate.id]: true,
      }));

      setGeneratedTaxInvoices((previous) => ({
        ...previous,
        [quotationToGenerate.id]: taxInvoiceData?.taxInvoice || true,
      }));

      setQuotationToGenerate(null);

      alert(
        `Invoice and tax-invoice generated successfully.\nInvoice No.: ${
          invoiceData?.invoice?.invoice_no ||
          `INV-${quotationToGenerate.quotation_no}`
        }\nTax Invoice No.: ${
          taxInvoiceData?.taxInvoice?.tax_invoice_no ||
          `TAX-${quotationToGenerate.quotation_no}`
        }`,
      );
    } catch (error) {
      console.error("Generate invoice error:", error);

      alert(error.message || "Failed to generate invoice.");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadQuotations = async () => {
      try {
        const [quotationsResponse, invoicesResponse, taxInvoicesResponse] =
          await Promise.all([
            fetch("/api/quotations"),
            fetch("/api/invoices"),
            fetch("/api/tax-invoice"),
          ]);

        const quotationsData = await quotationsResponse.json();
        const invoicesData = await invoicesResponse.json();
        const taxInvoicesData = await taxInvoicesResponse.json();

        if (!quotationsResponse.ok) {
          throw new Error(
            quotationsData?.error || "Failed to load quotation records.",
          );
        }

        if (!invoicesResponse.ok) {
          throw new Error(invoicesData?.error || "Failed to load invoices.");
        }

        if (!taxInvoicesResponse.ok) {
          throw new Error(
            taxInvoicesData?.error || "Failed to load tax invoices.",
          );
        }

        if (!cancelled) {
          const quotationList = Array.isArray(quotationsData)
            ? quotationsData
            : [];

          const invoiceList = Array.isArray(invoicesData) ? invoicesData : [];

          const taxInvoiceList = Array.isArray(taxInvoicesData)
            ? taxInvoicesData
            : [];

          const savedInvoices = {};
          const savedTaxInvoices = {};

          invoiceList.forEach((invoice) => {
            if (invoice?.quotation_id) {
              savedInvoices[invoice.quotation_id] = true;
            }
          });

          taxInvoiceList.forEach((taxInvoice) => {
            if (taxInvoice?.quotation_id) {
              savedTaxInvoices[taxInvoice.quotation_id] = taxInvoice;
            }
          });

          setQuotations(quotationList);
          setGeneratedInvoices(savedInvoices);
          setGeneratedTaxInvoices(savedTaxInvoices);
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Load quotation records error:", error);
          setIsLoading(false);
          alert(error.message || "Failed to load quotation records.");
        }
      }
    };

    loadQuotations();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-GB");
  };

  const getQuotationTotal = (quotation) => {
    if (
      quotation?.total != null ||
      quotation?.grand_total != null ||
      quotation?.quotation_total != null
    ) {
      return Number(
        quotation.total ??
          quotation.grand_total ??
          quotation.quotation_total ??
          0,
      ).toFixed(2);
    }

    const total = Array.isArray(quotation?.items)
      ? quotation.items.reduce((sum, item) => {
          if (item?.total != null) {
            return sum + Number(item.total || 0);
          }

          const quantity = Number(item?.quantity || 0);
          const unitPrice = Number(item?.unit_price || 0);

          return sum + quantity * unitPrice * 1.15;
        }, 0)
      : 0;

    return total.toFixed(2);
  };

  if (selectedTaxInvoice) {
    const items = Array.isArray(selectedTaxInvoice.items)
      ? selectedTaxInvoice.items
      : [];

    const subtotal = Number(selectedTaxInvoice.subtotal || 0);
    const discount = Number(selectedTaxInvoice.discount || 0);

    const taxableAmount = Number(
      selectedTaxInvoice.taxable_amount ??
        selectedTaxInvoice.taxableAmount ??
        subtotal - discount,
    );

    const vatRate = Number(
      selectedTaxInvoice.vat_rate ?? selectedTaxInvoice.vatRate ?? 15,
    );

    const vatAmount = Number(
      selectedTaxInvoice.vat_amount ??
        selectedTaxInvoice.vatAmount ??
        taxableAmount * (vatRate / 100),
    );

    const totalAmount = Number(
      selectedTaxInvoice.total_amount ??
        selectedTaxInvoice.totalAmount ??
        taxableAmount + vatAmount,
    );

    const taxInvoiceNumber =
      selectedTaxInvoice.tax_invoice_no ||
      `TAX-${selectedTaxInvoice.quotation_no || ""}`;

    const issueDateValue =
      selectedTaxInvoice.invoice_date ||
      selectedTaxInvoice.tax_invoice_date ||
      selectedTaxInvoice.created_at;

    const issueDate = issueDateValue
      ? new Date(issueDateValue).toLocaleDateString("en-GB")
      : "N/A";

    const issueTime = issueDateValue
      ? new Date(issueDateValue).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

    const supplyDate = issueDate;

    const formatAmount = (value) => Number(value || 0).toFixed(2);

    const numberToWords = (value) => {
      const ones = [
        "Zero",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ];

      const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
      ];

      const underThousand = (number) => {
        if (number < 20) return ones[number];

        if (number < 100) {
          return `${tens[Math.floor(number / 10)]}${
            number % 10 ? ` ${ones[number % 10]}` : ""
          }`;
        }

        return `${ones[Math.floor(number / 100)]} Hundred${
          number % 100 ? ` ${underThousand(number % 100)}` : ""
        }`;
      };

      const integerValue = Math.floor(Number(value || 0));

      if (integerValue === 0) return "Zero";

      if (integerValue < 1000) {
        return underThousand(integerValue);
      }

      if (integerValue < 1000000) {
        return `${underThousand(Math.floor(integerValue / 1000))} Thousand${
          integerValue % 1000 ? ` ${underThousand(integerValue % 1000)}` : ""
        }`;
      }

      return `${underThousand(Math.floor(integerValue / 1000000))} Million${
        integerValue % 1000000
          ? ` ${underThousand(integerValue % 1000000)}`
          : ""
      }`;
    };

    const amountInWords = `${numberToWords(totalAmount)} Saudi Riyal Only`;

    const qrData = JSON.stringify({
      invoiceNo: taxInvoiceNumber,
      workshopName: "AutoFix Pro",
      vatNumber: "VAT NUMBER",
      invoiceTotal: totalAmount.toFixed(2),
      vatTotal: vatAmount.toFixed(2),
    });

    return (
      <div className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-7xl">
          {/* TOP CONTROLS */}
          <div className="mb-4 flex items-center justify-between print:hidden">
            <button
              type="button"
              onClick={() => {
                setSelectedTaxInvoice(null);
                setActiveScreen("quotation-records");
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Quotation Records
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Print Tax Invoice
            </button>
          </div>

          <div className="tax-invoice-print bg-white text-slate-900">
            {/* =====================================================
              HEADER
          ===================================================== */}

            <div className="border border-slate-300">
              <div className="grid min-h-[105px] grid-cols-[1fr_2fr_1fr]">
                {/* LOGO */}
                <div className="flex items-center justify-center border-r border-slate-300 p-4">
                  <img
                    src="/images/garage-logo.png"
                    alt="Garage Altalaa Fahir"
                    className="h-auto w-64 object-contain"
                  />
                </div>

                {/* TITLE */}
                <div className="flex flex-col items-center justify-center px-4 text-center">
                  <div dir="rtl" className="text-xl font-bold">
                    فاتورة ضريبية مبسطة
                  </div>

                  <div className="mt-2 text-xl font-semibold">
                    Simplified Tax Invoice
                  </div>
                </div>

                {/* QR */}
                <div className="flex items-center justify-center border-l border-slate-300 p-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-2">
                      <QRCode
                        value={qrData}
                        size={120}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="M"
                      />
                    </div>

                    <div className="mt-1 text-[8px] font-semibold text-slate-500">
                      Scan for invoice details
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================================================
                SELLER INFORMATION
            =================================================== */}

              <div className="border-t border-slate-300">
                <div className="grid grid-cols-[1fr_2fr_1fr] text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    Seller Name:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    AutoFix Pro
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    اسم البائع :
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_2fr_1fr] border-t border-slate-300 text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    Address:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    Street Address,
                    <br />
                    Saudi Arabia
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    العنوان :
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_2fr_1fr] border-t border-slate-300 text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    VAT No:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    VAT NUMBER
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    الرقم الضريبي :
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_2fr_1fr] border-t border-slate-300 text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    CR Number:
                  </div>

                  <div className="border-r border-slate-300 p-2">CR NUMBER</div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    رقم السجل التجاري :
                  </div>
                </div>
              </div>

              {/* ===================================================
                TAX INVOICE INFORMATION
            =================================================== */}

              <div className="border-t border-slate-300">
                <div className="grid grid-cols-[1fr_2fr_1fr] text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    Tax Invoice No:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    {taxInvoiceNumber}
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    رقم الفاتورة الضريبية :
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_2fr_1fr] border-t border-slate-300 text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    Tax Invoice Issue Date:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    {issueDate}
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    تاريخ إصدار الفاتورة :
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_2fr_1fr] border-t border-slate-300 text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    Tax Invoice Issue Time:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    {issueTime}
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    وقت إصدار الفاتورة :
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_2fr_1fr] border-t border-slate-300 text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    Supply Date:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    {supplyDate}
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    تاريخ التوريد :
                  </div>
                </div>
              </div>

              {/* ===================================================
                CUSTOMER INFORMATION
            =================================================== */}

              <div className="border-t border-slate-300">
                <div className="grid grid-cols-[1fr_2fr_1fr] text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    Customer Name:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    {selectedTaxInvoice.customer_name || "N/A"}
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    اسم العميل :
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_2fr_1fr] border-t border-slate-300 text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    Address:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    {selectedTaxInvoice.address || "N/A"}
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    العنوان :
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_2fr_1fr] border-t border-slate-300 text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    VAT No:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    {selectedTaxInvoice.customer_vat_number || "N/A"}
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    الرقم الضريبي :
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_2fr_1fr] border-t border-slate-300 text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    Customer CR Number:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    {selectedTaxInvoice.customer_cr_number || "N/A"}
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    رقم السجل التجاري للعميل :
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_2fr_1fr] border-t border-slate-300 text-xs">
                  <div className="border-r border-slate-300 p-2 font-bold">
                    Quotation No:
                  </div>

                  <div className="border-r border-slate-300 p-2">
                    {selectedTaxInvoice.quotation_no || "N/A"}
                  </div>

                  <div dir="rtl" className="p-2 text-right font-bold">
                    رقم العرض السعري :
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
              QUOTATION ITEMS ONLY
          ===================================================== */}

            <div className="mt-4 overflow-hidden border border-slate-300">
              <table className="w-full border-collapse text-[10px]">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-2 text-center">
                      S.No
                      <br />
                      الرقم
                    </th>

                    <th className="border border-slate-300 p-2 text-center">
                      Description
                      <br />
                      وصف
                    </th>

                    <th className="border border-slate-300 p-2 text-center">
                      Qty
                      <br />
                      كمية
                    </th>

                    <th className="border border-slate-300 p-2 text-center">
                      Unit Price
                      <br />
                      سعر الوحدة
                    </th>

                    <th className="border border-slate-300 p-2 text-center">
                      Discount/Unit
                      <br />
                      خصم
                    </th>

                    <th className="border border-slate-300 p-2 text-center">
                      Taxable Amount
                      <br />
                      المبلغ الخاضع للضريبة
                    </th>

                    <th className="border border-slate-300 p-2 text-center">
                      VAT Rate
                      <br />
                      قيمة الضريبة %
                    </th>

                    <th className="border border-slate-300 p-2 text-center">
                      VAT Amount
                      <br />
                      قيمة الضريبة
                    </th>

                    <th className="border border-slate-300 p-2 text-center">
                      Total Amount
                      <br />
                      المبلغ الإجمالي
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="border border-slate-300 p-5 text-center text-slate-500"
                      >
                        No quotation items recorded.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => {
                      const quantity = Number(item.quantity || 0);

                      const unitPrice = Number(
                        item.unit_price ?? item.unitPrice ?? 0,
                      );

                      const amount = Number(item.total ?? quantity * unitPrice);

                      const itemDiscount = Number(
                        item.discount ?? item.discount_amount ?? 0,
                      );

                      const taxableItemAmount = Math.max(
                        0,
                        amount - itemDiscount,
                      );

                      const rowVat = taxableItemAmount * (vatRate / 100);

                      const rowTotal = taxableItemAmount + rowVat;

                      return (
                        <tr key={index}>
                          <td className="border border-slate-300 p-2 text-center">
                            {item.serial_number ?? index + 1}
                          </td>

                          <td className="border border-slate-300 p-2">
                            {item.description || "-"}
                          </td>

                          <td className="border border-slate-300 p-2 text-center">
                            {quantity}
                          </td>

                          <td className="border border-slate-300 p-2 text-right">
                            {formatAmount(unitPrice)}
                          </td>

                          <td className="border border-slate-300 p-2 text-right">
                            {formatAmount(itemDiscount)}
                          </td>

                          <td className="border border-slate-300 p-2 text-right">
                            {formatAmount(taxableItemAmount)}
                          </td>

                          <td className="border border-slate-300 p-2 text-center">
                            {vatRate.toFixed(2)}
                          </td>

                          <td className="border border-slate-300 p-2 text-right">
                            {formatAmount(rowVat)}
                          </td>

                          <td className="border border-slate-300 p-2 text-right">
                            {formatAmount(rowTotal)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* =====================================================
              TOTALS
          ===================================================== */}

            <div className="mt-3 flex justify-end">
              <table className="w-[52%] border-collapse text-xs">
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold">
                      Total amount before discount
                    </td>

                    <td
                      dir="rtl"
                      className="border border-slate-300 p-2 text-right font-semibold"
                    >
                      المبلغ الإجمالي قبل الخصم
                    </td>

                    <td className="border border-slate-300 p-2 text-right">
                      {formatAmount(subtotal)}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold">
                      Discount amount
                    </td>

                    <td
                      dir="rtl"
                      className="border border-slate-300 p-2 text-right font-semibold"
                    >
                      مقدار الخصم
                    </td>

                    <td className="border border-slate-300 p-2 text-right">
                      {formatAmount(discount)}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold">
                      Total Taxable Amount
                    </td>

                    <td
                      dir="rtl"
                      className="border border-slate-300 p-2 text-right font-semibold"
                    >
                      إجمالي المبلغ الخاضع للضريبة
                    </td>

                    <td className="border border-slate-300 p-2 text-right">
                      {formatAmount(taxableAmount)}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold">
                      Total VAT
                    </td>

                    <td
                      dir="rtl"
                      className="border border-slate-300 p-2 text-right font-semibold"
                    >
                      إجمالي ضريبة القيمة المضافة
                    </td>

                    <td className="border border-slate-300 p-2 text-right">
                      {formatAmount(vatAmount)}
                    </td>
                  </tr>

                  <tr className="font-black">
                    <td className="border border-slate-300 p-2">
                      Total Amount with VAT
                    </td>

                    <td
                      dir="rtl"
                      className="border border-slate-300 p-2 text-right"
                    >
                      المبلغ الإجمالي مع ضريبة القيمة المضافة
                    </td>

                    <td className="border border-slate-300 p-2 text-right">
                      {formatAmount(totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CURRENCY */}

            <div className="mt-3 flex justify-between text-xs">
              <div>
                <span className="font-bold">Currency:</span> Saudi Riyal
              </div>

              <div dir="rtl" className="font-bold">
                العملة: الريال السعودي
              </div>
            </div>

            {/* AMOUNT IN WORDS */}

            <div className="mt-2 flex justify-between text-xs">
              <div>
                <span className="font-bold">Amount in Words:</span>{" "}
                {amountInWords}
              </div>

              <div dir="rtl" className="font-bold">
                المبلغ كتابة: {amountInWords}
              </div>
            </div>

            {/* PRINT */}

            <div className="mt-5 flex justify-end print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-bold text-white transition hover:bg-blue-700"
              >
                Print Tax Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-800">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveScreen("dashboard")}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>

          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Quotation Records
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and edit saved quotations.
            </p>
          </div>
        </div>

        {/* RECORDS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-10 text-center text-sm font-semibold text-slate-500">
              Loading quotation records...
            </div>
          ) : quotations.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="text-sm font-bold text-slate-500">
                No quotation records found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-left text-xs font-black uppercase tracking-wide text-white">
                    <th className="px-5 py-4">Quotation Number</th>

                    <th className="px-5 py-4">Customer Info</th>

                    <th className="px-5 py-4">Quotation Date</th>

                    <th className="px-5 py-4 text-right">Quotation Total</th>

                    <th className="px-5 py-4 text-center">Open</th>

                    <th className="px-5 py-4 text-center">Invoice</th>
                  </tr>
                </thead>

                <tbody>
                  {quotations.map((quotation) => (
                    <tr
                      key={quotation.id}
                      className="border-t border-slate-200 transition hover:bg-slate-50"
                    >
                      {/* QUOTATION NUMBER */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-black text-slate-900">
                          {quotation.quotation_no || "-"}
                        </div>
                      </td>

                      {/* CUSTOMER INFO */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-bold text-slate-900">
                          {quotation.customer_name || "-"}
                        </div>

                        {quotation.address && (
                          <div className="mt-1 text-xs text-slate-500">
                            {quotation.address}
                          </div>
                        )}

                        {quotation.contact_number && (
                          <div className="mt-1 text-xs text-slate-500">
                            {quotation.contact_number}
                          </div>
                        )}

                        {quotation.email && (
                          <div className="mt-1 text-xs text-slate-500">
                            {quotation.email}
                          </div>
                        )}
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700">
                        {formatDate(
                          quotation.quotation_date || quotation.created_at,
                        )}
                      </td>

                      {/* TOTAL */}
                      <td className="px-5 py-4 text-right align-top text-sm font-black text-slate-900">
                        ⃁ {getQuotationTotal(quotation)}
                      </td>

                      {/* OPEN */}
                      <td className="px-5 py-4 text-center align-top">
                        <button
                          type="button"
                          onClick={() => onOpenQuotation(quotation)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-blue-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Open
                        </button>
                      </td>

                      {/* GENERATE INVOICE */}
                      <td className="px-5 py-4 text-center align-top">
                        <div className="flex flex-col items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQuotationToGenerate(quotation)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-amber-600"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Generate Invoice
                          </button>

                          <div className="flex w-full gap-2">
                            {generatedInvoices[quotation.id] ? (
                              <button
                                type="button"
                                onClick={() => onOpenQuotation(quotation, true)}
                                className="flex-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-center text-[11px] font-black text-white transition hover:bg-emerald-600"
                              >
                                Invoice Saved
                              </button>
                            ) : (
                              <div className="flex-1 rounded-lg bg-slate-300 px-3 py-1.5 text-center text-[11px] font-black text-slate-600">
                                Invoice Not Saved
                              </div>
                            )}

                            {generatedTaxInvoices[quotation.id] ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedTaxInvoice(
                                    generatedTaxInvoices[quotation.id],
                                  )
                                }
                                className="flex-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-center text-[11px] font-black text-white transition hover:bg-emerald-600"
                              >
                                Tax-invoice Saved
                              </button>
                            ) : (
                              <div className="flex-1 rounded-lg bg-slate-300 px-3 py-1.5 text-center text-[11px] font-black text-slate-600">
                                Tax-invoice Not Saved
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {quotationToGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-black text-slate-900">
              Generate Invoice
            </h2>

            <p className="mt-3 text-sm font-medium text-slate-600">
              Do you want to generate the invoice and tax-invoice of quotation{" "}
              <span className="font-black text-slate-900">
                {quotationToGenerate.quotation_no || "-"}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setQuotationToGenerate(null)}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                No
              </button>

              <button
                type="button"
                onClick={handleGenerateInvoice}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
