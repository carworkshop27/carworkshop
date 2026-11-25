import { enforceManagerApiAccess } from "../../../lib/managerApiGuard";
import "server-only";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

import {
  requireWorkshopSuperUser, requireWorkshopManagerAccess,
  requireWorkshopInvoiceIssuer as requireWorkshopJobsReadAccess
} from "../../../lib/workshopAuth";

export const dynamic = "force-dynamic";

// WORKSHOP_JOBS_API_SECURITY_V1

const LEGACY_JOB_FIELDS = new Set([
  "id",
  "owner",
  "phone",
  "email",
  "company",
  "make",
  "model",
  "year",
  "color",
  "plate",
  "status",
  "payment_status",
  "issue",
  "date",
  "intake_date",
  "intake_time",
  "created_at",
  "panels",
  "parts",
  "electrical_items",
  "mechanical_items"
]);

function reply(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function validJobId(id) {
  return (
    typeof id === "string" &&
    id.trim().length > 0 &&
    id.length <= 100
  );
}

export async function GET() {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/jobs",
    "GET"
  );

  if (managerAccessDenied) return managerAccessDenied;

  try {
    const auth = await requireWorkshopJobsReadAccess();

    if (!auth.authorized) {
      return reply(
        { error: auth.error },
        auth.status
      );
    }

    const jobs = [];
    const pageSize = 500;

    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabaseAdmin
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error("Jobs GET error:", error.message);

        return reply(
          { error: "Failed to fetch jobs" },
          500
        );
      }

      jobs.push(...(data || []));

      if (!data || data.length < pageSize) {
        break;
      }
    }

    return reply(jobs);

  } catch (error) {
    console.error("Jobs GET request error:", error);

    return reply(
      { error: "Failed to fetch jobs" },
      500
    );
  }
}

export async function POST(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/jobs",
    "POST"
  );

  if (managerAccessDenied) return managerAccessDenied;

  try {
    const auth = await requireWorkshopManagerAccess();

    if (!auth.authorized) {
      return reply(
        { error: auth.error },
        auth.status
      );
    }

    let job;

    try {
      job = await request.json();
    } catch {
      return reply(
        { error: "Invalid request body" },
        400
      );
    }

    if (
      !job ||
      typeof job !== "object" ||
      Array.isArray(job)
    ) {
      return reply(
        { error: "Invalid Job Card data" },
        400
      );
    }

    const unsupportedFields = Object.keys(job).filter(
      (key) => !LEGACY_JOB_FIELDS.has(key)
    );

    if (unsupportedFields.length > 0) {
      return reply(
        {
          error: "Unsupported Job Card fields",
          fields: unsupportedFields
        },
        400
      );
    }

    if (
      !validJobId(job.id) ||
      typeof job.owner !== "string" ||
      !job.owner.trim() ||
      typeof job.plate !== "string" ||
      !job.plate.trim() ||
      typeof job.model !== "string" ||
      !job.model.trim() ||
      typeof job.status !== "string" ||
      !job.status.trim()
    ) {
      return reply(
        { error: "Required Job Card information is missing" },
        400
      );
    }

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .insert(job)
      .select()
      .single();

    if (error) {
      console.error("Jobs POST error:", error.message);

      return reply(
        {
          error:
            error.code === "23505"
              ? "Job Card already exists"
              : "Failed to create job"
        },
        error.code === "23505" ? 409 : 500
      );
    }

    return reply(data, 201);

  } catch (error) {
    console.error("Jobs POST request error:", error);

    return reply(
      { error: "Failed to create job" },
      500
    );
  }
}

export async function DELETE(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/jobs",
    "DELETE"
  );

  if (managerAccessDenied) return managerAccessDenied;

  try {
    const auth = await requireWorkshopSuperUser();

    if (!auth.authorized) {
      return reply(
        { error: auth.error },
        auth.status
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!validJobId(id)) {
      return reply(
        { error: "Valid Job ID is required" },
        400
      );
    }

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .delete()
      .eq("id", id)
      .is("customer_id", null)
      .is("intake_source", null)
      .select();

    if (error) {
      console.error("Jobs DELETE error:", error.message);

      return reply(
        {
          error:
            error.code === "23503"
              ? "Job Card has protected related records"
              : "Failed to delete job"
        },
        error.code === "23503" ? 409 : 500
      );
    }

    if (!data || data.length === 0) {
      return reply(
        {
          error:
            "Job Card not found or protected by In-Take and Customer Ledger."
        },
        409
      );
    }

    return reply(data);

  } catch (error) {
    console.error("Jobs DELETE request error:", error);

    return reply(
      { error: "Failed to delete job" },
      500
    );
  }
}


// WORKSHOP_JOB_STATUS_UPDATE_V1
export async function PATCH(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/jobs",
    "PATCH"
  );

  if (managerAccessDenied) return managerAccessDenied;

  try {
    const auth = await requireWorkshopManagerAccess();

    if (!auth.authorized) {
      return reply({ error: auth.error }, auth.status);
    }

    if (
      request.headers.get("origin") !==
      new URL(request.url).origin
    ) {
      return reply({ error: "Invalid request origin" }, 403);
    }

    const body = await request.json().catch(() => null);
    const jobId = body?.jobId;
    const newStatus = body?.status;

    const allowedStatuses = new Set([
      "In Repair / Workshop",
      "Ready for Pickup"
    ]);

    if (!validJobId(jobId) || !allowedStatuses.has(newStatus)) {
      return reply({ error: "Invalid Job Card or status" }, 400);
    }

    const { data: job, error: readError } = await supabaseAdmin
      .from("jobs")
      .select("id,status")
      .eq("id", jobId)
      .maybeSingle();

    if (readError) {
      return reply({ error: "Unable to read Job Card" }, 500);
    }

    if (!job) {
      return reply({ error: "Job Card not found" }, 404);
    }

    if (job.status === newStatus) {
      return reply({
        success: true,
        id: jobId,
        status: newStatus
      });
    }

    // Only allow the confirmed forward transition.
    if (
      newStatus !== "Ready for Pickup" ||
      job.status !== "In Repair / Workshop"
    ) {
      return reply({
        error: "Status transition requires repair protection validation."
      }, 409);
    }

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId)
      .eq("status", job.status)
      .select("id,status")
      .maybeSingle();

    if (error) {
      console.error("Job status update:", error.message);
      return reply({ error: "Unable to update Job Card" }, 500);
    }

    if (!data) {
      return reply({
        error: "Job Card changed. Please refresh and try again."
      }, 409);
    }

    return reply({
      success: true,
      id: data.id,
      status: data.status
    });

  } catch (error) {
    console.error("Job status PATCH:", error);
    return reply({ error: "Job Card update failed" }, 500);
  }
}
