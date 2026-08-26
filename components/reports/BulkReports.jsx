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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Report Description */}
        <div>
          <h4 className="text-base font-black text-slate-900">
            Bulk Reports & Data Export
          </h4>

          <p className="text-sm font-medium text-slate-500 mt-1">
            Download complete workshop registers with current date naming tags.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Job Cards - Excel */}
          <button
            type="button"
            onClick={handleExportJobCardsExcel}
            className="
              bg-slate-800
              hover:bg-slate-900
              active:scale-[0.98]
              text-white
              text-sm
              font-bold
              px-4
              py-2.5
              rounded-xl
              flex
              items-center
              gap-2
              shadow-sm
              transition-all
            "
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Job Cards (Excel)</span>
          </button>

          {/* Job Cards - PDF */}
          <button
            type="button"
            onClick={handleExportJobCardsPDF}
            className="
              bg-slate-800
              hover:bg-slate-900
              active:scale-[0.98]
              text-white
              text-sm
              font-bold
              px-4
              py-2.5
              rounded-xl
              flex
              items-center
              gap-2
              shadow-sm
              transition-all
            "
          >
            <FileDown className="w-4 h-4 text-blue-400" />
            <span>Job Cards (PDF)</span>
          </button>

          {/* Sales History - Excel */}
          <button
            type="button"
            onClick={handleExportSalesExcel}
            className="
              bg-emerald-600
              hover:bg-emerald-700
              active:scale-[0.98]
              text-white
              text-sm
              font-bold
              px-4
              py-2.5
              rounded-xl
              flex
              items-center
              gap-2
              shadow-sm
              transition-all
            "
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sales History (Excel)</span>
          </button>

          {/* Sales History - PDF */}
          <button
            type="button"
            onClick={handleExportSalesPDF}
            className="
              bg-blue-600
              hover:bg-blue-700
              active:scale-[0.98]
              text-white
              text-sm
              font-bold
              px-4
              py-2.5
              rounded-xl
              flex
              items-center
              gap-2
              shadow-sm
              transition-all
            "
          >
            <FileDown className="w-4 h-4" />
            <span>Sales History (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
