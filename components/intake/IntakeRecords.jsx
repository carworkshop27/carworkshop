"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import WorkshopIntake from "./WorkshopIntake";

import {
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  ClipboardList,
  Wallet,
  ChevronLeft,
  Pencil,
  Trash2,
  ChevronRight
} from "lucide-react";

function Label({ en, ar }) {
  return (
    <div>
      <div className="text-base font-bold">{en}</div>
      <div lang="ar" className="text-xl font-bold">{ar}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const money = (value) =>
  Number(value || 0).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const pageSize = 20;

export default function IntakeRecords({ setActiveScreen }) {

  // WORKSHOP_INTAKE_RECORD_ACTIONS_V1

  const [records, setRecords] = useState([]);
  const [canDelete, setCanDelete] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const deletingRef = useRef(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {

    const controller = new AbortController();

    async function load() {

      setLoading(true);
      setError("");

      try {

        const response = await fetch("/api/intake/records", {
          cache: "no-store",
          signal: controller.signal
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load records.");
        }

        setRecords(data.records || []);
        setCanDelete(data.canDelete === true);

      } catch (err) {

        if (err.name !== "AbortError") {
          setError(err.message);
        }

      } finally {

        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();

  }, [refresh]);

  useEffect(() => {
    setPage(1);
  }, [search, dateFrom, dateTo, refresh]);

  const invalidDates =
    dateFrom && dateTo && dateFrom > dateTo;

  const filtered = useMemo(() => {

    if (invalidDates) return [];

    const query = search.trim().toLowerCase();

    return records.filter((record) => {

      const value = [
        record.id,
        record.owner,
        record.phone,
        record.make,
        record.model,
        record.plate,
        record.status,
        record.issue
      ].filter(Boolean).join(" ").toLowerCase();

      if (query && !value.includes(query)) return false;

      if (dateFrom &&
          (!record.intake_date || record.intake_date < dateFrom)) {
        return false;
      }

      if (dateTo &&
          (!record.intake_date || record.intake_date > dateTo)) {
        return false;
      }

      return true;
    });

  }, [records, search, dateFrom, dateTo, invalidDates]);

  const totalCost = filtered.reduce(
    (sum, record) => sum + Number(record.approximate_cost || 0),
    0
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  async function handleDelete(record) {

    if (!canDelete || deletingRef.current) return;

    setActionError("");
    setActionMessage("");

    const confirmation = window.prompt(
      "PERMANENT DELETE\n\n" +
      "Job Card: " + record.id + "\n" +
      "Customer: " + record.owner + "\n" +
      "Estimated Cost: " + money(record.approximate_cost) + " SAR\n\n" +
      "This will permanently remove eligible related financial records.\n" +
      "This action cannot be undone.\n\n" +
      "Enter the Job Card number to confirm:"
    );

    if (confirmation === null) return;

    if (confirmation.trim() !== record.id) {
      setActionError("Incorrect Job Card confirmation.");
      return;
    }

    deletingRef.current = true;
    setDeletingId(record.id);

    try {

      const response = await fetch("/api/intake/records", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jobId: record.id,
          confirmation: confirmation.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to delete In-Take."
        );
      }

      setRecords((previous) =>
        previous.filter((item) => item.id !== record.id)
      );

      setActionMessage(
        record.id + " permanently deleted successfully."
      );

      setRefresh((value) => value + 1);

    } catch (err) {

      setActionError(
        err.message || "Unable to delete In-Take."
      );

    } finally {

      deletingRef.current = false;
      setDeletingId("");

    }
  }

  const columns = [
    ["Actions", "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A"],
    ["Job Card", "بطاقة العمل"],
    ["In-Take Date", "تاريخ الاستقبال"],
    ["Customer", "العميل"],
    ["Mobile", "رقم الجوال"],
    ["Make / Brand", "ماركة السيارة"],
    ["Model", "موديل السيارة"],
    ["Plate Number", "رقم اللوحة"],
    ["Approx. Cost", "التكلفة التقديرية"],
    ["Status", "الحالة"],
    ["Comments", "الملاحظات"]
  ];

  if (editingRecord) {
    return (
      <WorkshopIntake
        key={editingRecord.id}
        initialRecord={editingRecord}
        setActiveScreen={setActiveScreen}
        onClose={() => setEditingRecord(null)}
        onUpdated={(jobId) => {
          setEditingRecord(null);
          setActionError("");
          setActionMessage(
            jobId + " updated successfully."
          );
          setRefresh((value) => value + 1);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-4">

          <button
            type="button"
            onClick={() => setActiveScreen("workshop-intake")}
            className="rounded-xl border bg-white p-3 shadow-sm"
            title="Back to In-Take"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-3xl font-black">
              In-Take Records
            </h1>
            <h2 lang="ar" className="text-3xl font-bold text-slate-600">
              سجلات استقبال المركبات
            </h2>
          </div>

        </div>

        <button
          type="button"
          onClick={() => setActiveScreen("workshop-intake-new")}
          className="flex items-center gap-3 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          <Plus size={24} />
          <Label en="New In-Take" ar="استقبال جديد" />
        </button>

      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2">

        <div className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm">
          <ClipboardList size={32} className="text-blue-600" />
          <div>
            <Label en="Total In-Take Records" ar="إجمالي سجلات الاستقبال" />
            <div className="mt-2 text-3xl font-black">
              {loading || error ? "-" : filtered.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm">
          <Wallet size={32} className="text-emerald-600" />
          <div>
            <Label en="Total Estimated Cost" ar="إجمالي التكلفة التقديرية" />
            <div className="mt-2 text-3xl font-black text-emerald-700">
              {loading || error ? "-" : money(totalCost)} SAR
            </div>
            <div className="text-sm text-slate-500">
              Excluding VAT / غير شامل الضريبة
            </div>
          </div>
        </div>

      </div>

      <div className="mb-5 rounded-2xl border bg-white p-5 shadow-sm">

        <div className="grid items-end gap-4 lg:grid-cols-4">

          <div>
            <Label en="Search Records" ar="البحث في السجلات" />
            <div className="relative mt-2">
              <Search size={20} className="absolute left-3 top-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Customer, plate, Job Card..."
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <Label en="Date From" ar="من تاريخ" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>

          <div>
            <Label en="Date To" ar="إلى تاريخ" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDateFrom("");
                setDateTo("");
              }}
              className="flex-1 rounded-xl border px-4 py-2 hover:bg-slate-50"
            >
              <Label en="Clear" ar="مسح" />
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setRefresh((value) => value + 1)}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={18} />
              <Label en="Refresh" ar="تحديث" />
            </button>

          </div>

        </div>

        {invalidDates && (
          <p className="mt-3 font-bold text-rose-600">
            Invalid date range / نطاق التاريخ غير صحيح
          </p>
        )}

      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-700"
        >
          {actionError}
        </div>
      )}

      {actionMessage && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-700"
        >
          {actionMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        {loading ? (

          <div className="p-12 text-center font-bold">
            Loading records... / جاري تحميل السجلات
          </div>

        ) : error ? (

          <div className="p-12 text-center font-bold text-rose-600">
            {error}
          </div>

        ) : (

          <>
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-800 text-white">

                  <tr>
                    {columns.map(([en, ar]) => (
                      <th
  key={en}
  className={`whitespace-nowrap px-4 py-4 ${
    en === "Actions"
      ? "sticky left-0 z-20 bg-slate-800 shadow-md"
      : ""
  }`}
>
                        <Label en={en} ar={ar} />
                      </th>
                    ))}
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-200">

                  {visible.map((record) => (

                    <tr key={record.id} className="hover:bg-blue-50">

                      <td className="sticky left-0 z-10 whitespace-nowrap border-r bg-white px-3 py-3 shadow-sm">

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            disabled={Boolean(deletingId)}
                            onClick={() => {
                              setActionError("");
                              setActionMessage("");
                              setEditingRecord(record);
                            }}
                            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 hover:bg-blue-100 disabled:opacity-40"
                          >
                            <Pencil size={18} />
                            <Label
                              en="Edit"
                              ar={"\u062A\u0639\u062F\u064A\u0644"}
                            />
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              disabled={Boolean(deletingId)}
                              onClick={() => handleDelete(record)}
                              className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100 disabled:opacity-40"
                            >
                              <Trash2 size={18} />
                              <Label
                                en={deletingId === record.id ? "Deleting..." : "Delete"}
                                ar={"\u062D\u0630\u0641"}
                              />
                            </button>
                          )}

                        </div>

                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-black text-blue-700">
                        {record.id}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {record.intake_date || "-"}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {record.owner || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {record.phone || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {record.make || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {record.model || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-black">
                        {record.plate || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-bold text-emerald-700">
                        {money(record.approximate_cost)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-block rounded-lg bg-blue-100 px-3 py-2 text-sm font-bold text-blue-800">
                          {record.status || "-"}
                        </span>
                      </td>

                      <td className="min-w-[200px] whitespace-pre-wrap px-4 py-4 text-sm">
                        {record.issue || "-"}
                      </td>

                    </tr>

                  ))}

                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="p-12 text-center text-slate-500">
                        <Label en="No records found" ar="لا توجد سجلات" />
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-slate-50 p-4">

              <div className="font-bold text-slate-600">
                {filtered.length} Records / سجل
              </div>

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="rounded-lg border bg-white p-2 disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="font-bold">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="rounded-lg border bg-white p-2 disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>

              </div>

            </div>
          </>
        )}

      </div>

    </div>
  );
}