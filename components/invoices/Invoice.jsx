"use client";

import React from "react";
import {
  Car,
  User,
  Phone,
  Mail,
  CalendarDays,
  FileText,
  Printer,
} from "lucide-react";

export default function Invoice({
  job,
  getDamageInfo,
  onPrint,
  isTaxInvoice = false,
}) {
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
  const grandTotal = taxableAmount + vatAmount;

  const invoiceNumber = `INV-${job.id.replace("JOB-", "")}`;

  return (
    <div className="invoice-print-area bg-white text-slate-900">
      {/* INVOICE HEADER */}
      <div className="border-b-2 border-slate-900 pb-4">
        <div className="flex items-start justify-between">
          {/* COMPANY INFORMATION */}
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Garage Altalaa Fahir
            </h1>

            <p className="text-sm font-semibold text-slate-500 mt-1">
              Vehicle Repair & Maintenance
            </p>

            <div className="mt-3 text-xs text-slate-600 leading-5">
              <p>Street Address</p>
              <p>City, Saudi Arabia</p>
              <p>Phone: +966 XX XXX XXXX</p>
              <p>Email: info@autofixpro.com</p>
            </div>
          </div>

          {/* INVOICE INFORMATION */}
          <div className="text-right">
            <h2 className="text-4xl font-black uppercase tracking-wide text-slate-700">
              {isTaxInvoice ? "Tax Invoice" : "Invoice"}
            </h2>

            <div className="mt-4 border border-slate-300">
              <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-300 text-xs font-black uppercase">
                <div className="px-4 py-2 border-r border-slate-300">
                  Invoice #
                </div>

                <div className="px-4 py-2">Date</div>
              </div>

              <div className="grid grid-cols-2 text-sm font-semibold">
                <div className="px-4 py-2 border-r border-slate-300">
                  {invoiceNumber}
                </div>

                <div className="px-4 py-2">
                  {job.intakeDate || job.date || "N/A"}
                </div>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-500 mt-2">
              Job Card: {job.id}
            </p>
          </div>
        </div>
      </div>

      {/* CUSTOMER + VEHICLE */}
      <div className="grid grid-cols-2 gap-6 py-5">
        {/* BILL TO / CUSTOMER */}
        <div className="border border-slate-300 rounded-none">
          <div className="bg-slate-100 border-b border-slate-300 px-4 py-2">
            <h3 className="font-black uppercase text-sm text-slate-800">
              Bill To
            </h3>
          </div>

          <div className="px-4 py-3 text-sm leading-6">
            <p>
              <span className="font-bold">Name:</span> {job.owner || "N/A"}
            </p>

            <p>
              <span className="font-bold">Mobile:</span> {job.phone || "N/A"}
            </p>

            <p>
              <span className="font-bold">Email:</span> {job.email || "N/A"}
            </p>
          </div>
        </div>

        {/* VEHICLE INFORMATION */}
        <div className="border border-slate-300 rounded-none">
          <div className="bg-slate-100 border-b border-slate-300 px-4 py-2">
            <h3 className="font-black uppercase text-sm text-slate-800">
              Vehicle Information
            </h3>
          </div>

          <div className="px-4 py-3 text-sm leading-6">
            <div className="grid grid-cols-2 gap-x-6">
              <p>
                <span className="font-bold">Make:</span>{" "}
                {job.make || job.company || "N/A"}
              </p>

              <p>
                <span className="font-bold">Model:</span> {job.model || "N/A"}
              </p>

              <p>
                <span className="font-bold">Year:</span> {job.year || "N/A"}
              </p>

              <p>
                <span className="font-bold">Color:</span> {job.color || "N/A"}
              </p>

              <p>
                <span className="font-bold">Plate:</span> {job.plate || "N/A"}
              </p>

              <p>
                <span className="font-bold">Status:</span> {job.status || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICES & REPAIRS */}
      <div className="mb-6">
        <h3 className="font-black uppercase text-sm mb-3">
          Services & Repairs
        </h3>

        <div className="border border-slate-300 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="text-left px-4 py-3 font-black uppercase">
                  Description
                </th>

                <th className="text-right px-4 py-3 font-black uppercase">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {/* BODY / PANEL REPAIRS */}
              {damagedPanels.map((panel) => {
                const info = getDamageInfo(panel.status);

                const amount =
                  panel.customRepairCost !== undefined &&
                  panel.customRepairCost !== ""
                    ? Number(panel.customRepairCost)
                    : Number(info.cost || 0);

                return (
                  <tr key={panel.id} className="border-b border-slate-200">
                    <td className="px-4 py-3">
                      <div className="font-bold">{panel.name}</div>

                      <div className="text-xs text-slate-500 mt-0.5">
                        {info.label}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                      ⃁{amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}

              {/* ELECTRICAL WORK */}
              {electricalItems.map((item, index) => (
                <tr
                  key={`electrical-${index}`}
                  className="border-b border-slate-200"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold">
                      {item.partName || item.description}
                    </div>

                    <div className="text-xs text-slate-500 mt-0.5">
                      Electrical Work
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                    ⃁{Number(item.cost || 0).toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* MECHANICAL WORK */}
              {mechanicalItems.map((item, index) => (
                <tr
                  key={`mechanical-${index}`}
                  className="border-b border-slate-200"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold">
                      {item.partName || item.description}
                    </div>

                    <div className="text-xs text-slate-500 mt-0.5">
                      Mechanical Work
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                    ⃁{Number(item.cost || 0).toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* SPARE PARTS */}
              {jobParts.map((part, index) => (
                <tr key={`part-${index}`} className="border-b border-slate-200">
                  <td className="px-4 py-3">
                    <div className="font-bold">{part.name}</div>

                    <div className="text-xs text-slate-500 mt-0.5">
                      Spare Part
                      {part.qty && Number(part.qty) > 1
                        ? ` • Qty: ${part.qty}`
                        : ""}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                    ⃁{Number(part.price || 0).toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* EMPTY STATE */}
              {damagedPanels.length === 0 &&
                electricalItems.length === 0 &&
                mechanicalItems.length === 0 &&
                jobParts.length === 0 && (
                  <tr>
                    <td
                      colSpan="2"
                      className="px-4 py-8 text-center text-slate-500 font-semibold"
                    >
                      No repair services recorded.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOTALS */}
      <div className="flex justify-end">
        <div className="w-full md:w-96 border border-slate-300 rounded-xl overflow-hidden">
          <div className="flex justify-between px-4 py-3 border-b border-slate-200">
            <span className="font-bold">Subtotal</span>
            <span className="font-bold">⃁{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between px-4 py-3 border-b border-slate-200">
            <span className="font-bold">Discount</span>
            <span className="font-bold">⃁{discount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between px-4 py-3 border-b border-slate-200">
            <span className="font-bold">Taxable Amount</span>
            <span className="font-bold">⃁{taxableAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between px-4 py-3 border-b border-slate-200">
            <span className="font-bold">VAT ({vatRate}%)</span>
            <span className="font-bold">⃁{vatAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between px-4 py-4 bg-slate-900 text-white">
            <span className="font-black text-lg">Grand Total</span>

            <span className="font-black text-lg">⃁{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* PAYMENT */}
      <div className="mt-6 border border-slate-300 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="font-black uppercase text-sm">Payment Status</span>

          <span className="font-black uppercase text-sm">
            {job.paymentStatus || "Unpaid"}
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-8 pt-5 border-t border-slate-300 text-center">
        <p className="text-xs font-semibold text-slate-500">
          Thank you for choosing Garage Altalaa Fahir.
        </p>

        <p className="text-xs text-slate-400 mt-1">
          This document is generated from the workshop management system.
        </p>
      </div>

      {/* PRINT BUTTON */}
      {onPrint && (
        <div className="mt-6 flex justify-end print:hidden">
          <button
            onClick={onPrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow"
          >
            <Printer className="w-4 h-4" />
            Print {isTaxInvoice ? "Tax Invoice" : "Invoice"}
          </button>
        </div>
      )}
    </div>
  );
}
