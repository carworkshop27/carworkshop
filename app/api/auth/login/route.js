
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

const COOKIE_NAME = "workshop_access_token";

function errorResponse(message, status) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid login request.", 400);
    }

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const password = body.password;

    if (
      !username ||
      typeof password !== "string" ||
      !password
    ) {
      return errorResponse(
        "Username and password are required.",
        400
      );
    }

    if (
      username.length > 50 ||
      !/^[a-z0-9_.-]+$/.test(username)
    ) {
      return errorResponse(
        "Invalid username or password.",
        401
      );
    }

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("workshop_users")
        .select(
          "id, username, full_name, role, is_active"
        )
        .eq("username", username)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Login profile lookup failed:",
        profileError.message
      );

      return errorResponse(
        "Login service is unavailable.",
        503
      );
    }

    if (!profile || !profile.is_active) {
      return errorResponse(
        "Invalid username or password.",
        401
      );
    }

    const { data: authUser, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(
        profile.id
      );

    if (
      userError ||
      !authUser?.user?.email
    ) {
      console.error(
        "Login Auth account lookup failed:",
        userError?.message
      );

      return errorResponse(
        "Invalid username or password.",
        401
      );
    }

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const publishableKey =
      process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {
      return errorResponse(
        "Login service is not configured.",
        503
      );
    }

    // Use the publishable key for password
    // verification, never the admin secret.
    const authClient = createClient(
      supabaseUrl,
      publishableKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    const {
      data: signInData,
      error: signInError,
    } = await authClient.auth.signInWithPassword({
      email: authUser.user.email,
      password,
    });

    if (
      signInError ||
      !signInData?.session?.access_token ||
      signInData.user?.id !== profile.id
    ) {
      return errorResponse(
        "Invalid username or password.",
        401
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        username: profile.username,
        name: profile.full_name,
        role: profile.role,
      },
    });

    response.cookies.set(
      COOKIE_NAME,
      signInData.session.access_token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: Math.min(
          signInData.session.expires_in || 3600,
          3600
        ),
      }
    );

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return errorResponse(
      "Login service is unavailable.",
      503
    );
  }
}
