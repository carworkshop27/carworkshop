import "server-only";
import { cookies } from "next/headers";
import { supabaseAdmin } from "./supabaseAdmin";

export async function requireWorkshopSuperUser() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(
    "workshop_access_token"
  )?.value;

  if (!accessToken) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication required.",
    };
  }

  const {
    data: authData,
    error: authError,
  } = await supabaseAdmin.auth.getUser(
    accessToken
  );

  if (authError || !authData?.user?.id) {
    return {
      authorized: false,
      status: 401,
      error: "Invalid or expired session.",
    };
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
      "Staff authorization lookup failed:",
      profileError.message
    );

    return {
      authorized: false,
      status: 503,
      error: "Authorization service unavailable.",
    };
  }

  if (
    !profile ||
    !profile.is_active ||
    profile.role !== "Super User"
  ) {
    return {
      authorized: false,
      status: 403,
      error: "Super User access required.",
    };
  }

  return {
    authorized: true,
    user: profile,
  };
}

export async function requireWorkshopAdmin() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(
    "workshop_access_token"
  )?.value;

  if (!accessToken) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication required.",
    };
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !authData?.user?.id) {
    return {
      authorized: false,
      status: 401,
      error: "Invalid or expired session.",
    };
  }

  const { data: profile, error: profileError } =
    await supabaseAdmin
      .from("workshop_users")
      .select("id, username, role, is_active")
      .eq("id", authData.user.id)
      .maybeSingle();

  if (profileError) {
    return {
      authorized: false,
      status: 503,
      error: "Authorization service unavailable.",
    };
  }

  const ADMIN_USER_ID =
    "4502b4f1-2e5b-4e62-81c5-0b6e93ec66a1";

  if (
    !profile ||
    !profile.is_active ||
    profile.id !== ADMIN_USER_ID ||
    profile.username?.trim().toLowerCase() !== "admin"
  ) {
    return {
      authorized: false,
      status: 403,
      error: "Application Administrator access required.",
    };
  }

  return {
    authorized: true,
    user: profile,
  };
}
export async function requireWorkshopInvoiceIssuer() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("workshop_access_token")?.value;

  if (!accessToken) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication required.",
    };
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !authData?.user?.id) {
    return {
      authorized: false,
      status: 401,
      error: "Invalid or expired session.",
    };
  }

  const { data: profile, error: profileError } =
    await supabaseAdmin
      .from("workshop_users")
      .select("id, username, full_name, role, is_active")
      .eq("id", authData.user.id)
      .maybeSingle();

  if (profileError) {
    return {
      authorized: false,
      status: 503,
      error: "Authorization service unavailable.",
    };
  }

  if (
    !profile ||
    !profile.is_active ||
    !["Super User", "Manager"].includes(profile.role)
  ) {
    return {
      authorized: false,
      status: 403,
      error: "Super User or Manager access required.",
    };
  }

  return {
    authorized: true,
    user: profile,
  };
}


export async function requireWorkshopQuotationAccess(operation) {
  const allowedRoles =
    operation === "DELETE"
      ? ["Super User"]
      : operation === "POST" || operation === "PUT"
        ? ["Super User", "Manager", "Accountant"]
        : null;

  if (!allowedRoles) {
    return {
      authorized: false,
      status: 400,
      error: "Unsupported quotation operation.",
    };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("workshop_access_token")?.value;

  if (!accessToken) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication required.",
    };
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !authData?.user?.id) {
    return {
      authorized: false,
      status: 401,
      error: "Invalid or expired session.",
    };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("workshop_users")
    .select("id, username, role, is_active")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    return {
      authorized: false,
      status: 503,
      error: "Authorization service unavailable.",
    };
  }

  if (
    !profile ||
    !profile.is_active ||
    !allowedRoles.includes(profile.role)
  ) {
    return {
      authorized: false,
      status: 403,
      error: "Insufficient quotation permissions.",
    };
  }

  return {
    authorized: true,
    user: profile,
  };
}


// WORKSHOP_MANAGER_ACCESS_V1

export async function requireWorkshopManagerAccess() {
  return requireWorkshopInvoiceIssuer();
}

export async function requireWorkshopAdminOrManager() {
  const admin = await requireWorkshopAdmin();

  if (admin.authorized || admin.status !== 403) {
    return admin;
  }

  const access = await requireWorkshopManagerAccess();

  if (!access.authorized) {
    return access;
  }

  if (access.profile?.role === "Manager" ||
      access.user?.role === "Manager" ||
      access.role === "Manager") {
    return access;
  }

  return {
    authorized: false,
    status: 403,
    error: "Manager or Admin access required.",
  };
}
