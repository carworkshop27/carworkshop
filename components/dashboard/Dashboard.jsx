"use client";

import React from "react";
import {
  FileSpreadsheet,
  FileDown,
  Layers,
  LayoutGrid,
  LayoutList,
  Loader2,
  ClipboardList,
  DollarSign,
  CheckCircle2,
  Search,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  LogOut,
  Plus,
  Car,
  X,
  MessageSquare,
  MinusCircle,
  ShoppingCart,
  Package,
  Send,
  Wrench,
  Truck,
  Lock,
  Phone,
  Copy,
  Users,
  Trash2,
} from "lucide-react";

export default function Dashboard({
  currentUser,
  activeJob,
  filteredJobs,
  inventory,
  totalVehicles,
  totalRevenue,
  readyForPickup,
  searchTerm,
  viewMode,
  partQuantity,
  purchaseForm,

  selectedPartId,
  isLoading,
  handleAddPartToJob,
  handleExportJobCardsExcel,
  handleExportJobCardsPDF,
  handleExportSalesExcel,
  handleExportSalesPDF,
  handleLogout,
  handleOpenFullJobCard,
  handleOpenSmsModal,
  handlePurchaseOrderSubmit,
  handleResetData,
  handleSelectJob,
  setActiveScreen,
  isSmsModalOpen,
  smsJobData,
  generateSmsText,

  setIsModalOpen,
  setIsSmsModalOpen,
  setIsUserModalOpen,
  setPartQuantity,
  setPurchaseForm,
  setSearchTerm,
  setSelectedPartId,
  setViewMode,
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-12">
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center space-x-3 shrink-0">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">AutoFix Pro</h1>
                <p className="text-xs text-slate-400">Enterprise System</p>
              </div>
            </div>

            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input type="text" placeholder="Search by Customer, Plate, or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800 text-sm text-slate-100 pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-400" />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center space-x-2">
                <ShieldCheck className={`w-4 h-4 ${currentUser.role === 'Super User' ? 'text-purple-400' : 'text-emerald-400'}`} />
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 leading-none">Logged in as:</p>
                  <p className="text-xs font-black text-white">{currentUser.name} ({currentUser.role})</p>
                </div>
              </div>

              {currentUser.role === 'Super User' && (
                <button onClick={() => setIsUserModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 shadow transition-colors">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Manage Users</span>
                </button>
              )}

              {(currentUser.role === 'Manager' || currentUser.role === 'Super User') && (
                <button onClick={handleResetData} title="Reset All Data" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Demo</span>
                </button>
              )}

              <button onClick={handleLogout} title="Log Out" className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 shadow transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Workshop Dashboard</h2>
            <p className="text-sm text-slate-600">
              {activeJob ? `Viewing Vehicle: ${activeJob.model} (${activeJob.plate})` : 'Register or select a vehicle to begin'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveScreen('inventory-list')} 
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 shadow transition-transform"
            >
              <Layers className="w-5 h-5" />
              <span>Paint & Chemicals Inventory</span>
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 shadow transition-transform">
              <Plus className="w-5 h-5" />
              <span>New Vehicle Intake</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Bulk Reports & Data Export</h4>
            <p className="text-xs text-slate-500">Download complete workshop registers with current date naming tags.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleExportJobCardsExcel} className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Job Cards (Excel)
            </button>
            <button onClick={handleExportJobCardsPDF} className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow">
              <FileDown className="w-4 h-4 text-blue-400" /> Job Cards (PDF)
            </button>
            <button onClick={handleExportSalesExcel} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow">
              <FileSpreadsheet className="w-4 h-4" /> Sales History (Excel)
            </button>
            <button onClick={handleExportSalesPDF} className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow">
              <FileDown className="w-4 h-4" /> Sales History (PDF)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><ClipboardList className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Shop Vehicles</p>
              <h4 className="text-2xl font-bold text-slate-900">{totalVehicles}</h4>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600"><DollarSign className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Invoiced Sales</p>
              <h4 className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Ready for Pickup</p>
              <h4 className="text-2xl font-bold text-slate-900">{readyForPickup}</h4>
            </div>
          </div>
        </div>

        {/* --- ACTIVE GARAGE VEHICLES --- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">
              Active Garage Vehicles {searchTerm && <span className="text-blue-600 ml-2">(Search Results)</span>}
            </h3>
            <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
              <button onClick={() => setViewMode('list')} className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                <LayoutList className="w-4 h-4" /> <span>List</span>
              </button>
              <button onClick={() => setViewMode('board')} className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === 'board' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                <LayoutGrid className="w-4 h-4" /> <span>Kanban Board</span>
              </button>
            </div>
          </div>

          <div className="p-0">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center space-x-2 text-slate-600 text-sm font-medium">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" /><span>Loading local vehicles...</span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-8 text-center text-slate-600 text-sm font-medium">
                {searchTerm ? 'No vehicles match your search query.' : 'No vehicles registered locally yet.'}
              </div>
            ) : (
              <>
                {viewMode === 'list' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-900 uppercase font-extrabold text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-6">Job ID / Vehicle</th>
                          <th className="py-3.5 px-6">Customer Info</th>
                          <th className="py-3.5 px-6">Workshop Status</th>
                          <th className="py-3.5 px-6">Payment Status</th>
                          <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredJobs.map((job) => {
                          const isSelected = job.id === selectedJobId;
                          const pStatus = job.paymentStatus || 'Unpaid';
                          const pColor = pStatus === 'Paid' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : pStatus === 'Pending' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-rose-100 text-rose-900 border-rose-300';

                          return (
                            <tr key={job.id} onClick={() => handleSelectJob(job)} className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/90 border-l-4 border-blue-600 font-semibold' : 'hover:bg-slate-50'}`}>
                              <td className="py-4 px-6 text-slate-900">
                                <div className="font-extrabold text-blue-700">{job.id}</div>
                                <div className="text-sm font-bold text-slate-900">{job.model}</div>
                              </td>
                              <td className="py-4 px-6"><div className="font-extrabold text-slate-900">{job.owner}</div></td>
                              <td className="py-4 px-6 font-medium">
                                <span className="bg-slate-200 text-slate-900 px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold border border-slate-300">{job.status}</span>
                              </td>
                              <td className="py-4 px-6">
                                <button onClick={(e) => togglePaymentStatus(job.id, e)} className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold border transition-transform active:scale-95 shadow-sm ${pColor}`}>
                                  {pStatus} (Click)
                                </button>
                              </td>
                              <td className="py-4 px-6 text-right space-x-2">
                                <button onClick={(e) => handleOpenSmsModal(job, e)} className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg shadow inline-flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5" /> SMS
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleOpenFullJobCard(job); }} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-lg shadow">
                                  View Full Job Card
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {viewMode === 'board' && (
                  <div className="p-6 bg-slate-50 overflow-x-auto">
                    <div className="flex gap-6 min-w-max">
                      <div className="w-80 flex-shrink-0 flex flex-col bg-slate-200/80 rounded-xl border border-slate-300">
                        <div className="p-3 border-b border-slate-300 bg-white rounded-t-xl font-extrabold text-sm text-slate-900 flex justify-between items-center">
                          <span>1. Inspection</span>
                          <span className="bg-slate-300 text-slate-900 text-xs px-2.5 py-0.5 rounded-full font-black">{filteredJobs.filter(j => j.status === 'Inspection & Body Check').length}</span>
                        </div>
                        <div className="p-3 space-y-3 h-96 overflow-y-auto">
                          {filteredJobs.filter(j => j.status === 'Inspection & Body Check').map(job => (
                            <div key={job.id} onClick={() => handleSelectJob(job)} className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${job.id === selectedJobId ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-300 hover:border-blue-400'}`}>
                              <div className="flex justify-between items-start mb-1">
                                <div className="text-xs font-extrabold text-blue-700">{job.id}</div>
                                <div className="flex items-center gap-1">
                                  <button onClick={(e) => handleOpenSmsModal(job, e)} title="Send SMS / WhatsApp" className="p-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={(e) => togglePaymentStatus(job.id, e)} className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${job.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-900' : job.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'}`}>
                                    {job.paymentStatus || 'Unpaid'}
                                  </button>
                                </div>
                              </div>
                              <div className="font-extrabold text-slate-900 text-sm">{job.model}</div>
                              <div className="text-xs font-bold text-slate-700 mb-3">{job.owner}</div>
                              
                              <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenFullJobCard(job); }} className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-[11px] rounded">View Details</button>
                                <button onClick={(e) => updateJobStatus(job.id, 'In Repair / Workshop', e)} className="flex-1 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 text-[11px] font-black rounded">Start Repair</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-80 flex-shrink-0 flex flex-col bg-slate-200/80 rounded-xl border border-slate-300">
                        <div className="p-3 border-b border-slate-300 bg-white rounded-t-xl font-extrabold text-sm text-amber-950 flex justify-between items-center">
                          <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>2. In Repair</span>
                          <span className="bg-amber-200 text-amber-950 text-xs px-2.5 py-0.5 rounded-full font-black">{filteredJobs.filter(j => j.status === 'In Repair / Workshop').length}</span>
                        </div>
                        <div className="p-3 space-y-3 h-96 overflow-y-auto">
                          {filteredJobs.filter(j => j.status === 'In Repair / Workshop').map(job => (
                            <div key={job.id} onClick={() => handleSelectJob(job)} className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${job.id === selectedJobId ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-300 hover:border-blue-400'}`}>
                              <div className="flex justify-between items-start mb-1">
                                <div className="text-xs font-extrabold text-blue-700">{job.id}</div>
                                <div className="flex items-center gap-1">
                                  <button onClick={(e) => handleOpenSmsModal(job, e)} title="Send SMS / WhatsApp" className="p-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={(e) => togglePaymentStatus(job.id, e)} className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${job.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-900' : job.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'}`}>
                                    {job.paymentStatus || 'Unpaid'}
                                  </button>
                                </div>
                              </div>
                              <div className="font-extrabold text-slate-900 text-sm">{job.model}</div>
                              <div className="text-xs font-bold text-slate-700 mb-3">{job.owner}</div>
                              
                              <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenFullJobCard(job); }} className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-[11px] rounded">View Details</button>
                                <button onClick={(e) => updateJobStatus(job.id, 'Ready for Pickup', e)} className="flex-1 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-black rounded">Mark Ready</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-80 flex-shrink-0 flex flex-col bg-slate-200/80 rounded-xl border border-slate-300">
                        <div className="p-3 border-b border-slate-300 bg-white rounded-t-xl font-extrabold text-sm text-emerald-950 flex justify-between items-center">
                          <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>3. Ready</span>
                          <span className="bg-emerald-200 text-emerald-950 text-xs px-2.5 py-0.5 rounded-full font-black">{filteredJobs.filter(j => j.status === 'Ready for Pickup').length}</span>
                        </div>
                        <div className="p-3 space-y-3 h-96 overflow-y-auto">
                          {filteredJobs.filter(j => j.status === 'Ready for Pickup').map(job => (
                            <div key={job.id} onClick={() => handleSelectJob(job)} className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${job.id === selectedJobId ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-300 hover:border-blue-400'}`}>
                              <div className="flex justify-between items-start mb-1">
                                <div className="text-xs font-extrabold text-blue-700">{job.id}</div>
                                <div className="flex items-center gap-1">
                                  <button onClick={(e) => handleOpenSmsModal(job, e)} title="Send SMS / WhatsApp" className="p-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={(e) => togglePaymentStatus(job.id, e)} className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${job.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-900' : job.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'}`}>
                                    {job.paymentStatus || 'Unpaid'}
                                  </button>
                                </div>
                              </div>
                              <div className="font-extrabold text-slate-900 text-sm">{job.model}</div>
                              <div className="text-xs font-bold text-slate-700 mb-3">{job.owner}</div>
                              
                              <button onClick={(e) => { e.stopPropagation(); handleOpenFullJobCard(job); }} className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded mb-2">View Full Job Card Details</button>
                              <div className="w-full py-1.5 bg-emerald-100 text-emerald-950 text-xs font-black rounded flex justify-center items-center gap-1 border border-emerald-300">
                                <CheckCircle2 className="w-4 h-4" /> Complete
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      

        <div className="bg-white rounded-xl border border-slate-300 shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6 text-blue-700" />
              <h3 className="font-extrabold text-lg text-slate-900">Spare Parts & Purchase Inventory</h3>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-full">Role: {currentUser.role}</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {inventory.map(item => (
              <div key={item.id} className="bg-slate-100 border border-slate-300 p-4 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{item.name}</h4>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    {currentUser.role === 'Mechanic' ? 'Restricted Cost' : `Buy: $${item.costPrice || 40}`} | Sell: ${item.price}
                  </p>
                </div>
                <div className={`text-xs font-black px-3 py-1.5 rounded-full shadow-sm ${item.stock > 5 ? 'bg-emerald-200 text-emerald-900 border border-emerald-400' : 'bg-rose-200 text-rose-900 border border-rose-400'}`}>
                  Stock: {item.stock}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleAddPartToJob} className="bg-blue-50/90 border border-blue-300 p-5 rounded-xl shadow-sm flex flex-col justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MinusCircle className="w-4 h-4 text-blue-700" /> Job Card Parts Deduction
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-extrabold text-blue-950 mb-1">
                      Target Job {activeJob ? `(${activeJob.id} - ${activeJob.model})` : '(⚠️ Select a car above first!)'}
                    </label>
                    <select value={selectedPartId} onChange={(e) => setSelectedPartId(e.target.value)} className="w-full bg-white text-xs font-bold text-slate-900 p-2.5 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600">
                      <option value="">-- Select Spare Part to Deduct --</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>{item.name} (${item.price} - Stock: {item.stock})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-blue-950 mb-1">Quantity</label>
                    <input type="number" min="1" value={partQuantity} onChange={(e) => setPartQuantity(e.target.value)} className="w-full bg-white text-xs font-bold text-slate-900 p-2.5 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-lg shadow flex items-center justify-center gap-1">
                <MinusCircle className="w-4 h-4" /> Deduct from Active Job
              </button>
            </form>

            <form onSubmit={handlePurchaseOrderSubmit} className={`p-5 rounded-xl shadow-sm flex flex-col justify-between gap-3 border ${currentUser.role === 'Manager' || currentUser.role === 'Super User' ? 'bg-emerald-50/90 border-emerald-300' : 'bg-slate-100 border-slate-300 opacity-75'}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                    <Truck className="w-4 h-4 text-emerald-700" /> Purchase Order & Supplier Intake
                  </h4>
                  {currentUser.role !== 'Manager' && currentUser.role !== 'Super User' && (
                    <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Manager / Super User Only
                    </span>
                  )}
                </div>

                {currentUser.role === 'Manager' || currentUser.role === 'Super User' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block text-[11px] font-extrabold text-emerald-950 mb-1">Supplier Name *</label>
                        <input type="text" required placeholder="e.g. Bosch Auto Parts" value={purchaseForm.supplierName} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })} className="w-full bg-white text-xs font-bold text-slate-900 p-2 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-emerald-950 mb-1">Spare Part</label>
                        <select value={purchaseForm.partId} onChange={(e) => setPurchaseForm({ ...purchaseForm, partId: e.target.value })} className="w-full bg-white text-xs font-bold text-slate-900 p-2 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600">
                          {inventory.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-extrabold text-emerald-950 mb-1">Quantity Purchased</label>
                        <input type="number" min="1" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} className="w-full bg-white text-xs font-bold text-slate-900 p-2 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-emerald-950 mb-1">Unit Cost ($)</label>
                        <input type="number" min="0" value={purchaseForm.unitCost} onChange={(e) => setPurchaseForm({ ...purchaseForm, unitCost: e.target.value })} className="w-full bg-white text-xs font-bold text-slate-900 p-2 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-slate-600 text-xs font-bold">
                    <Lock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    Purchase orders and supplier financial logs are restricted to Managers & Super Users.
                  </div>
                )}
              </div>

              <button type="submit" disabled={currentUser.role !== 'Manager' && currentUser.role !== 'Super User'} className={`w-full py-2.5 text-white font-extrabold text-xs rounded-lg shadow flex items-center justify-center gap-1 ${currentUser.role === 'Manager' || currentUser.role === 'Super User' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-slate-400 cursor-not-allowed'}`}>
                <ShoppingCart className="w-4 h-4" /> Log Purchase & Restock Inventory
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* --- CUSTOMER SMS / WHATSAPP NOTIFICATION MODAL --- */}
      {isSmsModalOpen && smsJobData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-300">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-lg">Send Customer Notification</h3>
              </div>
              <button onClick={() => setIsSmsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Target Phone Number</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-black text-slate-900">{smsJobData.phone}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Message Preview</label>
                <textarea 
                  rows="8" 
                  readOnly 
                  value={generateSmsText(smsJobData)} 
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generateSmsText(smsJobData));
                    alert("Message copied to clipboard!");
                  }}
                  className="py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow"
                >
                  <Copy className="w-4 h-4" /> Copy Text
                </button>
                <a 
                  href={`https://wa.me/${smsJobData.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(generateSmsText(smsJobData))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow text-center"
                >
                  <Send className="w-4 h-4" /> Open WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
