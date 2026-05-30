"use client";

import { cn } from "@/lib/utils";

type Filter = "all" | "urgent" | "approved" | "pending";

interface RequestFiltersProps {
  active: Filter;
  onChange: (filter: Filter) => void;
}

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "urgent", label: "Urgent" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
];

export function RequestFilters({ active, onChange }: RequestFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all",
            active === filter.value
              ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-500/25"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
