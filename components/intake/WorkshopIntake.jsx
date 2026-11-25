"use client";

import React, {
  useState,
  useEffect,
  useRef
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  Search,
  Save,
  User,
  Wallet,
  FileText,
  X
} from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function today() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const get = (type) =>
    parts.find((part) => part.type === type)?.value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function customerLabel(customer) {
  return [
    customer.first_name,
    customer.last_name
  ].filter(Boolean).join(" ");
}

const arabicLabels = {
  "Edit In-Take": "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644",
  "Update In-Take": "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644",
  "Ready to update In-Take": "\u062C\u0627\u0647\u0632 \u0644\u0644\u062A\u062D\u062F\u064A\u062B",
  "The existing Job Card will be updated.": "\u0633\u064A\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u062D\u0627\u0644\u064A\u0629",
  "In-Take": "استقبال المركبات",
  "In-Take Date": "تاريخ الاستقبال",
  "Customer Information": "معلومات العميل",
  "Select or register a customer": "اختيار أو تسجيل عميل",
  "Existing Customer": "عميل حالي",
  "New Customer": "عميل جديد",
  "Select Customer": "اختر العميل",
  "Customer Name": "اسم العميل",
  "Customer Mobile": "رقم جوال العميل",
  "Vehicle Information": "معلومات المركبة",
  "Vehicle plate identification": "بيانات المركبة ولوحة التسجيل",
  "Car Make / Brand": "ماركة السيارة",
  "Model": "موديل السيارة",
  "Plate Letters": "حروف اللوحة",
  "Plate Numbers": "أرقام اللوحة",
  "Approximate Cost": "التكلفة التقديرية",
  "Initial estimated workshop charges": "التكلفة الأولية المقدرة لأعمال الورشة",
  "Estimated Amount": "المبلغ التقديري",
  "Comments / Notes": "التعليقات / الملاحظات",
  "Back": "رجوع",
  "Cancel": "إلغاء",
  "Save In-Take": "حفظ الاستقبال",
  "Saving...": "جاري الحفظ...",
  "Ready to save In-Take": "جاهز لحفظ الاستقبال",
  "A Job Card will be created automatically.": "سيتم إنشاء بطاقة العمل تلقائياً",
  "In-Take Saved Successfully": "تم حفظ الاستقبال بنجاح",
  "Job Card Number": "رقم بطاقة العمل",
  "Job Card and applicable customer ledger entry created.": "تم إنشاء بطاقة العمل وقيد حساب العميل عند الاقتضاء",
  "New In-Take": "استقبال جديد",
  "Back to In-Take": "العودة إلى استقبال المركبات"
};

function Bilingual({ value, small = false }) {
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span className={small ? "text-base font-medium" : "text-lg font-bold"}>{value}</span>
      {arabicLabels[value] && (
        <span
          lang="ar"
          dir="rtl"
          className={small
            ? "text-base font-bold leading-relaxed"
            : "text-2xl font-bold leading-relaxed"}
        >
          {arabicLabels[value]}
        </span>
      )}
    </span>
  );
}

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 rounded-t-2xl border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-900">
            <Bilingual value={title} />
          </h2>

          {subtitle && (
            <p className="text-sm font-medium text-slate-500">
              <Bilingual value={subtitle} small />
            </p>
          )}
        </div>
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

function Field({ label, children, required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        <Bilingual value={label} />
        {required && (
          <span className="ml-1 text-rose-600">*</span>
        )}
      </span>

      {children}
    </label>
  );
}

