"use client";

import {
  ArrowLeft,
  ClipboardPlus,
  ClipboardList
} from "lucide-react";

export default function IntakeModule({ setActiveScreen }) {

  const modules = [
    {
      title: "New In-Take",
      titleAr: "استقبال مركبة جديدة",
      description: "Register a vehicle and create a Job Card.",
      descriptionAr: "تسجيل مركبة وإنشاء بطاقة عمل",
      icon: ClipboardPlus,
      screen: "workshop-intake-new"
    },
    {
      title: "In-Take Records",
      titleAr: "سجلات استقبال المركبات",
      description: "View and search previous In-Take records.",
      descriptionAr: "عرض سجلات استقبال المركبات والبحث فيها",
      icon: ClipboardList,
      screen: "workshop-intake-records"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      <div className="mb-7 flex flex-wrap items-start gap-4">

        <button
          type="button"
          onClick={() => setActiveScreen("desktop")}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          <div>
            <div className="text-base">Back to Dashboard</div>
            <div lang="ar" dir="rtl" className="text-xl">
              العودة إلى لوحة التحكم
            </div>
          </div>
        </button>

        <div>
          <h1 className="text-3xl font-black text-slate-900">
            In-Take
          </h1>

          <h2 lang="ar" className="text-3xl font-bold text-slate-700">
            استقبال المركبات
          </h2>

          <p className="mt-2 text-base text-slate-500">
            Manage vehicle reception and In-Take records.
          </p>

          <p lang="ar" className="text-xl font-bold text-slate-500">
            إدارة استقبال المركبات وسجلاتها
          </p>
        </div>

      </div>

      <div className="grid gap-5 lg:grid-cols-2">

        {modules.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.screen}
              type="button"
              onClick={() => setActiveScreen(item.screen)}
              className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={28} />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {item.title}
                </h3>

                <p lang="ar" className="text-2xl font-bold text-slate-700">
                  {item.titleAr}
                </p>

                <p className="mt-2 text-base text-slate-500">
                  {item.description}
                </p>

                <p lang="ar" className="text-lg font-bold text-slate-500">
                  {item.descriptionAr}
                </p>
              </div>

            </button>
          );
        })}

      </div>
    </div>
  );
}