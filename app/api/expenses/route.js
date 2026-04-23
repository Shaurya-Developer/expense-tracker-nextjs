import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export const dynamic = "force-dynamic";

function validateExpense(body) {
  const errors = [];

  const amount = Number(body.amount);

  if (!body.amount || Number.isNaN(amount) || amount <= 0) {
    errors.push("Amount must be a positive number.");
  }

  if (!body.category || !body.category.trim()) {
    errors.push("Category is required.");
  }

  if (!body.description || !body.description.trim()) {
    errors.push("Description is required.");
  }

  if (!body.date) {
    errors.push("Date is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "Missing Idempotency-Key header." },
        { status: 400 },
      );
    }

    const validation = validateExpense(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(" ") },
        { status: 400 },
      );
    }

    const { data: existingExpense, error: existingError } = await supabase
      .from("expenses")
      .select("*")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 },
      );
    }

    if (existingExpense) {
      return NextResponse.json(
        { expense: existingExpense, duplicate: true },
        { status: 200 },
      );
    }

    const payload = {
      amount: Number(body.amount).toFixed(2),
      category: body.category.trim(),
      description: body.description.trim(),
      date: body.date,
      idempotency_key: idempotencyKey,
    };

    const { data, error } = await supabase
      .from("expenses")
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        const { data: duplicateExpense } = await supabase
          .from("expenses")
          .select("*")
          .eq("idempotency_key", idempotencyKey)
          .single();

        return NextResponse.json(
          { expense: duplicateExpense, duplicate: true },
          { status: 200 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ expense: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create expense." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ expenses: data || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch expenses." },
      { status: 500 },
    );
  }
}
