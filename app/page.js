"use client";

import { useEffect, useMemo, useState } from "react";
import ExpenseForm from "@/app/components/ExpenseForm";
import ExpenseFilters from "@/app/components/ExpenseFilters";
import ExpenseList from "@/app/components/ExpenseList";
import { formatCurrency } from "@/app/lib/utils";

export default function HomePage() {
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sort, setSort] = useState("date_desc");

  async function fetchExpenses() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/expenses", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load expenses.");
      }

      setAllExpenses(result.expenses || []);
    } catch (err) {
      setError(err.message || "Failed to fetch expenses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(allExpenses.map((expense) => expense.category))].sort();
  }, [allExpenses]);

  const visibleExpenses = useMemo(() => {
    let filtered = [...allExpenses];

    if (categoryFilter !== "All") {
      filtered = filtered.filter(
        (expense) => expense.category === categoryFilter,
      );
    }

    if (sort === "date_desc") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === "date_asc") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return filtered;
  }, [allExpenses, categoryFilter, sort]);

  const total = useMemo(() => {
    return visibleExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );
  }, [visibleExpenses]);

  return (
    <main className="container">
      <h1>Expense Tracker</h1>

      <ExpenseForm onExpenseAdded={fetchExpenses} />

      <ExpenseFilters
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        sort={sort}
        setSort={setSort}
      />

      <div className="card total">
        <strong>Total:</strong> {formatCurrency(total)}
      </div>

      <ExpenseList expenses={visibleExpenses} loading={loading} error={error} />
    </main>
  );
}
