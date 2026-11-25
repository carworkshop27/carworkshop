"use client";

import {
  ArrowLeft,
  Users,
  UserPlus,
  Save,
  Search,
  Pencil,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import CustomerStatement from "../accounts/CustomerStatement";

const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const emptyForm = () => ({
  registration_date: today(),
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "Saudi Arabia",
  customer_vat: "",
});

function Bilingual({ en, ar }) {
  return (
    <div>
      <div className="text-base font-bold">{en}</div>
      <div lang="ar" dir="rtl" className="text-xl font-bold">
        {ar}
      </div>
    </div>
  );
}

export default function CustomerRecords({ setActiveScreen }) {
  // WORKSHOP_CUSTOMER_EDIT_UI_V1
  const [tab, setTab] = useState("records");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/crm/customers?permission=edit", {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => {
        if (active) setCanEdit(data?.canEdit === true);
      })
      .catch(() => {
        if (active) setCanEdit(false);
      });

    return () => {
      active = false;
    };
  }, []);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  const savingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCustomers() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/crm/customers", {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
          throw new Error(
            data?.error || "Failed to load customers."
          );
        }

        if (!controller.signal.aborted) {
          setRecords(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadCustomers();

    return () => controller.abort();
  }, [refresh]);

  const changeTab = (nextTab) => {
    if (savingRef.current) return;

    setError("");
    setMessage("");
    setEditingCustomer(null);
    setForm(emptyForm());
    setTab(nextTab);

    if (nextTab === "records") {
      setRefresh((value) => value + 1);
    }
  };

  const updateField = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openEditCustomer = (record) => {
    if (savingRef.current || !canEdit) return;

    setError("");
    setMessage("");
    setEditingCustomer(record);

    setForm({
      registration_date: record.registration_date || today(),
      first_name: record.first_name || "",
      last_name: record.last_name || "",
      phone: record.phone || "",
      email: record.email || "",
      address: record.address || "",
      city: record.city || "",
      country: record.country || "",
      customer_vat: record.customer_vat || "",
    });

    setTab("edit");
  };

  const registerCustomer = async (event) => {
    event.preventDefault();

    if (savingRef.current) return;

    setError("");
    setMessage("");

    if (
      !form.first_name.trim() ||
      (!editingCustomer && !form.phone.trim())
    ) {
      setError("First name and mobile number are required.");
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const response = await fetch("/api/crm/customers", {
        method: editingCustomer ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingCustomer
            ? { ...form, id: editingCustomer.id }
            : form
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Customer registration failed."
        );
      }

      setForm(emptyForm());
      setEditingCustomer(null);
      setSearchTerm("");
      setTab("records");

      setMessage(
        `Customer ${data.customer_number || ""} ${
          editingCustomer ? "updated" : "registered"
        } successfully.`
      );

      setRefresh((value) => value + 1);

    } catch (err) {
      setError(err.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const search = searchTerm.trim().toLowerCase();

  const filteredRecords = records.filter((record) => {
    const values = [
      record.customer_number,
      record.registration_date,
      record.first_name,
      record.last_name,
      `${record.first_name || ""} ${record.last_name || ""}`,
      record.phone,
      record.email,
      record.address,
      record.city,
      record.country,
      record.customer_vat,
    ];

    return values.some((value) =>
      String(value || "").toLowerCase().includes(search)
    );
  });

  const fields = [
    {
      name: "registration_date",
      en: "Date of Registration",
      ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u062a\u0633\u062c\u064a\u0644",
      type: "date",
      required: true,
    },
    {
      name: "first_name",
      en: "First Name",
      ar: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0644",
      required: true,
    },
    {
      name: "last_name",
      en: "Last Name",
      ar: "\u0627\u0633\u0645 \u0627\u0644\u0639\u0627\u0626\u0644\u0629",
    },
    {
      name: "phone",
      en: "Mobile Number",
      ar: "\u0631\u0642\u0645 \u0627\u0644\u062c\u0648\u0627\u0644",
      type: "tel",
      required: true,
    },
    {
      name: "email",
      en: "Email",
      ar: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
      type: "email",
    },
    {
      name: "address",
      en: "Address",
      ar: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646",
    },
    {
      name: "city",
      en: "City",
      ar: "\u0627\u0644\u0645\u062f\u064a\u0646\u0629",
    },
    {
      name: "country",
      en: "Country",
      ar: "\u0627\u0644\u062f\u0648\u0644\u0629",
    },
    {
      name: "customer_vat",
      en: "VAT Number",
      ar: "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0636\u0631\u064a\u0628\u064a",
    },
  ];

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveScreen("desktop")}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <h1 className="text-3xl font-black text-slate-900">
            Customers
          </h1>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => changeTab("records")}
            className={`flex items-center gap-3 rounded-xl px-6 py-3 shadow-sm ${
              tab === "records"
                ? "bg-violet-600 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            <Users size={26} />

            <Bilingual
              en="Customer Records"
              ar={"\u0633\u062c\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621"}
            />
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => changeTab("registration")}
            className={`flex items-center gap-3 rounded-xl px-6 py-3 shadow-sm ${
              tab === "registration"
                ? "bg-violet-600 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            <UserPlus size={26} />

            <Bilingual
              en="New Customer Registration"
              ar={"\u062a\u0633\u062c\u064a\u0644 \u0639\u0645\u064a\u0644 \u062c\u062f\u064a\u062f"}
            />
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => changeTab("statement")}
            className={`flex items-center gap-3 rounded-xl px-6 py-3 shadow-sm ${
              tab === "statement"
                ? "bg-violet-600 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            <Bilingual
              en="Customer Statement"
              ar={"\u0643\u0634\u0641 \u062d\u0633\u0627\u0628 \u0627\u0644\u0639\u0645\u064a\u0644"}
            />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 font-bold text-green-700">
            {message}
          </div>
        )}

        {tab === "records" ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex w-full max-w-lg items-center gap-3 rounded-xl border border-slate-300 bg-white px-4">
                <Search size={20} className="text-slate-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search customer number, name or mobile..."
                  className="w-full bg-transparent py-3 outline-none"
                />
              </div>

              <div className="rounded-xl bg-white px-5 py-3 font-bold text-slate-700 shadow-sm">
                Total Customers: {records.length}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              {isLoading ? (
                <div className="p-10 text-center text-slate-500">
                  Loading customer records...
                </div>
              ) : (
                <table className="w-full min-w-[1100px] border-collapse text-left">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      {[
                        ...(canEdit ? ["Action"] : []),
                        "Customer Number",
                        "Registration Date",
                        "Customer Name",
                        "Mobile Number",
                        "Email",
                        "Address",
                        "City",
                        "Country",
                        "VAT Number",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="whitespace-nowrap px-4 py-4 text-sm font-bold"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="border-t border-slate-200 hover:bg-violet-50"
                      >
                        {canEdit && (
                          <td className="sticky left-0 bg-white px-4 py-4">
                            <button
                              type="button"
                              onClick={() => openEditCustomer(record)}
                              className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700 hover:bg-violet-100"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>
                          </td>
                        )}

                        <td className="whitespace-nowrap px-4 py-4 font-black text-violet-700">
                          {record.customer_number || "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {record.registration_date || "-"}
                        </td>

                        <td className="px-4 py-4 font-bold">
                          {[record.first_name, record.last_name]
                            .filter(Boolean)
                            .join(" ") || "-"}
                        </td>

                        {[
                          record.phone,
                          record.email,
                          record.address,
                          record.city,
                          record.country,
                          record.customer_vat,
                        ].map((value, index) => (
                          <td
                            key={index}
                            className="px-4 py-4 text-sm text-slate-700"
                          >
                            {value || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {filteredRecords.length === 0 && (
                      <tr>
                        <td
                          colSpan={canEdit ? 10 : 9}
                          className="p-10 text-center text-slate-500"
                        >
                          No customer records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : tab === "statement" ? (
          <CustomerStatement
            embedded={true}
            setActiveScreen={setActiveScreen}
          />
        ) : (
          <form
            onSubmit={registerCustomer}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900">
                {editingCustomer
                  ? "Edit Customer"
                  : "New Customer Registration"}
              </h2>
            </div>

            <fieldset disabled={saving}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

                <div>
                  <Bilingual
                    en="Customer Number"
                    ar={"\u0631\u0642\u0645 \u0627\u0644\u0639\u0645\u064a\u0644"}
                  />

                  <input
                    readOnly
                    value={
                      editingCustomer
                        ? editingCustomer.customer_number
                        : "Automatically generated"
                    }
                    className={`${inputClass} bg-slate-100`}
                  />
                </div>

                {fields.map((field) => (
                  <label key={field.name} className="block text-slate-800">
                    <Bilingual
                      en={`${field.en}${
                        field.required &&
                        !(editingCustomer && field.name === "phone")
                          ? " *"
                          : ""
                      }`}
                      ar={field.ar}
                    />

                    <input
                      type={field.type || "text"}
                      value={form[field.name]}
                      required={
                        Boolean(field.required) &&
                        !(editingCustomer && field.name === "phone")
                      }
                      onChange={(event) =>
                        updateField(field.name, event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={() => changeTab("records")}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-3 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  <Save size={22} />

                  <Bilingual
                    en={
                      saving
                        ? "Saving..."
                        : editingCustomer
                          ? "Save Changes"
                          : "Register Customer"
                    }
                    ar={
                      editingCustomer
                        ? "\u062d\u0641\u0638 \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a"
                        : "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0639\u0645\u064a\u0644"
                    }
                  />
                </button>
              </div>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  );
}