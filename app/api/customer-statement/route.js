import { enforceManagerApiAccess } from "../../../lib/managerApiGuard";
import "server-only";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import {
  requireWorkshopSuperUser
} from "../../../lib/workshopAuth";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PAGE_SIZE = 500;

function reply(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function validDate(value) {
  if (!value) return true;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value + "T00:00:00Z");

  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function toCents(value) {
  const cents = Math.round(Number(value ?? 0) * 100);

  if (!Number.isSafeInteger(cents)) {
    throw new Error("Invalid financial amount.");
  }

  return cents;
}

function addCents(a, b) {
  const result = a + b;

  if (!Number.isSafeInteger(result)) {
    throw new Error("Financial amount exceeds safe range.");
  }

  return result;
}

function money(cents) {
  return cents / 100;
}

async function loadCustomers() {
  const customers = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabaseAdmin
      .from("customer_statement_balances")
      .select("*")
      .order("customer_name", { ascending: true })
      .order("customer_id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;

    customers.push(...(data || []));

    if (!data || data.length < PAGE_SIZE) break;
  }

  return customers;
}

async function loadTransactions(customerId) {
  const transactions = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabaseAdmin
      .from("customer_statement_transactions")
      .select(`
        id,
        customer_id,
        job_id,
        transaction_date,
        transaction_type,
        description,
        debit,
        credit,
        reference_no,
        created_at
      `)
      .eq("customer_id", customerId)
      .order("transaction_date", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;

    transactions.push(...(data || []));

    if (!data || data.length < PAGE_SIZE) break;
  }

  return transactions;
}

export async function GET(request) {
  const managerAccessDenied = await enforceManagerApiAccess(
    "/api/customer-statement",
    "GET"
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

    const url = new URL(request.url);

    const customerId =
      url.searchParams.get("customerId") || "";

    const dateFrom =
      url.searchParams.get("dateFrom") || "";

    const dateTo =
      url.searchParams.get("dateTo") || "";

    if (!customerId) {
      const customers = await loadCustomers();

      return reply({
        success: true,
        customers
      });
    }

    if (!UUID_PATTERN.test(customerId)) {
      return reply(
        { error: "Invalid customer ID." },
        400
      );
    }

    if (!validDate(dateFrom) || !validDate(dateTo)) {
      return reply(
        { error: "Invalid statement date." },
        400
      );
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
      return reply(
        { error: "Date From cannot exceed Date To." },
        400
      );
    }

    const { data: customer, error: customerError } =
      await supabaseAdmin
        .from("customer_statement_balances")
        .select("*")
        .eq("customer_id", customerId)
        .maybeSingle();

    if (customerError) throw customerError;

    if (!customer) {
      return reply(
        { error: "Customer not found." },
        404
      );
    }

    const allTransactions =
      await loadTransactions(customerId);

    let openingBalance = 0;
    let periodDebit = 0;
    let periodCredit = 0;
    let lifetimeDebit = 0;
    let lifetimeCredit = 0;
    let runningBalance = 0;

    const transactions = [];

    for (const row of allTransactions) {
      const debit = toCents(row.debit);
      const credit = toCents(row.credit);

      const net = addCents(debit, -credit);

      lifetimeDebit = addCents(lifetimeDebit, debit);
      lifetimeCredit = addCents(lifetimeCredit, credit);

      if (dateFrom && row.transaction_date < dateFrom) {
        openingBalance = addCents(openingBalance, net);
        runningBalance = addCents(runningBalance, net);
        continue;
      }

      if (dateTo && row.transaction_date > dateTo) {
        continue;
      }

      periodDebit = addCents(periodDebit, debit);
      periodCredit = addCents(periodCredit, credit);
      runningBalance = addCents(runningBalance, net);

      transactions.push({
        ...row,
        debit: money(debit),
        credit: money(credit),
        running_balance: money(runningBalance)
      });
    }

    const closingBalance = addCents(
      addCents(openingBalance, periodDebit),
      -periodCredit
    );

    return reply({
      success: true,

      customer,

      filters: {
        dateFrom: dateFrom || null,
        dateTo: dateTo || null
      },

      summary: {
        opening_balance: money(openingBalance),
        period_debit: money(periodDebit),
        period_credit: money(periodCredit),
        closing_balance: money(closingBalance),

        total_debit: money(lifetimeDebit),
        total_credit: money(lifetimeCredit),

        outstanding_balance: money(
          addCents(lifetimeDebit, -lifetimeCredit)
        ),

        total_invoices: Number(customer.total_invoices || 0), total_job_cards: Number(
          customer.total_job_cards || 0
        ),

        transaction_count: transactions.length
      },

      transactions
    });

  } catch (error) {
    console.error(
      "Customer Statement GET:",
      error?.message
    );

    return reply(
      { error: "Unable to load Customer Statement." },
      500
    );
  }
}
