"use client";

import { formatCurrency } from "@/app/lib/utils";

export default function ExpenseList({ expenses, loading, error }) {
  if (loading) {
    return <div className="card">Loading expenses...</div>;
  }

  if (error) {
    return <div className="card error">{error}</div>;
  }

  if (!expenses.length) {
    return <div className="card">No expenses found.</div>;
  }

  return (
    <div className="card">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.date}</td>
              <td>{expense.category}</td>
              <td>{expense.description}</td>
              <td>{formatCurrency(expense.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
