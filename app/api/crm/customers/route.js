import { enforceManagerApiAccess } from "../../../../lib/managerApiGuard";
import "server-only";
import { supabaseServer } from "../../../../lib/supabaseServer";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireWorkshopManagerAccess, requireWorkshopAdmin } from "../../../../lib/workshopAuth";

export const dynamic = "force-dynamic";

// WORKSHOP_CUSTOMER_REGISTRATION_V1

export async function GET(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/crm/customers",
    "GET"
  );

  if (managerAccessDenied) return managerAccessDenied;

  if (new URL(request.url).searchParams.get("permission") === "edit") {
    const auth = await requireCustomerEditAccess();

    return Response.json(
      { canEdit: auth.authorized === true },
      {
        status: auth.authorized ? 200 : auth.status,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const { data, error } = await supabaseServer
    .from("crm_customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("CRM customers GET error:", error);

    return Response.json(
      { error: "Failed to fetch CRM customers" },
      { status: 500 }
    );
  }

  return Response.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/crm/customers",
    "POST"
  );

  if (managerAccessDenied) return managerAccessDenied;

  try {
    const auth = await requireWorkshopManagerAccess();

    if (!auth.authorized) {
      return Response.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    if (
      request.headers.get("origin") !==
      new URL(request.url).origin
    ) {
      return Response.json(
        { error: "Invalid request origin" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return Response.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const clean = (value) =>
      typeof value === "string" ? value.trim() : "";

    const first_name = clean(body.first_name);
    const last_name = clean(body.last_name);
    const phone = clean(body.phone);
    const email = clean(body.email);
    const address = clean(body.address);
    const city = clean(body.city);
    const country = clean(body.country);
    const customer_vat = clean(body.customer_vat);
    const registration_date = clean(body.registration_date);

    if (!first_name || !phone) {
      return Response.json(
        { error: "First name and mobile number are required." },
        { status: 400 }
      );
    }

    if (
      !/^[+0-9 ()-]+$/.test(phone) ||
      !/^[0-9]{7,15}$/.test(phone.replace(/\D/g, ""))
    ) {
      return Response.json(
        { error: "Invalid mobile number." },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (registration_date) {
      const parsed = new Date(registration_date + "T00:00:00Z");

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(registration_date) ||
        !Number.isFinite(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !== registration_date
      ) {
        return Response.json(
          { error: "Invalid registration date." },
          { status: 400 }
        );
      }
    }

    const record = {
      first_name,
      last_name: last_name || null,
      phone,
      email: email || null,
      address: address || null,
      city: city || null,
      country: country || null,
      customer_vat: customer_vat || null,
    };

    if (registration_date) {
      record.registration_date = registration_date;
    }

    const { data, error } = await supabaseAdmin
      .from("crm_customers")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error("CRM customer POST error:", error);

      return Response.json(
        { error: "Failed to register customer." },
        { status: 500 }
      );
    }

    return Response.json(data, { status: 201 });

  } catch (error) {
    console.error("CRM customer registration error:", error);

    return Response.json(
      { error: "Customer registration failed." },
      { status: 500 }
    );
  }
}

// WORKSHOP_CUSTOMER_EDIT_V1

async function requireCustomerEditAccess() {
  const superUser = await requireWorkshopManagerAccess();

  if (superUser.authorized) {
    return superUser;
  }

  if (superUser.status !== 403) {
    return superUser;
  }

  const admin = await requireWorkshopAdmin();

  if (admin.authorized || admin.status !== 403) {
    return admin;
  }

  return {
    authorized: false,
    status: 403,
    error: "Only Super User, Manager or Admin may edit customers.",
  };
}

export async function PUT(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/crm/customers",
    "PUT"
  );

  if (managerAccessDenied) return managerAccessDenied;

  try {
    const auth = await requireCustomerEditAccess();

    if (!auth.authorized) {
      return Response.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    if (
      request.headers.get("origin") !==
      new URL(request.url).origin
    ) {
      return Response.json(
        { error: "Invalid request origin." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return Response.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    const clean = (value) =>
      typeof value === "string" ? value.trim() : "";

    const id = clean(body.id);
    const first_name = clean(body.first_name);
    const last_name = clean(body.last_name);
    const phone = clean(body.phone);
    const email = clean(body.email);
    const address = clean(body.address);
    const city = clean(body.city);
    const country = clean(body.country);
    const customer_vat = clean(body.customer_vat);
    const registration_date = clean(body.registration_date);

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ) {
      return Response.json(
        { error: "Invalid customer ID." },
        { status: 400 }
      );
    }

    if (!first_name) {
      return Response.json(
        { error: "First name is required." },
        { status: 400 }
      );
    }

    if (
      phone &&
      (
        !/^[+0-9 ()-]+$/.test(phone) ||
        !/^[0-9]{7,15}$/.test(phone.replace(/\D/g, ""))
      )
    ) {
      return Response.json(
        { error: "Invalid mobile number." },
        { status: 400 }
      );
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return Response.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(
      registration_date + "T00:00:00Z"
    );

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(registration_date) ||
      !Number.isFinite(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== registration_date
    ) {
      return Response.json(
        { error: "Invalid registration date." },
        { status: 400 }
      );
    }

    const record = {
      first_name,
      last_name: last_name || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      city: city || null,
      country: country || null,
      customer_vat: customer_vat || null,
      registration_date,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("crm_customers")
      .update(record)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Customer update error:", error);

      return Response.json(
        { error: "Failed to update customer." },
        { status: 500 }
      );
    }

    if (!data) {
      return Response.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    return Response.json(data, {
      headers: { "Cache-Control": "no-store" },
    });

  } catch (error) {
    console.error("Customer edit error:", error);

    return Response.json(
      { error: "Customer update failed." },
      { status: 500 }
    );
  }
}