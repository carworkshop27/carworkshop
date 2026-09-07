import { supabaseServer } from "../../../lib/supabaseServer";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("purchases")
      .select(
        `
        *,
        purchase_items (*)
        `,
      )
      .order("purchase_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Purchases GET error:", error);

      return Response.json(
        {
          error: "Failed to fetch purchases",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("Purchases GET request error:", error);

    return Response.json(
      {
        error: "Failed to fetch purchases",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  let uploadedInvoicePath = null;

  try {
    const formData = await request.formData();

    const purchaseNo = formData.get("purchaseNo");
    const purchaseDate = formData.get("purchaseDate");
    const supplier = formData.get("supplier");
    const supplierInvoiceNo = formData.get("supplierInvoiceNo");
    const paymentMethod = formData.get("paymentMethod");
    const paymentStatus = formData.get("paymentStatus");
    const vatRegistrationNumber = formData.get("vatRegistrationNumber");
    const itemsJson = formData.get("items");
    const subtotal = formData.get("subtotal");
    const vatAmount = formData.get("vatAmount");
    const grandTotal = formData.get("grandTotal");

    const invoiceFile = formData.get("invoiceFile");

    if (!purchaseNo || !purchaseDate || !supplier) {
      return Response.json(
        {
          error: "Purchase number, purchase date, and supplier are required",
        },
        { status: 400 },
      );
    }

    let items;

    try {
      items = JSON.parse(itemsJson || "[]");
    } catch {
      return Response.json(
        {
          error: "Invalid purchase items data",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json(
        {
          error: "At least one purchase item is required",
        },
        { status: 400 },
      );
    }

    /*
     * Upload supplier invoice to private Supabase Storage bucket.
     */
    if (invoiceFile && invoiceFile.size > 0) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

      if (!allowedTypes.includes(invoiceFile.type)) {
        return Response.json(
          {
            error: "Only PDF, JPG, and PNG invoice files are allowed",
          },
          { status: 400 },
        );
      }

      const maxFileSize = 50 * 1024 * 1024;

      if (invoiceFile.size > maxFileSize) {
        return Response.json(
          {
            error: "Invoice file must be 50 MB or smaller",
          },
          { status: 400 },
        );
      }

      const originalName = invoiceFile.name || "invoice";
      const safeName = originalName
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_");

      const filePath = `purchases/${purchaseNo}-${Date.now()}-${safeName}`;

      const fileBuffer = await invoiceFile.arrayBuffer();

      const { error: uploadError } = await supabaseServer.storage
        .from("purchase-invoices")
        .upload(filePath, fileBuffer, {
          contentType: invoiceFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Purchase invoice upload error:", uploadError);

        return Response.json(
          {
            error: "Failed to upload purchase invoice",
            details: uploadError.message,
          },
          { status: 500 },
        );
      }

      uploadedInvoicePath = filePath;
    }

    /*
     * Create the purchase record.
     */
    const { data: purchaseData, error: purchaseError } = await supabaseServer
      .from("purchases")
      .insert({
        purchase_no: purchaseNo,
        purchase_date: purchaseDate,
        supplier,
        supplier_invoice_no: supplierInvoiceNo || null,
        payment_method: paymentMethod || "Cash",
        payment_status: paymentStatus || "Paid",
        vat_registration_number: vatRegistrationNumber || null,
        subtotal: Number(subtotal) || 0,
        vat_amount: Number(vatAmount) || 0,
        grand_total: Number(grandTotal) || 0,
        invoice_file_name: invoiceFile?.name || null,
        invoice_file_path: uploadedInvoicePath,
      })
      .select()
      .single();

    if (purchaseError) {
      console.error("Purchases POST error:", purchaseError);

      if (uploadedInvoicePath) {
        await supabaseServer.storage
          .from("purchase-invoices")
          .remove([uploadedInvoicePath]);
      }

      return Response.json(
        {
          error: "Failed to create purchase",
          details: purchaseError.message,
        },
        { status: 500 },
      );
    }

    /*
     * Create purchase items.
     */
    const purchaseItems = items.map((item) => ({
      purchase_id: purchaseData.id,
      item_name: item.item || item.itemName || "",
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unitPrice) || 0,
      discount: Number(item.discount) || 0,
      line_total: Number(item.total ?? item.lineTotal) || 0,
    }));

    const { data: itemsData, error: itemsError } = await supabaseServer
      .from("purchase_items")
      .insert(purchaseItems)
      .select();

    if (itemsError) {
      console.error("Purchase items POST error:", itemsError);

      await supabaseServer.from("purchases").delete().eq("id", purchaseData.id);

      if (uploadedInvoicePath) {
        await supabaseServer.storage
          .from("purchase-invoices")
          .remove([uploadedInvoicePath]);
      }

      return Response.json(
        {
          error: "Failed to create purchase items",
          details: itemsError.message,
        },
        { status: 500 },
      );
    }

    return Response.json(
      {
        ...purchaseData,
        purchase_items: itemsData,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Purchases POST request error:", error);

    if (uploadedInvoicePath) {
      await supabaseServer.storage
        .from("purchase-invoices")
        .remove([uploadedInvoicePath]);
    }

    return Response.json(
      {
        error: "Failed to create purchase",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
