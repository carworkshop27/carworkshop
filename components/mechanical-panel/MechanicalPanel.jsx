"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Check } from "lucide-react";

export default function MechanicalPanel({ onConfirmItem, onItemsChange }) {
  const [items, setItems] = useState([
    {
      id: 1,
      itemNo: "",
      partName: "",
      description: "",
      cost: "",
      confirmed: false,
    },
  ]);

  const [activeItemId, setActiveItemId] = useState(1);
  const [showPartList, setShowPartList] = useState(false);

  const [partNameOptions, setPartNameOptions] = useState([]);
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [newPartName, setNewPartName] = useState("");
  const [isAddingPart, setIsAddingPart] = useState(false);

  useEffect(() => {
    const loadParts = async () => {
      const { data, error } = await supabase
        .from("mechanical_parts")
        .select("id, part_name")
        .eq("is_active", true)
        .order("part_name", { ascending: true });

      if (error) {
        console.error("Failed to load mechanical parts:", error);
        return;
      }

      setPartNameOptions(data || []);
    };

    loadParts();
  }, []);

  const handleChange = (id, field, value) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value, confirmed: false } : item,
    );

    setItems(updatedItems);
    onItemsChange?.(updatedItems);
  };

  const handleConfirmItem = (item) => {
    if (!item.partName.trim() || !item.description.trim() || item.cost === "") {
      alert("Please complete the current row before confirming.");
      return;
    }

    const confirmedItem = {
      ...item,
      confirmed: true,
      cost: Number(item.cost) || 0,
    };

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id ? confirmedItem : currentItem,
      ),
    );

    onConfirmItem?.(confirmedItem);
  };

  const handleAddNew = () => {
    const lastItem = items[items.length - 1];

    if (
      !lastItem.partName.trim() ||
      !lastItem.description.trim() ||
      lastItem.cost === ""
    ) {
      alert("Please complete the current row before adding a new one.");
      return;
    }

    const newId = Date.now();

    const newItem = {
      id: newId,
      itemNo: "",
      partName: "",
      description: "",
      cost: "",
      confirmed: false,
    };

    const updatedItems = [...items, newItem];

    setItems(updatedItems);
    onItemsChange?.(updatedItems);

    setActiveItemId(newId);
    setShowPartList(false);
  };

  const handleDeleteRow = (id) => {
    if (items.length === 1) {
      alert("At least one inspection row must remain.");
      return;
    }

    const updatedItems = items.filter((item) => item.id !== id);

    setItems(updatedItems);
    onItemsChange?.(updatedItems);

    if (activeItemId === id) {
      const remainingItem = items.find((item) => item.id !== id);

      if (remainingItem) {
        setActiveItemId(remainingItem.id);
      }
    }
  };

  const handleSelectPartName = (partName) => {
    handleChange(activeItemId, "partName", partName);
    setShowPartList(false);
  };

  const handleDeletePart = async (partId, partName) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${partName}"?`,
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("mechanical_parts")
      .update({ is_active: false })
      .eq("id", partId);

    if (error) {
      console.error("Failed to remove mechanical part:", error);
      alert("Failed to remove the part.");
      return;
    }

    setPartNameOptions((currentParts) =>
      currentParts.filter((part) => part.id !== partId),
    );

    // Clear this part from any current inspection rows using it
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.partName === partName ? { ...item, partName: "" } : item,
      ),
    );

    setShowPartList(false);
  };

  const handleAddPart = async () => {
    const trimmedName = newPartName.trim();

    if (!trimmedName) {
      alert("Please enter a part name.");
      return;
    }

    if (
      partNameOptions.some(
        (part) => part.part_name.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      alert("This part already exists.");
      return;
    }

    setIsAddingPart(true);

    const { data, error } = await supabase
      .from("mechanical_parts")
      .insert([
        {
          part_name: trimmedName,
          is_active: true,
        },
      ])
      .select("id, part_name")
      .single();

    setIsAddingPart(false);

    if (error) {
      console.error("Failed to add mechanical part:", error);

      alert(
        `Failed to add the new part.\n\n` +
          `Message: ${error.message}\n` +
          `Code: ${error.code || "N/A"}\n` +
          `Details: ${error.details || "N/A"}\n` +
          `Hint: ${error.hint || "N/A"}`,
      );

      return;
    }

    setPartNameOptions((currentParts) =>
      [...currentParts, data].sort((a, b) =>
        a.part_name.localeCompare(b.part_name),
      ),
    );

    setNewPartName("");
    setShowAddPartModal(false);
  };

  const totalCost = items.reduce(
    (total, item) => total + (Number(item.cost) || 0),
    0,
  );

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-visible">
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Mechanical Panel</h2>

        <p className="mt-1 text-sm text-slate-500">
          Mechanical inspection items and repair costs
        </p>
      </div>

      <div className="p-5 space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative rounded-xl border border-slate-200 bg-slate-50 p-3 pr-12"
          >
            <button
              type="button"
              onClick={() => handleDeleteRow(item.id)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700"
              title="Delete row"
            >
              ×
            </button>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Serial / Item No. */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Serial / Item No.
                </label>

                <input
                  type="text"
                  value={item.itemNo}
                  onChange={(e) =>
                    handleChange(item.id, "itemNo", e.target.value)
                  }
                  placeholder={`${index + 1}`}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Part Name */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Part Name
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setActiveItemId(item.id);
                    setShowPartList(
                      activeItemId === item.id ? !showPartList : true,
                    );
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <span
                    className={
                      item.partName ? "text-slate-900" : "text-slate-400"
                    }
                  >
                    {item.partName || "Select part name"}
                  </span>

                  <span className="float-right text-slate-500">▾</span>
                </button>

                {showPartList && activeItemId === item.id && (
                  <div className="absolute left-0 top-full z-40 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                    <button
                      type="button"
                      onClick={() => handleSelectPartName("")}
                      className="block w-full px-3 py-2.5 text-left text-sm text-slate-500 hover:bg-slate-50"
                    >
                      Select part name
                    </button>

                    {partNameOptions.map((part) => (
                      <div
                        key={part.id}
                        className="flex items-center justify-between border-t border-slate-100 px-3 py-2.5 hover:bg-slate-50"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectPartName(part.part_name)}
                          className="flex-1 text-left text-sm font-medium text-slate-700"
                        >
                          {part.part_name}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeletePart(part.id, part.part_name)
                          }
                          className="ml-3 flex h-7 w-7 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 hover:text-red-700"
                          title={`Delete ${part.part_name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fault / Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Fault / Description
                </label>

                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    handleChange(item.id, "description", e.target.value)
                  }
                  placeholder="Enter fault or description"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Cost
                </label>

                <input
                  type="number"
                  min="0"
                  value={item.cost}
                  onChange={(e) =>
                    handleChange(item.id, "cost", e.target.value)
                  }
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => handleConfirmItem(item)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold shadow-sm transition ${
                  item.confirmed
                    ? "border border-emerald-300 bg-emerald-100 text-emerald-800"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <>
                  <Check className="h-4 w-4" />
                  {item.confirmed ? "Confirmed" : "Confirm"}
                </>
              </button>
            </div>
          </div>
        ))}

        {/* Buttons + Total */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            {/* Add New */}
            <button
              type="button"
              onClick={handleAddNew}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Add New
            </button>

            {/* Add Part Name */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddPartModal(true)}
                className="rounded-lg border border-blue-600 bg-white px-4 py-2 text-xs font-bold text-blue-600 shadow-sm transition hover:bg-blue-50"
              >
                + Add Part Name
              </button>

              {showAddPartModal && (
                <div className="absolute left-0 bottom-full mb-3 w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-30">
                  <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-800">
                      Add New Mechanical Part
                    </h3>
                  </div>

                  <div className="p-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Part Name
                    </label>

                    <input
                      type="text"
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      placeholder="Enter part name"
                      autoFocus
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setNewPartName("");
                          setShowAddPartModal(false);
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleAddPart}
                        disabled={isAddingPart}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isAddingPart ? "Adding..." : "Add Part"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total Cost */}
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-2.5">
            <span className="text-sm font-semibold text-slate-600">
              Total Cost
            </span>

            <span className="ml-4 text-lg font-bold text-slate-900">
              ⃁{totalCost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
