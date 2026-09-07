import { supabaseServer } from "../../../../lib/supabaseServer";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return Response.json(
        { error: "Invoice file path is required" },
        { status: 400 },
      );
    }

    if (!path.startsWith("purchases/")) {
      return Response.json(
        { error: "Invalid invoice file path" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseServer.storage
      .from("purchase-invoices")
      .createSignedUrl(path, 300);

    if (error) {
      console.error("Purchase invoice signed URL error:", error);

      return Response.json(
        {
          error: "Failed to create invoice viewing link",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return Response.json({ url: data.signedUrl });
  } catch (error) {
    console.error("Purchase invoice viewing error:", error);

    return Response.json(
      {
        error: "Failed to open purchase invoice",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
