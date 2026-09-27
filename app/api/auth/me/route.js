
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get(
      "workshop_access_token"
    )?.value;

    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const {
      data: authData,
      error: authError,
    } = await supabaseAdmin.auth.getUser(
      accessToken
    );

    if (
      authError ||
      !authData?.user?.id
    ) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("workshop_users")
      .select(
        "id, username, full_name, role, is_active"
      )
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Session profile lookup failed:",
        profileError.message
      );

      return NextResponse.json(
        { error: "Session verification unavailable." },
        { status: 503 }
      );
    }

    if (!profile || !profile.is_active) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: profile.id,
          username: profile.username,
          name: profile.full_name,
          role: profile.role,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Session verification error:",
      error
    );

    return NextResponse.json(
      { error: "Session verification unavailable." },
      { status: 503 }
    );
  }
}
