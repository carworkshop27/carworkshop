import { enforceManagerApiAccess } from "../../../../lib/managerApiGuard";
import "server-only";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

import {
  requireWorkshopManagerAccess
} from "../../../../lib/workshopAuth";

export const dynamic = "force-dynamic";

// WORKSHOP_JOB_FINANCIAL_SUMMARY_V1

function reply(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function GET(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/jobs/financial-summary",
    "GET"
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

    const url = new URL(request.url);

    const jobId =
      (url.searchParams.get("jobId") || "").trim();

    if (!jobId || jobId.length > 100) {
      return reply(
        { error: "Valid Job Card ID is required." },
        400
      );
    }

    const { data, error } = await supabaseAdmin
      .from("workshop_job_financial_summary")
      .select(`
        job_id,
        customer_id,
        approximate_cost,
        confirmed_final_cost,
        ledger_cost,
        total_paid,
        total_debit,
        total_credit,
        outstanding_balance,
        calculated_payment_status,
        cost_status,
        currency,
        vat_included
      `)
      .eq("job_id", jobId)
      .maybeSingle();

    if (error) {
      console.error(
        "Job Financial Summary GET:",
        error.message
      );

      return reply(
        { error: "Unable to load Job Card financial information." },
        500
      );
    }

    if (!data) {
      return reply(
        {
          error: "Linked Job Card financial information not found."
        },
        404
      );
    }

    return reply({
      success: true,
      financial: data
    });

  } catch (error) {
    console.error(
      "Job Financial Summary request error:",
      error?.message
    );

    return reply(
      { error: "Unable to load financial information." },
      500
    );
  }
}
