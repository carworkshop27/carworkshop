import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireWorkshopSuperUser } from "../../../../lib/workshopAuth";

export const runtime = "nodejs";

const ALLOWED_ROLES = [
  "Super User",
  "Manager",
  "Mechanic",
  "Cashier",
];

function fail(message, status) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

export async function POST(request) {
  try {
    const auth = await requireWorkshopSuperUser();

    if (!auth.authorized) {
      return fail(
        auth.error || "Super User access required.",
        auth.status || 403
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return fail("Invalid update request.", 400);
    }

    const userId = body.userId;

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

    const role = body.role;

    if (
      typeof userId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    ) {
      return fail("Invalid staff account ID.", 400);
    }

    if (
      !name ||
      name.length > 150 ||
      !username ||
      username.length > 50 ||
      !/^[a-z0-9_.-]+$/.test(username) ||
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !ALLOWED_ROLES.includes(role)
    ) {
      return fail(
        "Enter a valid name, username, email and role.",
        400
      );
    }

    const {
      data: target,
      error: targetError,
    } = await supabaseAdmin
      .from("workshop_users")
      .select(
        "id, username, full_name, role, is_active"
      )
      .eq("id", userId)
      .maybeSingle();

    if (targetError) {
      console.error(
        "Edit User target lookup failed:",
        targetError.message
      );

      return fail(
        "Unable to verify staff account.",
        500
      );
    }

    if (!target) {
      return fail("Staff account not found.", 404);
    }

    if (!target.is_active) {
      return fail(
        "Cannot edit an inactive staff account.",
        409
      );
    }

    // Protect the initial admin account.
    if (target.username === "admin") {
      if (
        username !== "admin" ||
        role !== "Super User"
      ) {
        return fail(
          "The initial admin username and role cannot be changed.",
          403
        );
      }
    }

    // Reserve the admin username.
    if (
      target.username !== "admin" &&
      username === "admin"
    ) {
      return fail(
        "The admin username is reserved.",
        409
      );
    }

    const {
      data: existingUsername,
      error: usernameError,
    } = await supabaseAdmin
      .from("workshop_users")
      .select("id")
      .eq("username", username)
      .neq("id", userId)
      .maybeSingle();

    if (usernameError) {
      console.error(
        "Edit User username check failed:",
        usernameError.message
      );

      return fail(
        "Unable to verify username.",
        500
      );
    }

    if (existingUsername) {
      return fail(
        "Username already exists.",
        409
      );
    }

    const {
      data: authResult,
      error: authLookupError,
    } = await supabaseAdmin.auth.admin.getUserById(
      userId
    );

    if (
      authLookupError ||
      !authResult?.user
    ) {
      console.error(
        "Edit User Auth lookup failed:",
        authLookupError?.message
      );

      return fail(
        "Unable to verify staff authentication account.",
        500
      );
    }

    const previousEmail =
      authResult.user.email || "";

    const emailChanged =
      previousEmail.toLowerCase() !== email;

    if (emailChanged) {
      const {
        error: emailError,
      } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          email,
          email_confirm: true,
        }
      );

      if (emailError) {
        console.error(
          "Edit User email update failed:",
          emailError.message
        );

        return fail(
          "Unable to update email. Check whether it is already registered.",
          409
        );
      }
    }

    const {
      data: updated,
      error: profileError,
    } = await supabaseAdmin
      .from("workshop_users")
      .update({
        full_name: name,
        username,
        role,
      })
      .eq("id", userId)
      .select(
        "id, username, full_name, role, is_active"
      )
      .single();

    if (profileError) {
      console.error(
        "Edit User profile update failed:",
        profileError.message
      );

      if (emailChanged && previousEmail) {
        const {
          error: rollbackError,
        } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            email: previousEmail,
            email_confirm: true,
          }
        );

        if (rollbackError) {
          console.error(
            "Edit User email rollback failed:",
            rollbackError.message
          );

          return fail(
            "Profile update failed and email recovery requires administrator attention.",
            500
          );
        }
      }

      return fail(
        profileError.code === "23505"
          ? "Username already exists."
          : "Unable to update staff account.",
        profileError.code === "23505" ? 409 : 500
      );
    }

    return NextResponse.json({
      success: true,
      message: "Staff account updated successfully.",
      user: {
        id: updated.id,
        name: updated.full_name,
        username: updated.username,
        email,
        role: updated.role,
        is_active: updated.is_active,
      },
    });
  } catch (error) {
    console.error(
      "Edit User API error:",
      error
    );

    return fail(
      "Unable to update staff account.",
      500
    );
  }
}
