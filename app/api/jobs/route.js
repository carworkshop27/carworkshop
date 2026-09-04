import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Jobs GET error:", error);

      return Response.json(
        {
          error: "Failed to fetch jobs",
        },
        { status: 500 },
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("Jobs GET request error:", error);

    return Response.json(
      {
        error: "Failed to fetch jobs",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const job = await request.json();

    const { data, error } = await supabase
      .from("jobs")
      .insert(job)
      .select()
      .single();

    if (error) {
      console.error("Jobs POST error:", error);

      return Response.json(
        {
          error: "Failed to create job",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("Jobs POST request error:", error);

    return Response.json(
      {
        error: "Failed to create job",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        {
          error: "Job ID is required",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Jobs DELETE error:", error);

      return Response.json(
        {
          error: "Failed to delete job",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("Jobs DELETE request error:", error);

    return Response.json(
      {
        error: "Failed to delete job",
      },
      { status: 500 },
    );
  }
}
