import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

const VAT_RATE = 15;

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

export async function GET() {
  try {
    const { data: quotations, error: quotationsError } = await supabaseServer
      .from("quotations")
      .select("*")
      .order("created_at", { ascending: false });

    if (quotationsError) {
      console.error("Quotations GET error:", quotationsError);

      return NextResponse.json(
        {
          error: "Failed to fetch quotations.",
          details: quotationsError.message,
        },
        { status: 500 },
      );
    }

    if (!quotations || quotations.length === 0) {
      return NextResponse.json([]);
    }

    const quotationIds = quotations.map((quotation) => quotation.id);

    const { data: items, error: itemsError } = await supabaseServer
      .from("quotation_items")
      .select("*")
      .in("quotation_id", quotationIds)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error("Quotation items GET error:", itemsError);

      return NextResponse.json(
        {
          error: "Failed to fetch quotation items.",
          details: itemsError.message,
        },
        { status: 500 },
      );
    }

    const { data: terms, error: termsError } = await supabaseServer
      .from("quotation_terms")
      .select("*")
      .in("quotation_id", quotationIds)
      .order("line_number", { ascending: true });

    if (termsError) {
      console.error("Quotation terms GET error:", termsError);

      return NextResponse.json(
        {
          error: "Failed to fetch quotation terms.",
          details: termsError.message,
        },
        { status: 500 },
      );
    }

    const itemsByQuotation = new Map();
    const termsByQuotation = new Map();

    for (const item of items || []) {
      if (!itemsByQuotation.has(item.quotation_id)) {
        itemsByQuotation.set(item.quotation_id, []);
      }

      itemsByQuotation.get(item.quotation_id).push(item);
    }

    for (const term of terms || []) {
      if (!termsByQuotation.has(term.quotation_id)) {
        termsByQuotation.set(term.quotation_id, []);
      }

      termsByQuotation.get(term.quotation_id).push(term);
    }

    const result = quotations.map((quotation) => ({
      ...quotation,
      items: itemsByQuotation.get(quotation.id) || [],
      terms: termsByQuotation.get(quotation.id) || [],
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Quotations GET request error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch quotations.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  let createdQuotationId = null;

  try {
    const body = await request.json();

    const customerName = String(body.customerName || "").trim();

    const address = String(body.address || "").trim();

    const contactNumber = String(body.contactNumber || "").trim();

    const email = String(body.email || "").trim();

    const items = Array.isArray(body.items) ? body.items : [];

    const terms = Array.isArray(body.terms) ? body.terms : [];

    if (!customerName) {
      return NextResponse.json(
        {
          error: "Customer / Company is required.",
        },
        { status: 400 },
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        {
          error: "At least one quotation item is required.",
        },
        { status: 400 },
      );
    }

    /*
     * Clean and calculate quotation items.
     *
     * Amount = Quantity × Unit Price
     * VAT = Amount × 15%
     * Total = Amount + VAT
     */
    const cleanedItems = items.map((item, index) => {
      const serialNumber = String(item.serialNumber ?? index + 1).trim();

      const description = String(item.description || "").trim();

      const quantity = Number(item.quantity || 0);

      const unitPrice = Number(item.unitPrice || 0);

      if (!description) {
        throw new Error(`Description is required for item ${index + 1}.`);
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(
          `Quantity must be greater than zero for item ${index + 1}.`,
        );
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error(
          `Unit Price must be a valid positive number for item ${index + 1}.`,
        );
      }

      const amount = roundMoney(quantity * unitPrice);

      const vatAmount = roundMoney(amount * (VAT_RATE / 100));

      const total = roundMoney(amount + vatAmount);

      return {
        serial_number: serialNumber,
        description,
        quantity,
        unit_price: roundMoney(unitPrice),
        amount,
        vat_rate: VAT_RATE,
        vat_amount: vatAmount,
        total,
      };
    });

    /*
     * Terms and Conditions.
     *
     * The first line is always controlled by
     * the server and cannot be changed or deleted.
     */
    const cleanedTerms = [
      {
        line_number: 1,
        term_text: "Bank Information - IBAN - Talaa Fahir",
        is_hardcoded: true,
      },
      ...terms
        .map((term) => String(term || "").trim())
        .filter(Boolean)
        .map((term, index) => ({
          line_number: index + 2,
          term_text: term,
          is_hardcoded: false,
        })),
    ];

    /*
     * Generate the quotation number inside
     * PostgreSQL.
     *
     * Example:
     * 0001.09.2026
     */
    const { data: quotationNumber, error: quotationNumberError } =
      await supabaseServer.rpc("generate_quotation_no");

    if (quotationNumberError) {
      console.error("Quotation number generation error:", quotationNumberError);

      return NextResponse.json(
        {
          error: "Failed to generate quotation number.",
          details: quotationNumberError.message,
        },
        { status: 500 },
      );
    }

    /*
     * Create the main quotation.
     */
    const { data: quotationData, error: quotationError } = await supabaseServer
      .from("quotations")
      .insert({
        quotation_no: quotationNumber,
        customer_name: customerName,
        address,
        contact_number: contactNumber,
        email,
      })
      .select()
      .single();

    if (quotationError) {
      console.error("Quotation POST error:", quotationError);

      return NextResponse.json(
        {
          error: "Failed to create quotation.",
          details: quotationError.message,
        },
        { status: 500 },
      );
    }

    createdQuotationId = quotationData.id;

    /*
     * Create quotation items.
     */
    const quotationItems = cleanedItems.map((item) => ({
      quotation_id: quotationData.id,
      serial_number: item.serial_number,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.amount,
      vat_rate: item.vat_rate,
      vat_amount: item.vat_amount,
      total: item.total,
    }));

    const { data: itemsData, error: itemsError } = await supabaseServer
      .from("quotation_items")
      .insert(quotationItems)
      .select();

    if (itemsError) {
      console.error("Quotation items POST error:", itemsError);

      await supabaseServer
        .from("quotations")
        .delete()
        .eq("id", quotationData.id);

      createdQuotationId = null;

      return NextResponse.json(
        {
          error: "Failed to create quotation items.",
          details: itemsError.message,
        },
        { status: 500 },
      );
    }

    /*
     * Create Terms and Conditions.
     */
    const quotationTerms = cleanedTerms.map((term) => ({
      quotation_id: quotationData.id,
      line_number: term.line_number,
      term_text: term.term_text,
      is_hardcoded: term.is_hardcoded,
    }));

    const { data: termsData, error: termsError } = await supabaseServer
      .from("quotation_terms")
      .insert(quotationTerms)
      .select();

    if (termsError) {
      console.error("Quotation terms POST error:", termsError);

      await supabaseServer
        .from("quotations")
        .delete()
        .eq("id", quotationData.id);

      createdQuotationId = null;

      return NextResponse.json(
        {
          error: "Failed to create quotation terms.",
          details: termsError.message,
        },
        { status: 500 },
      );
    }

    /*
     * Return the complete quotation.
     */
    return NextResponse.json(
      {
        ...quotationData,
        items: itemsData || [],
        terms: termsData || [],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Quotations POST request error:", error);

    /*
     * Clean up the quotation if something
     * failed after it was created.
     */
    if (createdQuotationId) {
      await supabaseServer
        .from("quotations")
        .delete()
        .eq("id", createdQuotationId);
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to create quotation.",
      },
      { status: 400 },
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    const quotationId = String(body.id || "").trim();
    const customerName = String(body.customerName || "").trim();
    const address = String(body.address || "").trim();
    const contactNumber = String(body.contactNumber || "").trim();
    const email = String(body.email || "").trim();
    const items = Array.isArray(body.items) ? body.items : [];
    const terms = Array.isArray(body.terms) ? body.terms : [];

    if (!quotationId) {
      return NextResponse.json(
        { error: "Quotation ID is required." },
        { status: 400 },
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { error: "Customer / Company is required." },
        { status: 400 },
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "At least one quotation item is required." },
        { status: 400 },
      );
    }

    const cleanedItems = items.map((item, index) => {
      const serialNumber = String(item.serialNumber ?? index + 1).trim();

      const description = String(item.description || "").trim();
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);

      if (!description) {
        throw new Error(`Description is required for item ${index + 1}.`);
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(
          `Quantity must be greater than zero for item ${index + 1}.`,
        );
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error(
          `Unit Price must be a valid number for item ${index + 1}.`,
        );
      }

      const amount = roundMoney(quantity * unitPrice);
      const vatAmount = roundMoney(amount * (VAT_RATE / 100));
      const total = roundMoney(amount + vatAmount);

      return {
        serial_number: serialNumber,
        description,
        quantity,
        unit_price: roundMoney(unitPrice),
        amount,
        vat_rate: VAT_RATE,
        vat_amount: vatAmount,
        total,
      };
    });

    const cleanedTerms = [
      {
        line_number: 1,
        term_text: "Bank Information - IBAN - Talaa Fahir",
        is_hardcoded: true,
      },
      ...terms
        .map((term) => String(term || "").trim())
        .filter(Boolean)
        .map((term, index) => ({
          line_number: index + 2,
          term_text: term,
          is_hardcoded: false,
        })),
    ];

    const { data: quotationData, error: quotationError } = await supabaseServer
      .from("quotations")
      .update({
        customer_name: customerName,
        address,
        contact_number: contactNumber,
        email,
      })
      .eq("id", quotationId)
      .select()
      .single();

    if (quotationError) {
      console.error("Quotation PUT error:", quotationError);

      return NextResponse.json(
        {
          error: "Failed to update quotation.",
          details: quotationError.message,
        },
        { status: 500 },
      );
    }

    const { error: deleteItemsError } = await supabaseServer
      .from("quotation_items")
      .delete()
      .eq("quotation_id", quotationId);

    if (deleteItemsError) {
      console.error("Quotation items DELETE error:", deleteItemsError);

      return NextResponse.json(
        {
          error: "Failed to replace quotation items.",
          details: deleteItemsError.message,
        },
        { status: 500 },
      );
    }

    const quotationItems = cleanedItems.map((item) => ({
      quotation_id: quotationId,
      serial_number: item.serial_number,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.amount,
      vat_rate: item.vat_rate,
      vat_amount: item.vat_amount,
      total: item.total,
    }));

    const { data: itemsData, error: itemsError } = await supabaseServer
      .from("quotation_items")
      .insert(quotationItems)
      .select();

    if (itemsError) {
      console.error("Quotation items PUT error:", itemsError);

      return NextResponse.json(
        {
          error: "Failed to update quotation items.",
          details: itemsError.message,
        },
        { status: 500 },
      );
    }

    const { error: deleteTermsError } = await supabaseServer
      .from("quotation_terms")
      .delete()
      .eq("quotation_id", quotationId);

    if (deleteTermsError) {
      console.error("Quotation terms DELETE error:", deleteTermsError);

      return NextResponse.json(
        {
          error: "Failed to replace quotation terms.",
          details: deleteTermsError.message,
        },
        { status: 500 },
      );
    }

    const { data: termsData, error: termsError } = await supabaseServer
      .from("quotation_terms")
      .insert(
        cleanedTerms.map((term) => ({
          quotation_id: quotationId,
          line_number: term.line_number,
          term_text: term.term_text,
          is_hardcoded: term.is_hardcoded,
        })),
      )
      .select();

    if (termsError) {
      console.error("Quotation terms PUT error:", termsError);

      return NextResponse.json(
        {
          error: "Failed to update quotation terms.",
          details: termsError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ...quotationData,
        items: itemsData || [],
        terms: termsData || [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Quotations PUT request error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to update quotation.",
      },
      { status: 400 },
    );
  }
}
