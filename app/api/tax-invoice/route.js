import { requireWorkshopInvoiceIssuer } from "../../../lib/workshopAuth";
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tax_invoices")
      .select(
        "id, quotation_id, quotation_no, tax_invoice_no, issue_date, issue_time, supply_date, customer_name, address, contact_number, email, customer_vat_number, customer_cr_number, subtotal, discount, additional_discount, taxable_amount, vat_rate, vat_amount, total_amount, items, zatca_qr_payload, zatca_issued_at",
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

export async function POST() {
  return NextResponse.json(
    {
      error: "Legacy invoice creation is disabled. Use the coordinated ZATCA issuance endpoint."
    },
    { status: 409 }
  );
}
