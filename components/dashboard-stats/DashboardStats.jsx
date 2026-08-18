import { ClipboardList, CheckCircle2 } from "lucide-react";

export default function DashboardStats({
  totalVehicles,
  totalRevenue,
  readyForPickup,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Total Shop Vehicles
          </p>
          <h4 className="text-2xl font-bold text-slate-900">{totalVehicles}</h4>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
          <span className="text-2xl font-bold">⃁</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Total Invoiced Sales
          </p>
          <h4 className="text-2xl font-bold text-slate-900">
            ⃁{totalRevenue.toLocaleString()}
          </h4>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Ready for Pickup
          </p>
          <h4 className="text-2xl font-bold text-slate-900">
            {readyForPickup}
          </h4>
        </div>
      </div>
    </div>
  );
}
