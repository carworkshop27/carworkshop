import "server-only";

import { cookies } from "next/headers";
import { supabaseAdmin } from "./supabaseAdmin";

// WORKSHOP_MANAGER_API_SECURITY_V1

const managerPermissions = {
  "/api/crm/customers": ["GET", "POST", "PUT"],
  "/api/intake": ["GET", "POST"],
  "/api/intake/records": ["GET", "PUT"],
  "/api/jobs": ["GET", "POST", "PATCH"],
  "/api/jobs/financial-summary": ["GET"],
  "/api/jobs/invoice-protection": ["POST"],
  "/api/jobs/repair-protection": ["POST"],
  "/api/quotations": ["GET", "POST", "PUT"],
  "/api/quotation-invoices/issue": ["POST"],
  "/api/expenses": ["GET", "POST", "PUT"],
  "/api/expenses/invoice": ["GET"],
  "/api/expense-main-categories": ["GET"],
  "/api/expense-subcategories": ["GET"],
  "/api/invoices": ["GET"],
  "/api/tax-invoice": ["GET"]
};

export async function enforceManagerApiAccess(path, method) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("workshop_access_token")?.value;

    if (!token) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { data, error } =
      await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return Response.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("workshop_users")
        .select("role,is_active")
        .eq("id", data.user.id)
        .maybeSingle();

    if (profileError || !profile || !profile.is_active) {
      return Response.json(
        { error: "Account access denied." },
        { status: 403 }
      );
    }

    if (profile.role !== "Manager") {
      return null;
    }

    if (!managerPermissions[path]?.includes(method)) {
      return Response.json(
        { error: "Manager permission denied." },
        { status: 403 }
      );
    }

    return null;

  } catch (error) {
    console.error("Manager API guard:", error);

    return Response.json(
      { error: "Authorization verification failed." },
      { status: 500 }
    );
  }
}