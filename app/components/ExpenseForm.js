"use client";

import { useState } from "react";
import { generateIdempotencyKey } from "@/app/lib/utils";

const initialForm = {
  amount: "",
  category: "",
  description: "",
  date: "",
};

export default function ExpenseForm({ onExpenseAdded }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (submitting) return;

    setSubmitting(true);

    try {
      const idempotencyKey = generateIdempotencyKey();

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      setSuccess(
        result.duplicate ? "Expense already recorded." : "Expense added.",
      );
      setForm(initialForm);
      onExpenseAdded();
    } catch (err) {
      setError(err.message || "Failed to save expense.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card form">
      <h2>Add Expense</h2>

      <div className="grid">
        <input
          type="number"
          step="0.01"
          min="0.01"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Add Expense"}
      </button>

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}
    </form>
  );
}
