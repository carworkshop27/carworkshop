import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";

const EXPENSE_BUCKET = "expense-invoices";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Invoice path is required." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseServer.storage
      .from(EXPENSE_BUCKET)
      .createSignedUrl(path, 60 * 5);

    if (error) {
      console.error("Expense invoice signed URL error:", error);

      return NextResponse.json(
        {
          error: "Failed to generate invoice URL.",
          details: error.message,
        },
        { status: 500 },
      );
    }

    if (!data?.signedUrl) {
      return NextResponse.json(
        { error: "Invoice URL was not generated." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: data.signedUrl,
    });
  } catch (error) {
    console.error("Expense invoice GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to open expense invoice.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
