import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("workshop_access_token")?.value;

  if (!token) return { error: "Unauthorized", status: 401 };

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("workshop_users")
    .select("id, role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return { error: "Authorization unavailable", status: 503 };
  }

  if (!profile?.is_active) {
    return { error: "Unauthorized", status: 401 };
  }

  return { user: profile };
}

const respond = (message, status) =>
  NextResponse.json({ error: message }, { status });

/* CW_AUTO_CUSTOMER_REGISTRATION_V2
   Match by customer name AND mobile.
   Different names may share the same mobile.
   Never overwrite an existing customer.
*/
function normalizePhone(value) {
  let digits = String(value ?? "").replace(/\D/g, "");

  if (/^009665\d{8}$/.test(digits)) digits = digits.slice(5);
  else if (/^9665\d{8}$/.test(digits)) digits = digits.slice(3);
  else if (/^05\d{8}$/.test(digits)) digits = digits.slice(1);

  return digits;
}

function normalizeName(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

async function registerInvoiceCustomer(invoice) {
  const fullName = String(invoice.customer_name || "").trim();
  const phone = normalizePhone(invoice.customer_phone);

  if (!fullName) {
    return {
      status: "skipped",
      message: "Customer name is missing.",
    };
  }

  if (!phone) {
    return {
      status: "skipped",
      message: "Invoice saved, but customer registration requires a mobile number.",
    };
  }

  try {
    // Check all CRM records, including previously saved phone formats.
    // Pagination prevents the 1,000-row default limit from hiding customers.
    let existingCustomer = null;

    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabaseAdmin
        .from("crm_customers")
        .select("id, first_name, last_name, phone")
        .order("id", { ascending: true })
        .range(offset, offset + 499);

      if (error) throw error;

      const rows = data || [];

      existingCustomer = rows.find((customer) => {
        const storedName = normalizeName(
          [customer.first_name, customer.last_name]
            .filter(Boolean)
            .join(" ")
        );

        return (
          storedName === normalizeName(fullName) &&
          normalizePhone(customer.phone) === phone
        );
      });

      if (existingCustomer || rows.length < 500) break;
    }

    if (existingCustomer) {
      return {
        status: "existing",
        customerId: existingCustomer.id,
        message: "Existing customer found. No information overwritten.",
      };
    }

    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts.shift();
    const lastName = nameParts.join(" ") || null;

    const { data: created, error: insertError } = await supabaseAdmin
      .from("crm_customers")
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone,
        address: String(invoice.customer_address || "").trim() || null,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    return {
      status: "registered",
      customerId: created.id,
      message: "Customer registered successfully.",
    };
  } catch (error) {
    console.error("Customer registration failed:", error);

    return {
      status: "failed",
      message: "Invoice saved, but customer registration failed.",
    };
  }
}
export async function GET() {
  try {
    const auth = await authenticate();

    if (auth.error) return respond(auth.error, auth.status);

    const { data, error } = await supabaseAdmin
      .from("standalone_sales_invoices")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    return NextResponse.json(
      { success: true, invoices: data || [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Standalone invoice GET:", error);
    return respond("Failed to load sales invoices.", 500);
  }
}

export async function POST(request) {
  try {
    const auth = await authenticate();

    if (auth.error) return respond(auth.error, auth.status);

    const body = await request.json();

    if (!["professional", "workshop"].includes(body.template_type)) {
      return respond("Invalid invoice template.", 400);
    }

    if (!String(body.customer_name || "").trim()) {
      return respond("Customer name is required.", 400);
    }

    if (!Array.isArray(body.items) || !body.items.length) {
      return respond("At least one item is required.", 400);
    }

    const items = body.items.map((item) => ({
      category:
        body.template_type === "workshop" && item.category === "labor"
          ? "labor"
          : body.template_type === "workshop"
            ? "part"
            : "item",
      description: String(item.description || "").trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount || 0),
    }));

    if (
      items.some(
        (item) =>
          !item.description ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.unitPrice) ||
          item.unitPrice < 0 ||
          !Number.isFinite(item.discount) ||
          item.discount < 0 ||
          item.discount > item.quantity * item.unitPrice
      )
    ) {
      return respond("Invalid invoice items or amounts.", 400);
    }

    const round = (value) => Math.round(value * 100) / 100;

    const subtotal = round(
      items.reduce(
        (sum, item) =>
          sum + round(item.quantity * item.unitPrice - item.discount),
        0
      )
    );

    const discount = Number(body.discount || 0);

    if (
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > subtotal
    ) {
      return respond("Invalid additional discount.", 400);
    }

    const date = String(body.invoice_date || "");

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(`${date}T00:00:00Z`))
    ) {
      return respond("Invalid invoice date.", 400);
    }

    const clean = (value) =>
      String(value ?? "").trim().slice(0, 1000);

    const record = {
      invoice_no: "",
      template_type: body.template_type,
      invoice_date: date,
      company_name: clean(body.company_name),
      company_name_ar: clean(body.company_name_ar),
      company_phone: clean(body.company_phone),
      company_address: clean(body.company_address),
      customer_name: clean(body.customer_name),
      customer_name_ar: clean(body.customer_name_ar),
      customer_phone: clean(body.customer_phone),
      customer_address: clean(body.customer_address),
      vehicle_make: clean(body.vehicle_make),
      vehicle_model: clean(body.vehicle_model),
      plate_number: clean(body.plate_number),
      chassis_number: clean(body.chassis_number),
      mileage: clean(body.mileage),
      items,
      subtotal,
      discount: round(discount),
      total_amount: round(subtotal - discount),
      currency: "SAR",
      notes: clean(body.notes),
      status: "draft",
    };

    const { data, error } = await supabaseAdmin
      .from("standalone_sales_invoices")
      .insert(record)
      .select("*")
      .single();

    if (error) throw error;

    const customerRegistration = await registerInvoiceCustomer(data);

    return NextResponse.json(
      { success: true, invoice: data, customerRegistration },
      { status: 201 }
    );
  } catch (error) {
    console.error("Standalone invoice POST:", error);
    return respond("Failed to save sales invoice.", 500);
  }
}

