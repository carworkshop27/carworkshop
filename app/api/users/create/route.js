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
    const role = body.role;

    if (
      !name ||
      name.length > 150 ||
      !username ||
      username.length > 50 ||
      !/^[a-z0-9_.-]+$/.test(username) ||
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 128 ||
      !ALLOWED_ROLES.includes(role)
    ) {
      return fail(
        "Enter a valid name, username, email, role and password of 12–128 characters.",
        400
      );
    }

    const {
      data: existing,
      error: existingError,
    } = await supabaseAdmin
      .from("workshop_users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Username check failed:",
        existingError.message
      );

      return fail(
        "Unable to verify username.",
        500
      );
    }

    if (existing) {
      return fail(
        "Username already exists.",
        409
      );
    }

    const {
      data: created,
      error: createError,
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (
      createError ||
      !created?.user?.id
    ) {
      console.error(
        "Staff Auth creation failed:",
        createError?.message
      );

      return fail(
        "Unable to create account. Check whether the email is already registered.",
        409
      );
    }

    const id = created.user.id;

    const {
      error: profileError,
    } = await supabaseAdmin
      .from("workshop_users")
      .insert({
        id,
        username,
        full_name: name,
        role,
        is_active: true,
      });

    if (profileError) {
      console.error(
        "Staff profile creation failed:",
        profileError.message
      );

      const {
        error: rollbackError,
      } = await supabaseAdmin.auth.admin.deleteUser(
        id
      );

      if (rollbackError) {
        console.error(
          "Staff account rollback failed:",
          rollbackError.message
        );

        return fail(
          "Account creation requires administrator recovery. Do not retry with another email yet.",
          500
        );
      }

      return fail(
        profileError.code === "23505"
          ? "Username already exists."
          : "Unable to create staff profile.",
        profileError.code === "23505" ? 409 : 500
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id,
          username,
          name,
          role,
          is_active: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Staff creation API error:",
      error
    );

    return fail(
      "Unable to create staff account.",
      500
    );
  }
}
