
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message, status) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

function secureCompare(received, expected) {
  if (
    typeof received !== "string" ||
    typeof expected !== "string"
  ) {
    return false;
  }

  const a = Buffer.from(received);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

async function releaseBootstrap() {
  const { data, error } = await supabaseAdmin.rpc(
    "workshop_release_bootstrap"
  );

  if (error || data !== true) {
    console.error(
      "Bootstrap release requires investigation:",
      error?.message || "Release not confirmed"
    );

    return false;
  }

  return true;
}

export async function POST(request) {
  try {
    // ---------------------------------------
    // 1. Verify bootstrap configuration
    // ---------------------------------------

    const configuredSecret =
      process.env.WORKSHOP_BOOTSTRAP_SECRET;

    if (
      !configuredSecret ||
      configuredSecret.length < 32
    ) {
      return jsonError(
        "Administrator setup is not configured.",
        503
      );
    }

    const providedSecret = request.headers.get(
      "x-workshop-setup-secret"
    );

    if (
      !secureCompare(
        providedSecret,
        configuredSecret
      )
    ) {
      return jsonError(
        "Unauthorized setup request.",
        401
      );
    }

    // ---------------------------------------
    // 2. Validate administrator information
    // ---------------------------------------

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonError(
        "Invalid registration request.",
        400
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password = body.password;

    if (
      !name ||
      !username ||
      !email ||
      typeof password !== "string" ||
      password.length < 12
    ) {
      return jsonError(
        "Name, username, email and a password of at least 12 characters are required.",
        400
      );
    }

    if (name.length > 150) {
      return jsonError(
        "Administrator name is too long.",
        400
      );
    }

    if (
      username.length > 50 ||
      !/^[a-z0-9_.-]+$/.test(username)
    ) {
      return jsonError(
        "Invalid administrator username.",
        400
      );
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return jsonError(
        "Invalid administrator email.",
        400
      );
    }

    // ---------------------------------------
    // 3. Check existing staff accounts
    // ---------------------------------------

    const { count, error: countError } =
      await supabaseAdmin
        .from("workshop_users")
        .select("id", {
          count: "exact",
          head: true,
        });

    if (countError) {
      console.error(
        "Bootstrap account check failed:",
        countError.message
      );

      return jsonError(
        "Unable to verify administrator setup.",
        500
      );
    }

    if (count !== 0) {
      return jsonError(
        "Initial administrator setup is already complete.",
        409
      );
    }

    // ---------------------------------------
    // 4. Atomically claim bootstrap slot
    // ---------------------------------------

    const {
      data: claimed,
      error: claimError,
    } = await supabaseAdmin.rpc(
      "workshop_claim_bootstrap"
    );

    if (claimError) {
      console.error(
        "Bootstrap claim failed:",
        claimError.message
      );

      return jsonError(
        "Unable to secure administrator setup.",
        500
      );
    }

    if (claimed !== true) {
      return jsonError(
        "Administrator setup is already claimed or completed.",
        409
      );
    }

    // ---------------------------------------
    // 5. Create Supabase Auth account
    // ---------------------------------------

    const {
      data: authData,
      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData?.user?.id) {
      console.error(
        "Administrator Auth creation failed:",
        authError?.message
      );

      // Do not release an uncertain claim if
      // Auth returned an unexpected partial result.
      if (authError && !authData?.user?.id) {
        await releaseBootstrap();
      }

      return jsonError(
        "Unable to create administrator authentication account.",
        500
      );
    }

    const authUserId = authData.user.id;

    // ---------------------------------------
    // 6. Create workshop staff profile
    // ---------------------------------------

    const {
      error: profileError,
    } = await supabaseAdmin
      .from("workshop_users")
      .insert({
        id: authUserId,
        username,
        full_name: name,
        role: "Super User",
        is_active: true,
      });

    if (profileError) {
      console.error(
        "Administrator profile creation failed:",
        profileError.message
      );

      const {
        error: rollbackError,
      } = await supabaseAdmin.auth.admin.deleteUser(
        authUserId
      );

      if (rollbackError) {
        console.error(
          "Administrator rollback failed:",
          rollbackError.message
        );

        return jsonError(
          "Administrator setup requires recovery. Contact the system administrator.",
          500
        );
      }

      await releaseBootstrap();

      return jsonError(
        "Administrator profile creation failed.",
        500
      );
    }

    // ---------------------------------------
    // 7. Mark bootstrap completed
    // ---------------------------------------

    const {
      data: completed,
      error: completeError,
    } = await supabaseAdmin.rpc(
      "workshop_complete_bootstrap"
    );

    if (completeError || completed !== true) {
      console.error(
        "Bootstrap completion failed:",
        completeError?.message ||
          "Completion not confirmed"
      );

      // Keep the claim locked.
      // Do not delete the newly created account.
      // Do not automatically retry registration.

      return jsonError(
        "Administrator account created, but setup finalization requires recovery.",
        500
      );
    }

    // ---------------------------------------
    // 8. Return successful registration
    // ---------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Workshop Super User created successfully.",

        user: {
          id: authUserId,
          username,
          name,
          role: "Super User",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Bootstrap API error:",
      error
    );

    // Do not automatically release a claim here.
    // An unexpected exception may occur after
    // the authentication account was created.

    return jsonError(
      "Administrator setup failed. Check server logs before retrying.",
      500
    );
  }
}
