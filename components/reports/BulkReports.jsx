"use client";

import React from "react";
import { FileSpreadsheet, FileDown } from "lucide-react";

export default function BulkReports({
  handleExportJobCardsExcel,
  handleExportJobCardsPDF,
  handleExportSalesExcel,
  handleExportSalesPDF,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div>
        <h4 className="font-bold text-slate-900 text-sm">
          Bulk Reports & Data Export
        </h4>
        <p className="text-xs text-slate-500">
          Download complete workshop registers with current date naming tags.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleExportJobCardsExcel}
          className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Job Cards (Excel)
        </button>

        <button
          onClick={handleExportJobCardsPDF}
          className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow"
        >
          <FileDown className="w-4 h-4 text-blue-400" />
          Job Cards (PDF)
        </button>

        <button
          onClick={handleExportSalesExcel}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Sales History (Excel)
        </button>

        <button
          onClick={handleExportSalesPDF}
          className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow"
        >
          <FileDown className="w-4 h-4" />
          Sales History (PDF)
        </button>
      </div>
    </div>
  );
}