export async function PUT(request) {
  try {
    const auth = await authenticate();
    if (auth.error) return respond(auth.error, auth.status);

    const body = await request.json();

    if (
      typeof body.id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id)
    ) {
      return respond("Invalid invoice ID.", 400);
    }

    const { data: existing, error: findError } = await supabaseAdmin
      .from("standalone_sales_invoices")
      .select("id, invoice_no, template_type")
      .eq("id", body.id)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return respond("Invoice not found.", 404);

    if (body.template_type !== existing.template_type) {
      return respond("Invoice template cannot be changed.", 400);
    }

    if (!String(body.customer_name || "").trim()) {
      return respond("Customer name is required.", 400);
    }

    if (!Array.isArray(body.items) || !body.items.length) {
      return respond("At least one item is required.", 400);
    }

    const items = body.items.map((item) => ({
      category:
        existing.template_type === "workshop" && item.category === "labor"
          ? "labor"
          : existing.template_type === "workshop"
            ? "part"
            : "item",
      description: String(item.description || "").trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount || 0),
    }));

    if (
      items.some(
        (item) =>
          !item.description ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.unitPrice) ||
          item.unitPrice < 0 ||
          !Number.isFinite(item.discount) ||
          item.discount < 0 ||
          item.discount > item.quantity * item.unitPrice
      )
    ) {
      return respond("Invalid invoice items or amounts.", 400);
    }

    const round = (value) => Math.round(value * 100) / 100;

    const subtotal = round(
      items.reduce(
        (sum, item) =>
          sum + round(item.quantity * item.unitPrice - item.discount),
        0
      )
    );

    const discount = Number(body.discount || 0);

    if (
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > subtotal
    ) {
      return respond("Invalid additional discount.", 400);
    }

    const date = String(body.invoice_date || "");

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(`${date}T00:00:00Z`))
    ) {
      return respond("Invalid invoice date.", 400);
    }

    const clean = (value) =>
      String(value ?? "").trim().slice(0, 1000);

    const changes = {
      invoice_date: date,
      company_name: clean(body.company_name),
      company_name_ar: clean(body.company_name_ar),
      company_phone: clean(body.company_phone),
      company_address: clean(body.company_address),
      customer_name: clean(body.customer_name),
      customer_name_ar: clean(body.customer_name_ar),
      customer_phone: clean(body.customer_phone),
      customer_address: clean(body.customer_address),
      vehicle_make: clean(body.vehicle_make),
      vehicle_model: clean(body.vehicle_model),
      plate_number: clean(body.plate_number),
      chassis_number: clean(body.chassis_number),
      mileage: clean(body.mileage),
      items,
      subtotal,
      discount: round(discount),
      total_amount: round(subtotal - discount),
      notes: clean(body.notes),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("standalone_sales_invoices")
      .update(changes)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;

    const customerRegistration = await registerInvoiceCustomer(data);

    return NextResponse.json({
      success: true,
      invoice: data,
      customerRegistration,
    });
  } catch (error) {
    console.error("Standalone invoice PUT:", error);
    return respond("Failed to update sales invoice.", 500);
  }
}