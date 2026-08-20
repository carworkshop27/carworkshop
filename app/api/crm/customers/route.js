import { supabase } from "../../../../lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("crm_customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("CRM customers GET error:", error);

    return Response.json(
      {
        error: "Failed to fetch CRM customers",
      },
      { status: 500 },
    );
  }

  return Response.json(data);
}