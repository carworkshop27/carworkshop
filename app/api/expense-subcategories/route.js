import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";
import { requireWorkshopSuperUser } from "../../../lib/workshopAuth";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("expense_subcategories")
      .select("id, main_category_id, name_en, name_ar")
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
      { error: error.message || "Unable to load expense types." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireWorkshopSuperUser();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status },
      );
    }

    const body = await request.json();

    const mainCategoryId = String(
      body.mainCategoryId || "",
    ).trim();

    const nameEn = String(body.nameEn || "").trim();
    const nameAr = String(body.nameAr || "").trim();

    if (!mainCategoryId || !nameEn || !nameAr) {
      return NextResponse.json(
        { error: "All three fields are required." },
        { status: 400 },
      );
    }

    const { data: mainCategory, error: mainError } =
      await supabaseServer
        .from("expense_main_categories")
        .select("id")
        .eq("id", mainCategoryId)
        .maybeSingle();

    if (mainError) {
      return NextResponse.json(
        { error: mainError.message },
        { status: 500 },
      );
    }

    if (!mainCategory) {
      return NextResponse.json(
        { error: "Invalid main category." },
        { status: 400 },
      );
    }

    const { data: existing, error: lookupError } =
      await supabaseServer
        .from("expense_subcategories")
        .select("id, name_en");

    if (lookupError) {
      return NextResponse.json(
        { error: lookupError.message },
        { status: 500 },
      );
    }

    const duplicate = (existing || []).some(
      (item) =>
        item.name_en.trim().toLowerCase() ===
        nameEn.toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "Expense type already exists." },
        { status: 409 },
      );
    }

    const { data, error } = await supabaseServer
      .from("expense_subcategories")
      .insert({
        main_category_id: mainCategoryId,
        name_en: nameEn,
        name_ar: nameAr,
      })
      .select("id, main_category_id, name_en, name_ar")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "23505" ? 409 : 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to save expense type." },
      { status: 500 },
    );
  }
}
