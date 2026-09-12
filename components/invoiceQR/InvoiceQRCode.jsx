"use client";

import React from "react";
import QRCode from "react-qr-code";

export default function InvoiceQRCode({
  invoiceNumber,
  workshopName,
  vatNumber,
  invoiceTotal,
  vatTotal,
}) {
  const qrData = JSON.stringify({
    invoiceNo: invoiceNumber || "",
    workshopName: workshopName || "",
    vatNumber: vatNumber || "",
    invoiceTotal: Number(invoiceTotal || 0).toFixed(2),
    vatTotal: Number(vatTotal || 0).toFixed(2),
  });

  return (
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
  );
}
