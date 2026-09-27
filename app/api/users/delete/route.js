import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireWorkshopSuperUser } from "../../../../lib/workshopAuth";

export const runtime = "nodejs";

function fail(message, status) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

export async function POST(request) {
  try {
    const auth = await requireWorkshopSuperUser();

    if (!auth.authorized) {
      return fail(
        auth.error,
        auth.status
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return fail(
        "Invalid request.",
        400
      );
    }

    const userId = body.userId;

    if (
      typeof userId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    ) {
      return fail(
        "Invalid staff account ID.",
        400
      );
    }

    if (userId === auth.user.id) {
      return fail(
        "You cannot deactivate your own account.",
        403
      );
    }

    const {
      data: target,
      error: targetError,
    } = await supabaseAdmin
      .from("workshop_users")
      .select(
        "id, username, role, is_active"
      )
      .eq("id", userId)
      .maybeSingle();

    if (targetError) {
      return fail(
        "Unable to verify staff account.",
        500
      );
    }

    if (!target) {
      return fail(
        "Staff account not found.",
        404
      );
    }

    if (!target.is_active) {
      return NextResponse.json({
        success: true,
        message: "Account is already inactive.",
      });
    }

    // Protect the initial administrator account.
    if (target.username === "admin") {
      return fail(
        "The initial administrator account is protected.",
        403
      );
    }

    const {
      data: updated,
      error: updateError,
    } = await supabaseAdmin
      .from("workshop_users")
      .update({
        is_active: false,
      })
      .eq("id", userId)
      .eq("is_active", true)
      .select("id")
      .maybeSingle();

    if (updateError || !updated) {
      return fail(
        "Unable to deactivate staff account.",
        500
      );
    }

    return NextResponse.json({
      success: true,
      message: "Staff account deactivated.",
    });
  } catch (error) {
    console.error(
      "Staff deactivation API error:",
      error
    );

    return fail(
      "Unable to deactivate staff account.",
      500
    );
  }
}
