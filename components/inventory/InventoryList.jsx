"use client";

import React from "react";
import {
  ArrowLeft,
  FileSpreadsheet,
  FileDown,
  Layers,
} from "lucide-react";

export default function InventoryList({
  inventoryData,
  handleExportInventoryExcel,
  handleExportInventoryPDF,
  setActiveScreen,
}) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 pb-12">
        <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setActiveScreen('dashboard')} 
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-white flex items-center space-x-1 text-xs font-bold border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </button>
                <div>
                  <h1 className="font-bold text-lg leading-tight">Paint Colours & Chemicals Master List</h1>
                  <p className="text-xs text-slate-400">Complete catalog of 50 workshop paint pigments and chemical supplies</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleExportInventoryExcel}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 shadow transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
                <button 
                  onClick={handleExportInventoryPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 shadow transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-xl text-purple-700"><Layers className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Inventory Catalog ({inventoryData.length} Items)</h3>
                  <p className="text-xs font-bold text-slate-500">Includes color swatches, quantities, and chemical specifications.</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-900 uppercase font-black text-[11px] border-b border-slate-300 sticky top-0">
                  <tr>
                    <th className="py-3 px-4"># ID</th>
                    <th className="py-3 px-4">Color Swatch</th>
                    <th className="py-3 px-6">Item Name</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Quantity MM / Stock</th>
                    <th className="py-3 px-6">Colour Hex Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-bold">
                  {inventoryData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono text-slate-500">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        <div 
                          className="w-8 h-8 rounded-lg border border-slate-300 shadow-inner flex items-center justify-center"
                          style={{ backgroundColor: item.hex }}
                        ></div>
                      </td>
                      <td className="py-3.5 px-6 font-black text-slate-900">{item.name}</td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black border ${item.category === 'Paint' ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300'}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-900 font-extrabold">{item.qty}</td>
                      <td className="py-3.5 px-6 font-mono text-blue-700">{item.hex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
}
