import { enforceManagerApiAccess } from "../../../lib/managerApiGuard";
import "server-only";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import {
  requireWorkshopManagerAccess
} from "../../../lib/workshopAuth";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET() {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/intake",
    "GET"
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

    const { data, error } = await supabaseAdmin
      .from("crm_customers")
      .select("id, first_name, last_name, phone")
      .order("first_name", { ascending: true })
      .order("last_name", { ascending: true });

    if (error) {
      console.error("In-Take customer lookup:", error.message);

      return Response.json(
        { error: "Failed to load customers." },
        { status: 500 }
      );
    }

    return Response.json(
      { customers: data || [] },
      { headers: { "Cache-Control": "no-store" } }
    );

  } catch (error) {
    console.error("In-Take GET:", error);

    return Response.json(
      { error: "Unable to load In-Take data." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/intake",
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

    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const {
      customerId,
      customerType = "existing",
      customerName,
      phone,
      make,
      model,
      plate,
      approximateCost,
      notes,
      intakeDate,
      requestId
    } = body;

    if (!["existing", "new"].includes(customerType)) {
      return Response.json(
        { error: "Invalid customer type." },
        { status: 400 }
      );
    }

    const normalizedName =
      typeof customerName === "string"
        ? customerName.trim()
        : "";

    const normalizedPhone =
      typeof phone === "string"
        ? phone.trim()
        : "";

    if (customerType === "existing") {
      if (
        typeof customerId !== "string" ||
        !UUID_PATTERN.test(customerId)
      ) {
        return Response.json(
          { error: "Please select a valid customer." },
          { status: 400 }
        );
      }
    }

    if (customerType === "new") {
      if (!normalizedName || normalizedName.length > 200) {
        return Response.json(
          { error: "Please enter a valid customer name." },
          { status: 400 }
        );
      }

      if (
        !normalizedPhone ||
        normalizedPhone.length > 30 ||
        !/^\+?[0-9 ()-]+$/.test(normalizedPhone) ||
        normalizedPhone.replace(/\D/g, "").length < 7 ||
        normalizedPhone.replace(/\D/g, "").length > 15
      ) {
        return Response.json(
          { error: "Please enter a valid mobile number." },
          { status: 400 }
        );
      }
    }

    if (
      typeof requestId !== "string" ||
      !UUID_PATTERN.test(requestId)
    ) {
      return Response.json(
        { error: "Invalid request ID." },
        { status: 400 }
      );
    }

    // WORKSHOP_INTAKE_VEHICLE_VALIDATION_V2

    const normalizedMake =
      typeof make === "string" ? make.trim() : "";

    const normalizedModel =
      typeof model === "string" ? model.trim() : "";

    if (!normalizedMake || normalizedMake.length > 100) {
      return Response.json(
        {
          error: "Car Make / Brand is required. ماركة السيارة مطلوبة."
        },
        { status: 400 }
      );
    }

    if (!normalizedModel || normalizedModel.length > 100) {
      return Response.json(
        {
          error: "Vehicle Model is required. موديل السيارة مطلوب."
        },
        { status: 400 }
      );
    }

    const normalizedPlate =
      typeof plate === "string"
        ? plate.trim().toUpperCase()
        : "";

    if (!/^[\p{L} ]{1,10} [0-9]{1,10}$/u.test(normalizedPlate) || !/\p{L}/u.test(normalizedPlate)) {
      return Response.json(
        { error: "Plate letters and numbers are required. حروف وأرقام اللوحة مطلوبة." },
        { status: 400 }
      );
    }

    const cost =
      typeof approximateCost === "number" ||
      (
        typeof approximateCost === "string" &&
        /^\d+(\.\d{1,2})?$/.test(approximateCost.trim())
      )
        ? Number(approximateCost)
        : NaN;

    if (
      !Number.isFinite(cost) ||
      cost < 0 ||
      cost > 999999999999.99
    ) {
      return Response.json(
        { error: "Invalid approximate cost." },
        { status: 400 }
      );
    }

    const parsedDate =
      typeof intakeDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(intakeDate)
        ? new Date(intakeDate + "T00:00:00Z")
        : null;

    if (
      !parsedDate ||
      !Number.isFinite(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== intakeDate
    ) {
      return Response.json(
        { error: "Invalid In-Take date." },
        { status: 400 }
      );
    }

    const normalizedNotes =
      typeof notes === "string" ? notes.trim() : "";

    if (normalizedNotes.length > 5000) {
      return Response.json(
        { error: "Comments exceed the permitted length." },
        { status: 400 }
      );
    }

    const commonParameters = {
      p_make: normalizedMake,
      p_model: normalizedModel,
      p_plate: normalizedPlate,
      p_approximate_cost: cost,
      p_notes: normalizedNotes,
      p_intake_date: intakeDate,
      p_request_id: requestId
    };

    const rpcName =
      customerType === "new"
        ? "create_workshop_intake_new_customer"
        : "create_workshop_intake";

    const rpcParameters =
      customerType === "new"
        ? {
            ...commonParameters,
            p_customer_name: normalizedName,
            p_phone: normalizedPhone
          }
        : {
            ...commonParameters,
            p_customer_id: customerId
          };

    const { data: jobId, error } =
      await supabaseAdmin.rpc(
        rpcName,
        rpcParameters
      );

    if (error || !jobId) {
      console.error("In-Take creation:", error?.message);

      return Response.json(
        { error: "Failed to save In-Take." },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        jobId,
        message: "In-Take saved successfully."
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("In-Take POST:", error);

    return Response.json(
      { error: "Unable to process In-Take." },
      { status: 500 }
    );
  }
}

