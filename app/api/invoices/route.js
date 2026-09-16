import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("id, invoice_no, quotation_id, quotation_no, invoice_date")
      .order("invoice_date", { ascending: false });

    if (error) {
      console.error("Get invoices error:", error);

      return NextResponse.json(
        {
          error: error.message || "Failed to load invoices.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Invoice GET error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to load invoices.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      quotationId,
      quotationNo,
      customerName,
      address,
      contactNumber,
      email,
      items,
      terms,
      subtotal,
      vatAmount,
      totalAmount,
    } = body;

    if (!quotationId || !quotationNo) {
      return NextResponse.json(
        {
          error: "Quotation information is required.",
        },
        { status: 400 },
      );
    }

    const { data: existingInvoice, error: existingInvoiceError } =
      await supabase
        .from("invoices")
        .select("id, invoice_no")
        .eq("quotation_id", quotationId)
        .maybeSingle();

    if (existingInvoiceError) {
      console.error("Check existing invoice error:", existingInvoiceError);

      return NextResponse.json(
        {
          error: "Failed to check existing invoice.",
        },
        { status: 500 },
      );
    }

    if (existingInvoice) {
      return NextResponse.json(
        {
          error: "An invoice has already been generated for this quotation.",
          invoice: existingInvoice,
        },
        { status: 409 },
      );
    }

    const invoiceNo = `INV-${quotationNo}`;

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_no: invoiceNo,
        quotation_id: quotationId,
        quotation_no: quotationNo,
        invoice_date: new Date().toISOString(),

        customer_name: customerName || "",
        address: address || null,
        contact_number: contactNumber || null,
        email: email || null,

        subtotal: Number(subtotal || 0),
        vat_amount: Number(vatAmount || 0),
        total_amount: Number(totalAmount || 0),

        payment_status: "Unpaid",
        payment_method: null,

        items: Array.isArray(items) ? items : [],
        terms: Array.isArray(terms) ? terms : [],

        storage_path: null,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Create invoice error:", invoiceError);

      return NextResponse.json(
        {
          error: invoiceError.message || "Failed to create invoice.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        invoice,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Invoice POST error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to create invoice.",
      },
      { status: 500 },
    );
  }
}
