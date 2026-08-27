import React from 'react';

// Click to toggle asc/desc sort on a given field. Controlled by parent (sortBy/order state).
export default function SortHeader({ label, field, sortBy, order, onSort, className = '' }) {
  const active = sortBy === field;
  return (
    <th className={`th-cell ${className}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 hover:text-ink transition-colors ${
          active ? 'text-ink' : ''
        }`}
      >
        {label}
        <span className="flex flex-col leading-none text-[9px] -space-y-0.5">
          <span className={active && order === 'asc' ? 'text-brand-600' : 'text-ink/25'}>▲</span>
          <span className={active && order === 'desc' ? 'text-brand-600' : 'text-ink/25'}>▼</span>
        </span>
      </button>
    </th>
  );
}
