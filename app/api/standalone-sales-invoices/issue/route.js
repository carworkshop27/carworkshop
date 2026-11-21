import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const respond = (message, status) =>
  NextResponse.json({ error: message }, { status });

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("workshop_access_token")?.value;

    if (!token) {
      return respond("Unauthorized", 401);
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !authData?.user?.id) {
      return respond("Unauthorized", 401);
    }

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("workshop_users")
        .select("id, role, is_active")
        .eq("id", authData.user.id)
        .maybeSingle();

    if (profileError) {
      return respond("Authorization unavailable", 503);
    }

    if (
      !profile?.is_active ||
      !["Super User", "Manager"].includes(profile.role)
    ) {
      return respond("Forbidden", 403);
    }

    const body = await request.json();

    if (
      typeof body.id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id)
    ) {
      return respond("Invalid invoice ID", 400);
    }

    const { data: invoice, error: issueError } =
      await supabaseAdmin.rpc(
        "cw_zatca_issue_invoice",
        { p_invoice_id: body.id }
      );

    if (issueError) {
      console.error("ZATCA issuance failed:", issueError);
      return respond("Invoice issuance failed.", 409);
    }

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("ZATCA issuance endpoint:", error);
    return respond("Failed to issue invoice.", 500);
  }
}
