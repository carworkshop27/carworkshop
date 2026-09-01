"use client";

import React from "react";

export default function TaxInvoice({ job, getDamageInfo, onPrint }) {
  if (!job) return null;

  const jobPanels = job.panels || [];
  const damagedPanels = jobPanels.filter((p) => p.status !== "ok");
  const jobParts = job.parts || [];
  const electricalItems = job.electricalItems || [];
  const mechanicalItems = job.mechanicalItems || [];

  const repairCost = damagedPanels.reduce(
    (sum, panel) =>
      sum +
      (panel.customRepairCost !== undefined && panel.customRepairCost !== ""
        ? Number(panel.customRepairCost)
        : Number(getDamageInfo(panel.status).cost || 0)),
    0,
  );

  const partsCost = jobParts.reduce(
    (sum, part) => sum + Number(part.price || 0),
    0,
  );

  const electricalCost = electricalItems.reduce(
    (sum, item) => sum + Number(item.cost || 0),
    0,
  );

  const mechanicalCost = mechanicalItems.reduce(
    (sum, item) => sum + Number(item.cost || 0),
    0,
  );

  const subtotal = repairCost + partsCost + electricalCost + mechanicalCost;

  const discount = 0;
  const taxableAmount = subtotal - discount;

  const vatRate = 15;
  const vatAmount = taxableAmount * (vatRate / 100);

  const totalAmount = taxableAmount + vatAmount;

  const invoiceNumber = `INV-${job.id.replace("JOB-", "")}`;

  const issueDate = job.intakeDate || job.date || "N/A";
  const issueTime = job.intakeTime || "N/A";
  const supplyDate = job.intakeDate || job.date || "N/A";

  const formatAmount = (value) => Number(value || 0).toFixed(2);

  return (
    <div className="tax-invoice-print bg-white text-slate-900">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="border border-slate-300">
        <div className="grid grid-cols-[1fr_2fr_1fr] min-h-[105px]">
          {/* LOGO AREA */}
          <div className="border-r border-slate-300 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-2xl font-black tracking-wide">
                Garage Altalaa Fahir
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div className="flex flex-col items-center justify-center text-center px-4">
            <div dir="rtl" className="text-xl font-bold">
              فاتورة ضريبية مبسطة
            </div>

            <div className="text-xl font-semibold mt-2">
              Simplified Tax Invoice
            </div>
          </div>

          {/* QR PLACEHOLDER */}
          <div className="border-l border-slate-300 flex items-center justify-center p-4">
            <div className="w-20 h-20 border-2 border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 text-center">
              QR CODE
              <br />
              LATER
            </div>
          </div>
        </div>

        {/* =======================================================
            SELLER INFORMATION
        ======================================================= */}

        <div className="border-t border-slate-300">
          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs">
            <div className="font-bold p-2 border-r border-slate-300">
              Seller Name:
            </div>

            <div className="p-2 border-r border-slate-300">AutoFix Pro</div>

            <div dir="rtl" className="font-bold p-2 text-right">
              اسم البائع :
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs border-t border-slate-300">
            <div className="font-bold p-2 border-r border-slate-300">
              Address:
            </div>

            <div className="p-2 border-r border-slate-300">
              Street Address,
              <br />
              Saudi Arabia
            </div>

            <div dir="rtl" className="font-bold p-2 text-right">
              العنوان :
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs border-t border-slate-300">
            <div className="font-bold p-2 border-r border-slate-300">
              VAT No:
            </div>

            <div className="p-2 border-r border-slate-300">VAT NUMBER</div>

            <div dir="rtl" className="font-bold p-2 text-right">
              الرقم الضريبي :
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs border-t border-slate-300">
            <div className="font-bold p-2 border-r border-slate-300">
              CR Number:
            </div>

            <div className="p-2 border-r border-slate-300">CR NUMBER</div>

            <div dir="rtl" className="font-bold p-2 text-right">
              رقم السجل التجاري :
            </div>
          </div>
        </div>

        {/* =======================================================
            INVOICE INFORMATION
        ======================================================= */}

        <div className="border-t border-slate-300">
          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs">
            <div className="font-bold p-2 border-r border-slate-300">
              Invoice No:
            </div>

            <div className="p-2 border-r border-slate-300">{invoiceNumber}</div>

            <div dir="rtl" className="font-bold p-2 text-right">
              رقم الفاتورة :
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs border-t border-slate-300">
            <div className="font-bold p-2 border-r border-slate-300">
              Invoice Issue Date:
            </div>

            <div className="p-2 border-r border-slate-300">{issueDate}</div>

            <div dir="rtl" className="font-bold p-2 text-right">
              تاريخ إصدار الفاتورة :
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs border-t border-slate-300">
            <div className="font-bold p-2 border-r border-slate-300">
              Invoice Issue Time:
            </div>

            <div className="p-2 border-r border-slate-300">{issueTime}</div>

            <div dir="rtl" className="font-bold p-2 text-right">
              وقت إصدار الفاتورة :
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs border-t border-slate-300">
            <div className="font-bold p-2 border-r border-slate-300">
              Supply Date:
            </div>

            <div className="p-2 border-r border-slate-300">{supplyDate}</div>

            <div dir="rtl" className="font-bold p-2 text-right">
              تاريخ التوريد :
            </div>
          </div>
        </div>

        {/* =======================================================
            CUSTOMER INFORMATION
        ======================================================= */}

        <div className="border-t border-slate-300">
          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs">
            <div className="font-bold p-2 border-r border-slate-300">
              Customer Name:
            </div>

            <div className="p-2 border-r border-slate-300">
              {job.owner || "N/A"}
            </div>

            <div dir="rtl" className="font-bold p-2 text-right">
              اسم العميل :
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs border-t border-slate-300">
            <div className="font-bold p-2 border-r border-slate-300">
              Address:
            </div>

            <div className="p-2 border-r border-slate-300">
              {job.address || "N/A"}
            </div>

            <div dir="rtl" className="font-bold p-2 text-right">
              العنوان :
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs border-t border-slate-300">
            <div className="font-bold p-2 border-r border-slate-300">
              VAT No:
            </div>

            <div className="p-2 border-r border-slate-300">
              {job.customerVatNumber || "N/A"}
            </div>

            <div dir="rtl" className="font-bold p-2 text-right">
              الرقم الضريبي :
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr_1fr] text-xs border-t border-slate-300">
            <div className="font-bold p-2 border-r border-slate-300">
              Customer CR Number:
            </div>

            <div className="p-2 border-r border-slate-300">
              {job.customerCrNumber || "N/A"}
            </div>

            <div dir="rtl" className="font-bold p-2 text-right">
              رقم السجل التجاري للعميل :
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ITEMS
      ========================================================= */}

      <div className="mt-4 border border-slate-300 overflow-hidden">
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
            {damagedPanels.map((panel, index) => {
              const info = getDamageInfo(panel.status);

              const amount =
                panel.customRepairCost !== undefined &&
                panel.customRepairCost !== ""
                  ? Number(panel.customRepairCost)
                  : Number(info.cost || 0);

              const rowVat = amount * 0.15;
              const rowTotal = amount + rowVat;

              return (
                <tr key={`panel-${panel.id}`}>
                  <td className="border border-slate-300 p-2 text-center">
                    {index + 1}
                  </td>

                  <td className="border border-slate-300 p-2">
                    <div className="font-semibold">{panel.name}</div>

                    <div className="text-slate-500">{info.label}</div>
                  </td>

                  <td className="border border-slate-300 p-2 text-center">1</td>

                  <td className="border border-slate-300 p-2 text-right">
                    {formatAmount(amount)}
                  </td>

                  <td className="border border-slate-300 p-2 text-right">
                    0.00
                  </td>

                  <td className="border border-slate-300 p-2 text-right">
                    {formatAmount(amount)}
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
            })}

            {jobParts.map((part, index) => {
              const qty = Number(part.qty || 1);
              const unitPrice = Number(part.price || 0);
              const amount = qty * unitPrice;
              const rowVat = amount * 0.15;
              const rowTotal = amount + rowVat;

              return (
                <tr key={`part-${index}`}>
                  <td className="border border-slate-300 p-2 text-center">
                    {damagedPanels.length + index + 1}
                  </td>

                  <td className="border border-slate-300 p-2">
                    <div className="font-semibold">
                      {part.name || "Spare Part"}
                    </div>
                  </td>

                  <td className="border border-slate-300 p-2 text-center">
                    {qty}
                  </td>

                  <td className="border border-slate-300 p-2 text-right">
                    {formatAmount(unitPrice)}
                  </td>

                  <td className="border border-slate-300 p-2 text-right">
                    0.00
                  </td>

                  <td className="border border-slate-300 p-2 text-right">
                    {formatAmount(amount)}
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
            })}

            {electricalItems.map((item, index) => {
              const amount = Number(item.cost || 0);
              const rowVat = amount * 0.15;
              const rowTotal = amount + rowVat;

              return (
                <tr key={`electrical-${index}`}>
                  <td className="border border-slate-300 p-2 text-center">
                    {damagedPanels.length + jobParts.length + index + 1}
                  </td>

                  <td className="border border-slate-300 p-2">
                    <div className="font-semibold">
                      {item.partName || "Electrical Work"}
                    </div>

                    <div className="text-slate-500">
                      {item.description || "Electrical Work"}
                    </div>
                  </td>

                  <td className="border border-slate-300 p-2 text-center">1</td>

                  <td className="border border-slate-300 p-2 text-right">
                    {formatAmount(amount)}
                  </td>

                  <td className="border border-slate-300 p-2 text-right">
                    0.00
                  </td>

                  <td className="border border-slate-300 p-2 text-right">
                    {formatAmount(amount)}
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
            })}

            {mechanicalItems.map((item, index) => {
              const amount = Number(item.cost || 0);
              const rowVat = amount * 0.15;
              const rowTotal = amount + rowVat;

              return (
                <tr key={`mechanical-${index}`}>
                  <td className="border border-slate-300 p-2 text-center">
                    {damagedPanels.length +
                      jobParts.length +
                      electricalItems.length +
                      index +
                      1}
                  </td>

                  <td className="border border-slate-300 p-2">
                    <div className="font-semibold">
                      {item.partName || "Mechanical Work"}
                    </div>

                    <div className="text-slate-500">
                      {item.description || "Mechanical Work"}
                    </div>
                  </td>

                  <td className="border border-slate-300 p-2 text-center">1</td>

                  <td className="border border-slate-300 p-2 text-right">
                    {formatAmount(amount)}
                  </td>

                  <td className="border border-slate-300 p-2 text-right">
                    0.00
                  </td>

                  <td className="border border-slate-300 p-2 text-right">
                    {formatAmount(amount)}
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
            })}

            {damagedPanels.length === 0 &&
              jobParts.length === 0 &&
              electricalItems.length === 0 &&
              mechanicalItems.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="border border-slate-300 p-5 text-center text-slate-500"
                  >
                    No invoice items recorded.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {/* =========================================================
          TOTALS
      ========================================================= */}

      <div className="mt-3 flex justify-end">
        <table className="w-[52%] text-xs border-collapse">
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

              <td dir="rtl" className="border border-slate-300 p-2 text-right">
                المبلغ الإجمالي مع ضريبة القيمة المضافة
              </td>

              <td className="border border-slate-300 p-2 text-right">
                {formatAmount(totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* =========================================================
          CURRENCY
      ========================================================= */}

      <div className="mt-3 text-xs flex justify-between">
        <div>
          <span className="font-bold">Currency:</span> Saudi Riyal
        </div>

        <div dir="rtl" className="font-bold">
          العملة: الريال السعودي
        </div>
      </div>

      {/* =========================================================
          PRINT BUTTON
      ========================================================= */}

      {onPrint && (
        <div className="mt-5 flex justify-end print:hidden">
          <button
            onClick={onPrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold"
          >
            Print Tax Invoice
          </button>
        </div>
      )}
    </div>
  );
}
