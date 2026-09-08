import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

const EXPENSE_BUCKET = "expense-invoices";

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function GET() {
  try {
    const { data: expenses, error: expensesError } = await supabaseServer
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (expensesError) {
      console.error("Expense records load error:", expensesError);

      return NextResponse.json(
        { error: expensesError.message },
        { status: 500 },
      );
    }

    if (!expenses || expenses.length === 0) {
      return NextResponse.json([]);
    }

    const expenseIds = expenses.map((expense) => expense.id);

    const { data: items, error: itemsError } = await supabaseServer
      .from("expense_items")
      .select("*")
      .in("expense_id", expenseIds)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error("Expense items load error:", itemsError);

      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    const itemsByExpense = new Map();

    for (const item of items || []) {
      if (!itemsByExpense.has(item.expense_id)) {
        itemsByExpense.set(item.expense_id, []);
      }

      itemsByExpense.get(item.expense_id).push(item);
    }

    const result = expenses.map((expense) => ({
      ...expense,
      items: itemsByExpense.get(expense.id) || [],
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Expense GET error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to load expenses." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  let uploadedFilePath = null;
  let createdExpenseId = null;

  try {
    const formData = await request.formData();

    const expenseNo = String(formData.get("expenseNo") || "").trim();
    const expenseDate = String(formData.get("expenseDate") || "").trim();
    const expenseType = String(formData.get("expenseType") || "").trim();
    const vatRegistrationNumber = String(
      formData.get("vatRegistrationNumber") || "",
    ).trim();

    const subtotal = Number(formData.get("subtotal") || 0);
    const vatAmount = Number(formData.get("vatAmount") || 0);
    const grandTotal = Number(formData.get("grandTotal") || 0);

    const itemsRaw = String(formData.get("items") || "[]");

    if (!expenseDate) {
      return NextResponse.json(
        { error: "Expense date is required." },
        { status: 400 },
      );
    }

    if (!expenseType) {
      return NextResponse.json(
        { error: "Expense type is required." },
        { status: 400 },
      );
    }

    let items;

    try {
      items = JSON.parse(itemsRaw);
    } catch {
      return NextResponse.json(
        { error: "Invalid expense details." },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one expense detail is required." },
        { status: 400 },
      );
    }

    const cleanedItems = items.map((item) => {
      const description = String(item.description || "").trim();
      const amount = Number(item.amount || 0);
      const vat = Number(item.vat || 0);

      return {
        description,
        amount,
        vat,
        line_total: amount + vat,
      };
    });

    if (cleanedItems.some((item) => !item.description)) {
      return NextResponse.json(
        { error: "Please enter a description for every expense detail." },
        { status: 400 },
      );
    }

    if (
      cleanedItems.some(
        (item) =>
          !Number.isFinite(item.amount) ||
          item.amount < 0 ||
          !Number.isFinite(item.vat) ||
          item.vat < 0,
      )
    ) {
      return NextResponse.json(
        { error: "Expense amounts and VAT must be valid positive numbers." },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(subtotal) ||
      !Number.isFinite(vatAmount) ||
      !Number.isFinite(grandTotal)
    ) {
      return NextResponse.json(
        { error: "Invalid expense totals." },
        { status: 400 },
      );
    }

    const calculatedSubtotal = cleanedItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const calculatedVat = cleanedItems.reduce((sum, item) => sum + item.vat, 0);

    const calculatedGrandTotal = calculatedSubtotal + calculatedVat;

    const rounded = (value) => Number(Number(value).toFixed(2));

    if (
      rounded(subtotal) !== rounded(calculatedSubtotal) ||
      rounded(vatAmount) !== rounded(calculatedVat) ||
      rounded(grandTotal) !== rounded(calculatedGrandTotal)
    ) {
      return NextResponse.json(
        { error: "Expense totals do not match the expense details." },
        { status: 400 },
      );
    }

    const invoiceFile = formData.get("invoiceFile");

    if (
      invoiceFile &&
      typeof invoiceFile === "object" &&
      typeof invoiceFile.size === "number" &&
      invoiceFile.size > 0
    ) {
      if (!ALLOWED_FILE_TYPES.includes(invoiceFile.type)) {
        return NextResponse.json(
          { error: "Invoice must be PDF, JPG, JPEG, or PNG." },
          { status: 400 },
        );
      }

      if (invoiceFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Invoice file must not exceed 10 MB." },
          { status: 400 },
        );
      }
    }

    const generatedExpenseNo =
      expenseNo || `EXP-${expenseDate.replaceAll("-", "")}-${Date.now()}`;

    const expenseInsert = {
      expense_no: generatedExpenseNo,
      expense_date: expenseDate,
      expense_type: expenseType,
      vat_registration_number: vatRegistrationNumber || null,
      subtotal: rounded(calculatedSubtotal),
      vat_amount: rounded(calculatedVat),
      grand_total: rounded(calculatedGrandTotal),
      invoice_file_name: null,
      invoice_file_path: null,
    };

    // Upload invoice first.
    if (
      invoiceFile &&
      typeof invoiceFile === "object" &&
      typeof invoiceFile.size === "number" &&
      invoiceFile.size > 0
    ) {
      const originalName = String(invoiceFile.name || "invoice");
      const extension = originalName.includes(".")
        ? originalName.split(".").pop().toLowerCase()
        : "bin";

      const safeBaseName = originalName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);

      const fileName = `${safeBaseName || "invoice"}-${Date.now()}.${extension}`;

      uploadedFilePath = `expenses/${generatedExpenseNo}/${fileName}`;

      const fileBuffer = Buffer.from(await invoiceFile.arrayBuffer());

      const { error: uploadError } = await supabaseServer.storage
        .from(EXPENSE_BUCKET)
        .upload(uploadedFilePath, fileBuffer, {
          contentType: invoiceFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Expense invoice upload error:", uploadError);

        return NextResponse.json(
          { error: uploadError.message || "Failed to upload expense invoice." },
          { status: 500 },
        );
      }

      expenseInsert.invoice_file_name = originalName;
      expenseInsert.invoice_file_path = uploadedFilePath;
    }

    // Create parent expense.
    const { data: createdExpense, error: expenseError } = await supabaseServer
      .from("expenses")
      .insert(expenseInsert)
      .select()
      .single();

    if (expenseError) {
      console.error("Expense insert error:", expenseError);

      if (uploadedFilePath) {
        await supabaseServer.storage
          .from(EXPENSE_BUCKET)
          .remove([uploadedFilePath]);
      }

      return NextResponse.json(
        { error: expenseError.message || "Failed to save expense." },
        { status: 500 },
      );
    }

    createdExpenseId = createdExpense.id;

    // Create expense detail records.
    const itemRows = cleanedItems.map((item) => ({
      expense_id: createdExpense.id,
      description: item.description,
      amount: rounded(item.amount),
      vat: rounded(item.vat),
      line_total: rounded(item.line_total),
    }));

    const { data: createdItems, error: itemsError } = await supabaseServer
      .from("expense_items")
      .insert(itemRows)
      .select();

    if (itemsError) {
      console.error("Expense items insert error:", itemsError);

      await supabaseServer
        .from("expenses")
        .delete()
        .eq("id", createdExpense.id);

      if (uploadedFilePath) {
        await supabaseServer.storage
          .from(EXPENSE_BUCKET)
          .remove([uploadedFilePath]);
      }

      return NextResponse.json(
        { error: itemsError.message || "Failed to save expense details." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        expense: {
          ...createdExpense,
          items: createdItems || [],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Expense POST error:", error);

    if (createdExpenseId) {
      await supabaseServer.from("expenses").delete().eq("id", createdExpenseId);
    }

    if (uploadedFilePath) {
      await supabaseServer.storage
        .from(EXPENSE_BUCKET)
        .remove([uploadedFilePath]);
    }

    return NextResponse.json(
      { error: error.message || "Failed to save expense." },
      { status: 500 },
    );
  }
}
