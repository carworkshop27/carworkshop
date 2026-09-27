import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireWorkshopSuperUser } from "../../../../lib/workshopAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireWorkshopSuperUser();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("workshop_users")
      .select(
        "id, username, full_name, role, is_active, created_at"
      )
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Staff list failed:",
        error.message
      );

      return NextResponse.json(
        { error: "Unable to load staff accounts." },
        { status: 500 }
      );
    }

    const users = await Promise.all(
      (data || []).map(async (user) => {
        const {
          data: authData,
          error: authError,
        } = await supabaseAdmin.auth.admin.getUserById(
          user.id
        );

        if (authError || !authData?.user) {
          throw new Error(
            `Unable to retrieve authentication details for staff ID ${user.id}.`
          );
        }

        return {
          id: user.id,
          username: user.username,
          name: user.full_name,
          email: authData.user.email || "",
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
        };
      })
    );

    return NextResponse.json(
      { users },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Staff list API error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load staff accounts." },
      { status: 500 }
    );
  }
}

