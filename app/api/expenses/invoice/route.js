import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { supabaseServer } from "../../../../lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPENSE_BUCKET = "expense-invoices";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("workshop_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !authData?.user?.id) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("workshop_users")
        .select("id, is_active")
        .eq("id", authData.user.id)
        .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: "Authorization service unavailable." },
        { status: 503 }
      );
    }

    if (!profile?.is_active) {
      return NextResponse.json(
        { error: "Active workshop account required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path || !path.startsWith("expenses/")) {
      return NextResponse.json(
        { error: "Invalid invoice path." },
        { status: 400 }
      );
    }

    const { data: expense, error: expenseError } =
      await supabaseServer
        .from("expenses")
        .select("id")
        .eq("invoice_file_path", path)
        .limit(1)
        .maybeSingle();

    if (expenseError) {
      return NextResponse.json(
        { error: "Unable to verify invoice ownership." },
        { status: 503 }
      );
    }

    if (!expense) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseServer.storage
      .from(EXPENSE_BUCKET)
      .createSignedUrl(path, 60 * 5);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: "Unable to open expense invoice." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { url: data.signedUrl },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Expense invoice access error:", error);

    return NextResponse.json(
      { error: "Unable to open expense invoice." },
      { status: 500 }
    );
  }
}