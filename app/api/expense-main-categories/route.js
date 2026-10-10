import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("expense_main_categories")
      .select("id, name_en, name_ar")
      .order("name_en", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to load main categories." },
      { status: 500 },
    );
  }
}
