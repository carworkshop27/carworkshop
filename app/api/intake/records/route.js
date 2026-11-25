import { enforceManagerApiAccess } from "../../../../lib/managerApiGuard";
import "server-only";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireWorkshopManagerAccess, requireWorkshopAdmin } from "../../../../lib/workshopAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/intake/records",
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

    // WORKSHOP_INTAKE_ACTION_PERMISSION_V1

    const adminAuth = await requireWorkshopAdmin();
    const canDelete = adminAuth.authorized === true;

    const records = [];
    const pageSize = 500;

    for (let offset = 0; ; offset += pageSize) {

      const { data, error } = await supabaseAdmin
        .from("jobs")
        .select("id,customer_id,owner,phone,make,model,plate,intake_date,intake_time,approximate_cost,status,issue,intake_completed_at")
        .like("intake_source", "INTAKE:%")
        .order("intake_completed_at", { ascending: false })
        .order("id", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        throw error;
      }

      records.push(...(data || []));

      if (!data || data.length < pageSize) {
        break;
      }
    }

    return Response.json(
      { success: true, records, canDelete },
      { headers: { "Cache-Control": "no-store" } }
    );

  } catch (error) {
    console.error("In-Take Records:", error);

    return Response.json(
      { error: "Unable to load In-Take records." },
      { status: 500 }
    );
  }
}

// WORKSHOP_INTAKE_EDIT_DELETE_V1

function mutationError(message, status = 400) {
  return Response.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" }
    }
  );
}

function databaseMutationError(error) {
  console.error("In-Take mutation:", error);

  if (error.code === "P0001") {
    return mutationError(error.message, 409);
  }

  if (error.code === "23503") {
    return mutationError(
      "Related records prevent this operation.",
      409
    );
  }

  return mutationError(
    "Unable to complete the requested operation.",
    500
  );
}

function validJobId(value) {
  return typeof value === "string" &&
    /^JOB-[0-9]+$/.test(value);
}

function validOrigin(request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

export async function PUT(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/intake/records",
    "PUT"
  );

  if (managerAccessDenied) return managerAccessDenied;

  try {

    const auth = await requireWorkshopManagerAccess();

    if (!auth.authorized) {
      return mutationError(auth.error, auth.status);
    }

    if (!validOrigin(request)) {
      return mutationError("Invalid request origin.", 403);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return mutationError("Invalid request body.");
    }

    if (!body || typeof body !== "object") {
      return mutationError("Invalid request body.");
    }

    const {
      jobId,
      customerId,
      make,
      model,
      plate,
      approximateCost,
      notes,
      intakeDate
    } = body;

    if (!validJobId(jobId)) {
      return mutationError("Invalid Job Card number.");
    }

    if (
      typeof customerId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)
    ) {
      return mutationError("Please select a valid customer.");
    }

    const normalizedMake =
      typeof make === "string" ? make.trim() : "";

    const normalizedModel =
      typeof model === "string" ? model.trim() : "";

    const normalizedPlate =
      typeof plate === "string"
        ? plate.trim().toUpperCase().replace(/ +/g, " ")
        : "";

    if (!normalizedMake || normalizedMake.length > 100) {
      return mutationError("Car Make / Brand is required.");
    }

    if (!normalizedModel || normalizedModel.length > 100) {
      return mutationError("Vehicle Model is required.");
    }

    if (
      !/^[\p{L}]+(?: +[\p{L}]+)* [0-9]{1,10}$/u.test(normalizedPlate) ||
      normalizedPlate.length > 21
    ) {
      return mutationError("Invalid vehicle plate.");
    }

    if (
      !["number", "string"].includes(typeof approximateCost) ||
      !/^\d+(\.\d{1,2})?$/.test(String(approximateCost))
    ) {
      return mutationError("Invalid approximate cost.");
    }

    const cost = Number(approximateCost);


    if (
      !Number.isFinite(cost) ||
      cost < 0 ||
      cost > 999999999999.99
    ) {
      return mutationError("Invalid approximate cost.");
    }

    if (
      typeof intakeDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(intakeDate)
    ) {
      return mutationError("Invalid In-Take date.");
    }

    const parsedDate = new Date(intakeDate + "T00:00:00Z");

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== intakeDate
    ) {
      return mutationError("Invalid In-Take date.");
    }

    if (
      notes != null &&
      (typeof notes !== "string" || notes.length > 5000)
    ) {
      return mutationError("Invalid comments.");
    }

    const { data, error } = await supabaseAdmin.rpc(
      "update_workshop_intake",
      {
        p_job_id: jobId,
        p_customer_id: customerId,
        p_make: normalizedMake,
        p_model: normalizedModel,
        p_plate: normalizedPlate,
        p_approximate_cost: cost,
        p_notes: notes || "",
        p_intake_date: intakeDate
      }
    );

    if (error) {
      return databaseMutationError(error);
    }

    return Response.json({
      success: true,
      jobId: data,
      message: "In-Take updated successfully."
    });

  } catch (error) {
    console.error("Update In-Take:", error);
    return mutationError("Unable to update In-Take.", 500);
  }
}

export async function DELETE(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/intake/records",
    "DELETE"
  );

  if (managerAccessDenied) return managerAccessDenied;

  try {

    const auth = await requireWorkshopAdmin();

    if (!auth.authorized) {
      return mutationError(auth.error, auth.status);
    }

    if (!validOrigin(request)) {
      return mutationError("Invalid request origin.", 403);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return mutationError("Invalid request body.");
    }

    const jobId = body?.jobId;

    if (!validJobId(jobId)) {
      return mutationError("Invalid Job Card number.");
    }

    if (body?.confirmation !== jobId) {
      return mutationError("Deletion confirmation is required.");
    }

    const { data, error } = await supabaseAdmin.rpc(
      "delete_workshop_intake",
      { p_job_id: jobId }
    );

    if (error) {
      return databaseMutationError(error);
    }

    return Response.json({
      success: true,
      jobId: data,
      message: "In-Take permanently deleted."
    });

  } catch (error) {
    console.error("Delete In-Take:", error);
    return mutationError("Unable to delete In-Take.", 500);
  }
}
