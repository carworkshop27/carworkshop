import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tax_invoices")
      .select(
        "id, quotation_id, quotation_no, tax_invoice_no, issue_date, issue_time, supply_date, customer_name, address, contact_number, email, customer_vat_number, customer_cr_number, subtotal, discount, taxable_amount, vat_rate, vat_amount, total_amount, items",
      )
      .order("issue_date", { ascending: false });

    if (error) {
      console.error("Get tax invoices error:", error);

      return NextResponse.json(
        {
          error: error.message || "Failed to load tax invoices.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Tax Invoice GET error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to load tax invoices.",
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
      customerVatNumber,
      customerCrNumber,
      items,
      subtotal,
      discount,
      taxableAmount,
      vatRate,
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

    const { data: existingTaxInvoice, error: existingTaxInvoiceError } =
      await supabase
        .from("tax_invoices")
        .select("id, tax_invoice_no")
        .eq("quotation_id", quotationId)
        .maybeSingle();

    if (existingTaxInvoiceError) {
      console.error(
        "Check existing tax invoice error:",
        existingTaxInvoiceError,
      );

      return NextResponse.json(
        {
          error: "Failed to check existing tax invoice.",
        },
        { status: 500 },
      );
    }

    if (existingTaxInvoice) {
      return NextResponse.json(
        {
          error: "A tax invoice has already been generated for this quotation.",
          taxInvoice: existingTaxInvoice,
        },
        { status: 409 },
      );
    }

    const taxInvoiceNo = `TAX-${quotationNo}`;

    const issueDate = new Date();

    const { data: taxInvoice, error: taxInvoiceError } = await supabase
      .from("tax_invoices")
      .insert({
        quotation_id: quotationId,
        quotation_no: quotationNo,

        tax_invoice_no: taxInvoiceNo,

        issue_date: issueDate.toISOString(),
        issue_time: issueDate.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        supply_date: issueDate.toISOString().slice(0, 10),

        customer_name: customerName || "",
        address: address || null,
        contact_number: contactNumber || null,
        email: email || null,

        customer_vat_number: customerVatNumber || null,
        customer_cr_number: customerCrNumber || null,

        subtotal: Number(subtotal || 0),
        discount: Number(discount || 0),
        taxable_amount: Number(taxableAmount || 0),

        vat_rate: Number(vatRate || 15),
        vat_amount: Number(vatAmount || 0),
        total_amount: Number(totalAmount || 0),

        items: Array.isArray(items) ? items : [],
      })
      .select()
      .single();

    if (taxInvoiceError) {
      console.error("Create tax invoice error:", taxInvoiceError);

      return NextResponse.json(
        {
          error: taxInvoiceError.message || "Failed to create tax invoice.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        taxInvoice,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Tax Invoice POST error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to create tax invoice.",
      },
      { status: 500 },
    );
  }
}
