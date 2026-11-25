import { enforceManagerApiAccess } from "../../../../lib/managerApiGuard";
import "server-only";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireWorkshopManagerAccess } from "../../../../lib/workshopAuth";

export const dynamic = "force-dynamic";

// WORKSHOP_JOB_REPAIR_PROTECTION_API_V1

export async function POST(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/jobs/repair-protection",
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
    const jobId = body?.jobId;

    if (
      typeof jobId !== "string" ||
      !jobId.trim() ||
      jobId.length > 100
    ) {
      return Response.json(
        { error: "Invalid Job Card number" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "mark_workshop_repair_started",
      { p_job_id: jobId }
    );

    if (error) {
      console.error("Repair protection failed:", error.message);

      return Response.json(
        { error: "Unable to register repair protection." },
        { status: error.code === "P0001" ? 409 : 500 }
      );
    }

    return Response.json(
      {
        success: true,
        jobId,
        repairStartedAt: data,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Repair protection API:", error);

    return Response.json(
      { error: "Repair protection failed." },
      { status: 500 }
    );
  }
}