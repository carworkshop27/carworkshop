import { enforceManagerApiAccess } from "../../../lib/managerApiGuard";
import { requireWorkshopInvoiceIssuer } from "../../../lib/workshopAuth";
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/invoices",
    "GET"
  );

  if (managerAccessDenied) return managerAccessDenied;

  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(
        "id, invoice_no, quotation_id, quotation_no, invoice_date, subtotal, discount, taxable_amount, additional_discount, vat_amount, total_amount, payment_status, payment_method, zatca_qr_payload, zatca_issued_at",
      )
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

export async function POST() {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/invoices",
    "POST"
  );

  if (managerAccessDenied) return managerAccessDenied;

  return NextResponse.json(
    {
      error: "Legacy invoice creation is disabled. Use the coordinated ZATCA issuance endpoint."
    },
    { status: 409 }
  );
}
