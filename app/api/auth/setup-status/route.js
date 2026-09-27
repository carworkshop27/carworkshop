
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: lock, error: lockError } =
      await supabaseAdmin
        .from("workshop_bootstrap_lock")
        .select("id, claimed_at, completed_at")
        .eq("id", 1)
        .single();

    if (lockError || !lock) {
      console.error(
        "Bootstrap status check failed:",
        lockError?.message
      );

      return NextResponse.json(
        {
          status: "unavailable",
          error: "Unable to verify setup status.",
        },
        { status: 503 }
      );
    }

    const { count, error: countError } =
      await supabaseAdmin
        .from("workshop_users")
        .select("id", {
          count: "exact",
          head: true,
        });

    if (countError) {
      console.error(
        "Staff account count failed:",
        countError.message
      );

      return NextResponse.json(
        {
          status: "unavailable",
          error: "Unable to verify staff accounts.",
        },
        { status: 503 }
      );
    }

    let status;

    if (lock.completed_at || count > 0) {
      status = "setup_complete";
    } else if (lock.claimed_at) {
      status = "setup_locked";
    } else {
      status = "setup_required";
    }

    return NextResponse.json(
      {
        status,
        setupRequired: status === "setup_required",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Setup status API error:",
      error
    );

    return NextResponse.json(
      {
        status: "unavailable",
        error: "Unable to check setup status.",
      },
      { status: 503 }
    );
  }
}
