"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Upload, FileText, Save } from "lucide-react";

export default function PurchaseEntry({ setActiveScreen }) {
  const today = new Date().toISOString().slice(0, 10);

  const [purchaseDate, setPurchaseDate] = useState(today);
  const [supplier, setSupplier] = useState("");
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [vatRegistrationNumber, setVatRegistrationNumber] = useState("");
  const [invoiceFile, setInvoiceFile] = useState(null);

  const [items, setItems] = useState([
    {
      id: "item-1",
      item: "",
      quantity: 1,
      unitPrice: "",
      discount: 0,
    },
  ]);

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: `item-${current.length + 1}-${Math.random().toString(36).slice(2)}`,
        item: "",
        quantity: 1,
        unitPrice: "",
        discount: 0,
      },
    ]);
  };

  const removeItem = (id) => {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((item) => item.id !== id);
    });
  };

  const updateItem = (id, field, value) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const calculateItemTotal = (item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;

    return Math.max(quantity * unitPrice - discount, 0);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0,
  );

  const vat = subtotal * 0.15;

  const grandTotal = subtotal + vat;

  const handleUploadInvoice = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setInvoiceFile(file);
    }
  };

  const handleSavePurchase = async () => {
    if (!supplier.trim()) {
      alert("Please enter the supplier / vendor name.");
      return;
    }

    if (items.some((item) => !item.item.trim())) {
      alert("Please enter the item / part name for all purchase items.");
      return;
    }

    const purchaseNo = `PUR-${purchaseDate.replaceAll("-", "")}-${supplierInvoiceNo || "ENTRY"}`;

    const formData = new FormData();

    formData.append("purchaseNo", purchaseNo);
    formData.append("purchaseDate", purchaseDate);
    formData.append("supplier", supplier);
    formData.append("supplierInvoiceNo", supplierInvoiceNo);
    formData.append("vatRegistrationNumber", vatRegistrationNumber);
    formData.append("paymentMethod", paymentMethod);
    formData.append("paymentStatus", paymentStatus);

    formData.append(
      "items",
      JSON.stringify(
        items.map((item) => ({
          item: item.item,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          discount: Number(item.discount) || 0,
          total: calculateItemTotal(item),
        })),
      ),
    );

    formData.append("subtotal", String(subtotal));
    formData.append("vatAmount", String(vat));
    formData.append("grandTotal", String(grandTotal));

    if (invoiceFile) {
      formData.append("invoiceFile", invoiceFile);
    }

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to save purchase");
      }

      console.log("Purchase saved:", result);
      alert("Purchase saved successfully.");
    } catch (error) {
      console.error("Purchase save error:", error);
      alert(error.message || "Failed to save purchase.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <button
            type="button"
            onClick={() => setActiveScreen("accounts")}
            className="
      inline-flex
      items-center
      gap-2
      rounded-xl
      border
      border-slate-200
      bg-white
      px-4
      py-2.5
      text-sm
      font-bold
      text-slate-700
      shadow-sm
      transition
      hover:bg-slate-50
    "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Accounts
          </button>

          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Purchase Entry
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Record workshop purchases and supplier invoices.
            </p>
          </div>
        </div>

        {/* Purchase Information */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Purchase Information
              </h2>

              <p className="text-sm font-medium text-slate-500">
                Enter supplier and purchase invoice details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Purchase Date */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Purchase Date
              </label>

              <input
                type="date"
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Supplier / Vendor
              </label>

              <input
                type="text"
                value={supplier}
                onChange={(event) => setSupplier(event.target.value)}
                placeholder="Enter supplier name"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />
            </div>

            {/* Supplier Invoice */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Supplier Invoice No.
              </label>

              <input
                type="text"
                value={supplierInvoiceNo}
                onChange={(event) => setSupplierInvoiceNo(event.target.value)}
                placeholder="Enter invoice number"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              >
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Card</option>
                <option>Credit</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Payment Status
              </label>

              <select
                value={paymentStatus}
                onChange={(event) => setPaymentStatus(event.target.value)}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              >
                <option>Paid</option>
                <option>Unpaid</option>
                <option>Partial</option>
              </select>
            </div>

            {/* VAT Registration Number */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                VAT Registration Number
              </label>

              <input
                type="text"
                inputMode="numeric"
                value={vatRegistrationNumber}
                onChange={(event) =>
                  setVatRegistrationNumber(
                    event.target.value.replace(/\D/g, ""),
                  )
                }
                placeholder="Enter VAT registration number"
                className="
      w-full
      rounded-xl
      border
      border-slate-200
      bg-white
      px-4
      py-3
      text-sm
      font-semibold
      text-slate-700
      outline-none
      placeholder:text-slate-400
      focus:border-blue-500
      focus:ring-2
      focus:ring-blue-100
    "
              />
            </div>
          </div>
        </div>

        {/* Purchase Items */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Purchase Items
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Add the parts or materials purchased.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-blue-600
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-blue-700
              "
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-600">
                    #
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-600">
                    Item / Part
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-600">
                    Quantity
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-600">
                    Unit Price
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-600">
                    Discount
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-600">
                    Total
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-5 py-4 text-sm font-bold text-slate-600">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(event) =>
                          updateItem(item.id, "item", event.target.value)
                        }
                        placeholder="Part / material name"
                        className="
                          w-full
                          rounded-lg
                          border
                          border-slate-200
                          px-3
                          py-2.5
                          text-sm
                          font-semibold
                          outline-none
                          focus:border-blue-500
                        "
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(item.id, "quantity", event.target.value)
                        }
                        className="
                          w-24
                          rounded-lg
                          border
                          border-slate-200
                          px-3
                          py-2.5
                          text-sm
                          font-semibold
                          outline-none
                          focus:border-blue-500
                        "
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) =>
                          updateItem(item.id, "unitPrice", event.target.value)
                        }
                        placeholder="0.00"
                        className="
                          w-32
                          rounded-lg
                          border
                          border-slate-200
                          px-3
                          py-2.5
                          text-sm
                          font-semibold
                          outline-none
                          focus:border-blue-500
                        "
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount}
                        onChange={(event) =>
                          updateItem(item.id, "discount", event.target.value)
                        }
                        className="
                          w-28
                          rounded-lg
                          border
                          border-slate-200
                          px-3
                          py-2.5
                          text-sm
                          font-semibold
                          outline-none
                          focus:border-blue-500
                        "
                      />
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-black text-slate-900">
                      ⃁{calculateItemTotal(item).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="
                          inline-flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-red-200
                          text-red-500
                          transition
                          hover:bg-red-50
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Upload Invoice */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-black text-slate-900">
              Purchase Invoice
            </h2>

            <p className="mb-5 text-sm font-medium text-slate-500">
              Upload the supplier invoice for this purchase.
            </p>

            <label
              className="
                flex
                min-h-[130px]
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-xl
                border-2
                border-dashed
                border-slate-300
                bg-slate-50
                px-6
                py-5
                text-center
                transition
                hover:border-blue-400
                hover:bg-blue-50
              "
            >
              <Upload className="mb-3 h-7 w-7 text-blue-600" />

              <span className="text-sm font-bold text-slate-700">
                {invoiceFile ? invoiceFile.name : "Upload Purchase Invoice"}
              </span>

              <span className="mt-1 text-xs font-medium text-slate-400">
                PDF, JPG, PNG
              </span>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleUploadInvoice}
                className="hidden"
              />
            </label>
          </div>

          {/* Totals */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black text-slate-900">
              Purchase Summary
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                  Subtotal
                </span>

                <span className="text-sm font-bold text-slate-800">
                  ⃁{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                  VAT 15%
                </span>

                <span className="text-sm font-bold text-slate-800">
                  ⃁{vat.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">
                    Grand Total
                  </span>

                  <span className="text-2xl font-black text-blue-600">
                    ⃁{grandTotal.toFixed(2)}
                  </span>
                </div>

                <p className="mt-1 text-right text-xs font-semibold text-slate-400">
                  Including VAT
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => setActiveScreen("accounts")}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              py-3
              text-sm
              font-bold
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSavePurchase}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-6
              py-3
              text-sm
              font-black
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
            "
          >
            <Save className="h-4 w-4" />
            Save Purchase
          </button>
        </div>
      </main>
    </div>
  );
}
