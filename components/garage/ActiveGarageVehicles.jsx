"use client";

import {
  LayoutList,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Printer,
  CheckCircle2,
  X,
} from "lucide-react";

export default function ActiveGarageVehicles({
  searchTerm,
  viewMode,
  setViewMode,
  isLoading,
  filteredJobs,
  selectedJobId,
  handleSelectJob,
  togglePaymentStatus,
  handleOpenSmsModal,
  handleOpenFullJobCard,
  updateJobStatus,
  handleDeleteJob,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-lg">
          Active Garage Vehicles{" "}
          {searchTerm && (
            <span className="text-blue-600 ml-2">(Search Results)</span>
          )}
        </h3>

        <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-800 font-bold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span>List</span>
          </button>

          <button
            onClick={() => setViewMode("board")}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === "board"
                ? "bg-blue-100 text-blue-800 font-bold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Kanban Board</span>
          </button>
        </div>
      </div>

      <div className="p-0">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center space-x-2 text-slate-600 text-sm font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading local vehicles...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center text-slate-600 text-sm font-medium">
            {searchTerm
              ? "No vehicles match your search query."
              : "No vehicles registered locally yet."}
          </div>
        ) : (
          <>
            {/* LIST VIEW */}
            {viewMode === "list" && (
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
                      const pStatus = job.paymentStatus || "Unpaid";

                      const pColor =
                        pStatus === "Paid"
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : pStatus === "Pending"
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-rose-100 text-rose-900 border-rose-300";

                      return (
                        <tr
                          key={job.id}
                          onClick={() => handleSelectJob(job)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-50/90 border-l-4 border-blue-600 font-semibold"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="py-4 px-6 text-slate-900">
                            <div className="font-extrabold text-blue-700">
                              {job.id}
                            </div>
                            <div className="text-sm font-bold text-slate-900">
                              {job.model}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="font-extrabold text-slate-900">
                              {job.owner}
                            </div>
                          </td>

                          <td className="py-4 px-6 font-medium">
                            <span className="bg-slate-200 text-slate-900 px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold border border-slate-300">
                              {job.status}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            <button
                              onClick={(e) => togglePaymentStatus(job.id, e)}
                              className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold border transition-transform active:scale-95 shadow-sm ${pColor}`}
                            >
                              {pStatus} (Click)
                            </button>
                          </td>

                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteJob(job.id);
                              }}
                              title="Delete vehicle"
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-900 border border-rose-300 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => handleOpenSmsModal(job, e)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg shadow inline-flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              SMS
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenFullJobCard(job, true);
                              }}
                              title="Print Job Card"
                              className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-black text-xs rounded-lg shadow inline-flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Print
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenFullJobCard(job);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-lg shadow"
                            >
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

            {/* KANBAN BOARD */}
            {viewMode === "board" && (
              <div className="p-6 bg-slate-50 overflow-x-auto">
                <div className="flex gap-6 min-w-max">
                  {/* 1. INSPECTION */}
                  <div className="w-80 flex-shrink-0 flex flex-col bg-slate-200/80 rounded-xl border border-slate-300">
                    <div className="p-3 border-b border-slate-300 bg-white rounded-t-xl font-extrabold text-sm text-slate-900 flex justify-between items-center">
                      <span>1. Inspection</span>

                      <span className="bg-slate-300 text-slate-900 text-xs px-2.5 py-0.5 rounded-full font-black">
                        {
                          filteredJobs.filter(
                            (j) => j.status === "Inspection & Body Check",
                          ).length
                        }
                      </span>
                    </div>

                    <div className="p-3 space-y-3 h-96 overflow-y-auto">
                      {filteredJobs
                        .filter((j) => j.status === "Inspection & Body Check")
                        .map((job) => (
                          <div
                            key={job.id}
                            onClick={() => handleSelectJob(job)}
                            className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
                              job.id === selectedJobId
                                ? "border-blue-600 ring-2 ring-blue-300"
                                : "border-slate-300 hover:border-blue-400"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="text-xs font-extrabold text-blue-700">
                                {job.id}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteJob(job.id);
                                  }}
                                  title="Delete vehicle"
                                  className="p-1 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={(e) => handleOpenSmsModal(job, e)}
                                  title="Send SMS / WhatsApp"
                                  className="p-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={(e) =>
                                    togglePaymentStatus(job.id, e)
                                  }
                                  className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                                    job.paymentStatus === "Paid"
                                      ? "bg-emerald-100 text-emerald-900"
                                      : job.paymentStatus === "Pending"
                                        ? "bg-amber-100 text-amber-900"
                                        : "bg-rose-100 text-rose-900"
                                  }`}
                                >
                                  {job.paymentStatus || "Unpaid"}
                                </button>
                              </div>
                            </div>

                            <div className="font-extrabold text-slate-900 text-sm">
                              {job.model}
                            </div>

                            <div className="text-xs font-bold text-slate-700 mb-3">
                              {job.owner}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenFullJobCard(job);
                                }}
                                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-[11px] rounded"
                              >
                                View Details
                              </button>

                              <button
                                onClick={(e) =>
                                  updateJobStatus(
                                    job.id,
                                    "In Repair / Workshop",
                                    e,
                                  )
                                }
                                className="flex-1 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 text-[11px] font-black rounded"
                              >
                                Start Repair
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* 2. IN REPAIR */}
                  <div className="w-80 flex-shrink-0 flex flex-col bg-slate-200/80 rounded-xl border border-slate-300">
                    <div className="p-3 border-b border-slate-300 bg-white rounded-t-xl font-extrabold text-sm text-amber-950 flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>
                        2. In Repair
                      </span>

                      <span className="bg-amber-200 text-amber-950 text-xs px-2.5 py-0.5 rounded-full font-black">
                        {
                          filteredJobs.filter(
                            (j) => j.status === "In Repair / Workshop",
                          ).length
                        }
                      </span>
                    </div>

                    <div className="p-3 space-y-3 h-96 overflow-y-auto">
                      {filteredJobs
                        .filter((j) => j.status === "In Repair / Workshop")
                        .map((job) => (
                          <div
                            key={job.id}
                            onClick={() => handleSelectJob(job)}
                            className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
                              job.id === selectedJobId
                                ? "border-blue-600 ring-2 ring-blue-300"
                                : "border-slate-300 hover:border-blue-400"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="text-xs font-extrabold text-blue-700">
                                {job.id}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteJob(job.id);
                                  }}
                                  title="Delete vehicle"
                                  className="p-1 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={(e) => handleOpenSmsModal(job, e)}
                                  title="Send SMS / WhatsApp"
                                  className="p-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={(e) =>
                                    togglePaymentStatus(job.id, e)
                                  }
                                  className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                                    job.paymentStatus === "Paid"
                                      ? "bg-emerald-100 text-emerald-900"
                                      : job.paymentStatus === "Pending"
                                        ? "bg-amber-100 text-amber-900"
                                        : "bg-rose-100 text-rose-900"
                                  }`}
                                >
                                  {job.paymentStatus || "Unpaid"}
                                </button>
                              </div>
                            </div>

                            <div className="font-extrabold text-slate-900 text-sm">
                              {job.model}
                            </div>

                            <div className="text-xs font-bold text-slate-700 mb-3">
                              {job.owner}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenFullJobCard(job);
                                }}
                                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-[11px] rounded"
                              >
                                View Details
                              </button>

                              <button
                                onClick={(e) =>
                                  updateJobStatus(job.id, "Ready for Pickup", e)
                                }
                                className="flex-1 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-black rounded"
                              >
                                Mark Ready
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* 3. READY */}
                  <div className="w-80 flex-shrink-0 flex flex-col bg-slate-200/80 rounded-xl border border-slate-300">
                    <div className="p-3 border-b border-slate-300 bg-white rounded-t-xl font-extrabold text-sm text-emerald-950 flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                        3. Ready
                      </span>

                      <span className="bg-emerald-200 text-emerald-950 text-xs px-2.5 py-0.5 rounded-full font-black">
                        {
                          filteredJobs.filter(
                            (j) => j.status === "Ready for Pickup",
                          ).length
                        }
                      </span>
                    </div>

                    <div className="p-3 space-y-3 h-96 overflow-y-auto">
                      {filteredJobs
                        .filter((j) => j.status === "Ready for Pickup")
                        .map((job) => (
                          <div
                            key={job.id}
                            onClick={() => handleSelectJob(job)}
                            className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
                              job.id === selectedJobId
                                ? "border-blue-600 ring-2 ring-blue-300"
                                : "border-slate-300 hover:border-blue-400"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="text-xs font-extrabold text-blue-700">
                                {job.id}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteJob(job.id);
                                  }}
                                  title="Delete vehicle"
                                  className="p-1 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={(e) => handleOpenSmsModal(job, e)}
                                  title="Send SMS / WhatsApp"
                                  className="p-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={(e) =>
                                    togglePaymentStatus(job.id, e)
                                  }
                                  className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                                    job.paymentStatus === "Paid"
                                      ? "bg-emerald-100 text-emerald-900"
                                      : job.paymentStatus === "Pending"
                                        ? "bg-amber-100 text-amber-900"
                                        : "bg-rose-100 text-rose-900"
                                  }`}
                                >
                                  {job.paymentStatus || "Unpaid"}
                                </button>
                              </div>
                            </div>

                            <div className="font-extrabold text-slate-900 text-sm">
                              {job.model}
                            </div>

                            <div className="text-xs font-bold text-slate-700 mb-3">
                              {job.owner}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenFullJobCard(job);
                              }}
                              className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded mb-2"
                            >
                              View Full Job Card Details
                            </button>

                            <div className="w-full py-1.5 bg-emerald-100 text-emerald-950 text-xs font-black rounded flex justify-center items-center gap-1 border border-emerald-300">
                              <CheckCircle2 className="w-4 h-4" />
                              Complete
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
  );
}
