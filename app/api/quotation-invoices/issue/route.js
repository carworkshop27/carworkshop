import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireWorkshopInvoiceIssuer } from "../../../../lib/workshopAuth";

export async function POST(request) {
  try {
    const authorization = await requireWorkshopInvoiceIssuer();

    if (!authorization.authorized) {
      return NextResponse.json(
        { error: authorization.error },
        { status: authorization.status }
      );
    }

    const body = await request.json();
    const quotationId = body?.quotationId;

    if (
      typeof quotationId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quotationId)
    ) {
      return NextResponse.json(
        { error: "Valid quotation ID is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "cw_issue_quotation_invoice_pair",
      { p_quotation_id: quotationId }
    );

    if (error) {
      console.error("Quotation ZATCA issuance failed:", error);

      return NextResponse.json(
        { error: "Invoice issuance failed. No new invoice pair was confirmed." },
        { status: 409 }
      );
    }

    if (!data?.success || !data?.invoice || !data?.taxInvoice) {
      return NextResponse.json(
        { error: "Invoice issuance returned an invalid result." },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Quotation issuance API error:", error);

    return NextResponse.json(
      { error: "Unable to issue quotation invoices." },
      { status: 500 }
    );
  }
}