export default function WorkshopIntake({
  setActiveScreen,
  initialRecord = null,
  onClose = null,
  onUpdated = null
}) {
  // WORKSHOP_INTAKE_EDIT_MODE_V1

  const isEditing = Boolean(initialRecord?.id);

  const initialPlate = String(
    initialRecord?.plate || ""
  ).trim().match(/^(.*?)\s+([0-9]+)$/);

  function closeForm() {
    if (isEditing && onClose) {
      onClose();
    } else {
      setActiveScreen("workshop-intake");
    }
  }
  const [intakeDate, setIntakeDate] = useState(() => initialRecord?.intake_date || today());
  const [customerType, setCustomerType] = useState("existing");

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(initialRecord?.customer_id || "");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [make, setMake] = useState(initialRecord?.make || "");
  const [model, setModel] = useState(initialRecord?.model || "");
  const [plateLetters, setPlateLetters] = useState(initialPlate?.[1] || "");
  const [plateNumbers, setPlateNumbers] = useState(initialPlate?.[2] || "");
  const [approximateCost, setApproximateCost] = useState(initialRecord?.approximate_cost == null ? "" : String(initialRecord.approximate_cost));
  const [notes, setNotes] = useState(initialRecord?.issue || "");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedJobId, setSavedJobId] = useState("");

  const dropdownRef = useRef(null);
  const requestIdRef = useRef(null);
  const submittedPayloadRef = useRef(null);
  const savingRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadCustomers() {
      try {
        const response = await fetch("/api/intake", {
          cache: "no-store"
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load customers."
          );
        }

        if (active) {
          setCustomers(data.customers || []);
        }
      } catch (err) {
        if (active) {
          setLoadError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const selectedCustomer = customers.find(
    (customer) => customer.id === customerId
  );

  const filteredCustomers = customers.filter((customer) => {
    const value = [
      customerLabel(customer),
      customer.phone || ""
    ].join(" ").toLowerCase();

    return value.includes(search.trim().toLowerCase());
  });

  function resetForm() {
    setIntakeDate(today());
    setCustomerType("existing");
    setCustomerId("");
    setCustomerName("");
    setPhone("");
    setSearch("");
    setDropdownOpen(false);
    setMake("");
    setModel("");
    setPlateLetters("");
    setPlateNumbers("");
    setApproximateCost("");
    setNotes("");
    setError("");
    setSavedJobId("");

    requestIdRef.current = null;
    submittedPayloadRef.current = null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (savingRef.current || savedJobId) {
      return;
    }

    setError("");

    if (customerType === "existing" && !customerId) {
      setError("Please select an existing customer. يرجى اختيار العميل.");
      return;
    }

    if (
      customerType === "new" &&
      (!customerName.trim() || !phone.trim())
    ) {
      setError("Customer name and mobile are required. اسم العميل ورقم الجوال مطلوبان.");
      return;
    }

    if (
      !plateLetters.trim() ||
      !plateNumbers.trim()
    ) {
      setError("Please enter the complete vehicle plate. يرجى إدخال حروف وأرقام اللوحة.");
      return;
    }

    if (
      approximateCost.trim() === "" ||
      !Number.isFinite(Number(approximateCost)) ||
      Number(approximateCost) < 0
    ) {
      setError("Please enter a valid approximate cost. يرجى إدخال تكلفة تقديرية صحيحة.");
      return;
    }

    if (!make.trim()) {
      setError("Car Make / Brand is required. ماركة السيارة مطلوبة.");
      return;
    }

    if (!model.trim()) {
      setError("Vehicle Model is required. موديل السيارة مطلوب.");
      return;
    }

    const payload = {
      make: make.trim(),
      model: model.trim(),
      customerType,
      customerId:
        customerType === "existing" ? customerId : null,
      customerName:
        customerType === "new" ? customerName.trim() : "",
      phone:
        customerType === "new" ? phone.trim() : "",
      plate: `${plateLetters.trim()} ${plateNumbers.trim()}`,
      approximateCost,
      notes: notes.trim(),
      intakeDate
    };

    if (isEditing) {

      if (loading || loadError || !selectedCustomer) {
        setError("Please select a valid existing customer.");
        return;
      }

      savingRef.current = true;
      setSaving(true);

      let updated = false;

      try {

        const response = await fetch("/api/intake/records", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...payload,
            jobId: initialRecord.id
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to update In-Take."
          );
        }

        updated = true;

      } catch (err) {

        setError(
          err.message || "Unable to update In-Take."
        );

      } finally {

        savingRef.current = false;
        setSaving(false);

      }

      if (updated) {
        if (onUpdated) {
          onUpdated(initialRecord.id);
        } else {
          closeForm();
        }
      }

      return;
    }

    const serializedPayload = JSON.stringify(payload);

    if (
      submittedPayloadRef.current &&
      submittedPayloadRef.current !== serializedPayload
    ) {
      setError(
        "A previous submission may have been saved. Restore the original details and retry before starting another In-Take."
      );
      return;
    }

    if (!requestIdRef.current) {
      requestIdRef.current = crypto.randomUUID();
    }

    submittedPayloadRef.current = serializedPayload;
    savingRef.current = true;
    setSaving(true);

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...payload,
          requestId: requestIdRef.current
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status >= 400 && response.status < 500) {
          requestIdRef.current = null;
          submittedPayloadRef.current = null;
        }

        throw new Error(
          data.error || "Unable to save In-Take."
        );
      }

      setSavedJobId(data.jobId);

      try {
        const refreshed = await fetch("/api/intake", {
          cache: "no-store"
        });

        if (refreshed.ok) {
          const result = await refreshed.json();
          setCustomers(result.customers || []);
        }
      } catch {
        // In-Take was already saved successfully.
      }

    } catch (err) {
      setError(err.message || "Unable to save In-Take.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">

          <button
            type="button"
            disabled={saving}
            onClick={closeForm}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <Bilingual value="Back" />
          </button>

          <h1 className="text-xl font-black tracking-tight text-slate-950">
            <Bilingual value={isEditing ? "Edit In-Take" : "In-Take"} />
            {isEditing && (
              <span className="ml-4 rounded-lg bg-blue-100 px-4 py-2 text-lg font-black text-blue-800">
                {initialRecord.id}
              </span>
            )}
          </h1>

        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {savedJobId ? (
          <section className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">

            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />

            <h2 className="mt-4 text-2xl font-black text-emerald-700">
              <Bilingual value="In-Take Saved Successfully" />
            </h2>

            <p className="mt-3 text-sm font-bold text-slate-500">
              <Bilingual value="Job Card Number" />
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {savedJobId}
            </p>

            <p className="mt-3 text-sm text-slate-600">
              <Bilingual value="Job Card and applicable customer ledger entry created." />
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-700"
              >
                <Bilingual value="New In-Take" />
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                <Bilingual value="Back to In-Take" />
              </button>

            </div>
          </section>
        ) : (

          <form onSubmit={handleSubmit} className="space-y-5">

            <fieldset disabled={saving} className="space-y-5">

              <Section
                icon={CalendarDays}
                title="In-Take Date"
              >
                <div className="max-w-xs">
                  <input
                    aria-label="In-Take Date"
                    type="date"
                    required
                    value={intakeDate}
                    onChange={(e) => setIntakeDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </Section>

              <Section
                icon={User}
                title="Customer Information"
                subtitle="Select or register a customer"
              >

                <div className="mb-5 flex flex-wrap gap-6">

                  {[
                    ["existing", "Existing Customer"],
                    ["new", "New Customer"]
                  ].filter(([value]) => !isEditing || value === "existing").map(([value, label]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-2 text-sm font-black text-slate-700"
                    >
                      <input
                        type="radio"
                        name="customerType"
                        value={value}
                        checked={customerType === value}
                        onChange={() => {
                          setCustomerType(value);
                          setDropdownOpen(false);
                          setError("");
                        }}
                        className="h-4 w-4 accent-blue-600"
                      />

                      <Bilingual value={label} />
                    </label>
                  ))}

                </div>

                {customerType === "existing" ? (

                  <div className="grid gap-4 md:grid-cols-2">

                    <div ref={dropdownRef} className="relative">

                      <p className="mb-2 text-sm font-black text-slate-700">
                        <Bilingual value="Select Customer" />
                        <span className="ml-1 text-rose-600">*</span>
                      </p>

                      <button
                        type="button"
                        disabled={loading || Boolean(loadError)}
                        onClick={() => {
                          setSearch("");
                          setDropdownOpen(!dropdownOpen);
                        }}
                        className={`${inputClass} flex items-center justify-between gap-3 text-left`}
                      >

                        <span className="truncate">
                          {loading
                            ? "Loading customers... / جاري تحميل العملاء..."
                            : selectedCustomer
                              ? customerLabel(selectedCustomer)
                              : "Select existing customer / اختر العميل"}
                        </span>

                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />

                      </button>

                      {loadError && (
                        <p className="mt-2 text-sm text-rose-600">
                          {loadError}
                        </p>
                      )}

                      {dropdownOpen && (

                        <div className="absolute left-0 right-0 z-30 mt-2 rounded-xl border border-slate-200 bg-white shadow-xl">

                          <div className="flex items-center gap-2 border-b border-slate-200 p-3">

                            <Search className="h-4 w-4 text-slate-400" />

                            <input
                              autoFocus
                              aria-label="Search customers"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Search name or mobile / البحث بالاسم أو الجوال"
                              className="w-full text-sm outline-none"
                            />

                          </div>

                          <div className="max-h-64 overflow-y-auto">

                            {filteredCustomers.map((customer) => (

                              <button
                                key={customer.id}
                                type="button"
                                onClick={() => {
                                  setCustomerId(customer.id);
                                  setDropdownOpen(false);
                                  setSearch("");
                                }}
                                className={`block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-blue-50 ${
                                  customerId === customer.id
                                    ? "bg-blue-50"
                                    : ""
                                }`}
                              >

                                <p className="text-sm font-black text-slate-900">
                                  {customerLabel(customer)}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {customer.phone || "No mobile number / لا يوجد رقم جوال"}
                                </p>

                              </button>

                            ))}

                            {filteredCustomers.length === 0 && (
                              <p className="p-4 text-sm text-slate-500">
                                No matching customers. / لا يوجد عملاء مطابقون
                              </p>
                            )}

                          </div>

                        </div>

                      )}

                    </div>

                    <Field label="Customer Mobile">
                      <input
                        readOnly
                        value={selectedCustomer?.phone || ""}
                        className={`${inputClass} bg-slate-50`}
                      />
                    </Field>

                  </div>

                ) : (

                  <div className="grid gap-4 md:grid-cols-2">

                    <Field label="Customer Name" required>
                      <input
                        required
                        maxLength={200}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name / أدخل اسم العميل"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Customer Mobile" required>
                      <input
                        type="tel"
                        required
                        maxLength={30}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XXXXXXXX"
                        className={inputClass}
                      />
                    </Field>

                  </div>

                )}

              </Section>

              <Section
                icon={Car}
                title="Vehicle Information"
                subtitle="Vehicle plate identification"
              >

                <div className="grid gap-4 md:grid-cols-2">

                  <Field label="Car Make / Brand" required>
                    <input
                      required
                      maxLength={100}
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      placeholder="e.g. Toyota / تويوتا"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Model" required>
                    <input
                      required
                      maxLength={100}
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Camry / كامري"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Plate Letters" required>
                    <input
                      required
                      maxLength={10}
                      value={plateLetters}
                      onChange={(e) =>
                        setPlateLetters(
                          e.target.value
                            .replace(/[^\p{L}\s]/gu, "")
                            .toUpperCase()
                        )
                      }
                      placeholder="ABC"
                      className={`${inputClass} font-mono`}
                    />
                  </Field>

                  <Field label="Plate Numbers" required>
                    <input
                      required
                      inputMode="numeric"
                      maxLength={10}
                      value={plateNumbers}
                      onChange={(e) =>
                        setPlateNumbers(
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      placeholder="1234"
                      className={`${inputClass} font-mono`}
                    />
                  </Field>

                </div>

              </Section>

              <Section
                icon={Wallet}
                title="Approximate Cost"
                subtitle="Initial estimated workshop charges"
              >

                <div className="max-w-md">

                  <Field label="Estimated Amount" required>

                    <div className="relative">

                      <input
                        type="number"
                        required
                        min="0"
                        max="999999999999.99"
                        step="0.01"
                        value={approximateCost}
                        onChange={(e) => setApproximateCost(e.target.value)}
                        placeholder="0.00"
                        className={`${inputClass} pr-16`}
                      />

                      <span className="absolute right-4 top-3 text-sm font-black text-slate-500">
                        SAR
                      </span>

                    </div>

                  </Field>

                </div>

              </Section>

              <Section
                icon={FileText}
                title="Comments / Notes"
              >

                <textarea
                  aria-label="Comments or Notes"
                  rows={4}
                  maxLength={5000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter comments / أدخل متطلبات العميل أو الملاحظات"
                  className={`${inputClass} resize-y`}
                />

              </Section>

            </fieldset>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700"
              >
                {error}
              </div>
            )}

            <section className="sticky bottom-0 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      <Bilingual value={isEditing ? "Ready to update In-Take" : "Ready to save In-Take"} />
                    </p>

                    <p className="text-xs font-medium text-slate-500">
                      <Bilingual value={isEditing ? "The existing Job Card will be updated." : "A Job Card will be created automatically."} />
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <button
                    type="button"
                    disabled={saving}
                    onClick={closeForm}
                    className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    <Bilingual value="Cancel" />
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-black text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />

                    <Bilingual value={saving ? "Saving..." : isEditing ? "Update In-Take" : "Save In-Take"} />
                  </button>

                </div>

              </div>

            </section>

          </form>

        )}

      </main>

    </div>
  );
}
