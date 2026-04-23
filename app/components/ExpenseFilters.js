"use client";

export default function ExpenseFilters({
  categoryFilter,
  setCategoryFilter,
  categories,
  sort,
  setSort,
}) {
  return (
    <div className="card filters">
      <div>
        <label>Filter by category</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Sort</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date_desc">Date (Newest First)</option>
          <option value="date_asc">Date (Oldest First)</option>
        </select>
      </div>
    </div>
  );
}
