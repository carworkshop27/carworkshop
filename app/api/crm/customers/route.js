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

export async function POST(request) {
  try {
    const body = await request.json();

    const { first_name, last_name, phone, email, address, city, country } =
      body;

    if (!first_name || !last_name) {
      return Response.json(
        {
          error: "First name and last name are required",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("crm_customers")
      .insert([
        {
          first_name,
          last_name: last_name || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
          city: city || null,
          country: country || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("CRM customer POST error:", error);

      return Response.json(
        {
          error: "Failed to create CRM customer",
        },
        { status: 500 },
      );
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("CRM customer POST request error:", error);

    return Response.json(
      {
        error: "Invalid request",
      },
      { status: 400 },
    );
  }
}
