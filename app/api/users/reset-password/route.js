import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireWorkshopSuperUser } from "../../../../lib/workshopAuth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const auth = await requireWorkshopSuperUser();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized." },
        { status: auth.status || 403 }
      );
    }

    const { userId, newPassword } = await request.json();

    if (
      typeof userId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    ) {
      return NextResponse.json(
        { error: "Invalid staff account." },
        { status: 400 }
      );
    }

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 12 ||
      newPassword.length > 128
    ) {
      return NextResponse.json(
        { error: "Password must contain 12–128 characters." },
        { status: 400 }
      );
    }

    const { data: target, error: lookupError } =
      await supabaseAdmin
        .from("workshop_users")
        .select("id, username, full_name, is_active")
        .eq("id", userId)
        .maybeSingle();

    if (lookupError || !target) {
      return NextResponse.json(
        { error: "Staff account not found." },
        { status: 404 }
      );
    }

    if (!target.is_active) {
      return NextResponse.json(
        { error: "Cannot reset an inactive account." },
        { status: 409 }
      );
    }

    const { error: resetError } =
      await supabaseAdmin.auth.admin.updateUserById(
        target.id,
        { password: newPassword }
      );

    if (resetError) {
      console.error("Password reset failed:", resetError.message);

      return NextResponse.json(
        { error: "Unable to reset password." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
      user: {
        id: target.id,
        username: target.username,
        name: target.full_name
      }
    });
  } catch (error) {
    console.error("Password reset error:", error);

    return NextResponse.json(
      { error: "Password reset failed." },
      { status: 500 }
    );
  }
}
