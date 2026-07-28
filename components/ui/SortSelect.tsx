"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { HiChevronDown } from "react-icons/hi2";

interface SortOption {
  sortBy: string;
  order: string;
  label: string;
}

interface SortSelectProps {
  label: string;
  options: SortOption[];
  sortByField?: string;
  orderField?: string;
  className?: string;
}

export default function SortSelect({
  label,
  options,
  sortByField = "sortBy",
  orderField = "order",
  className = "",
}: SortSelectProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentSortBy = searchParams.get(sortByField) ?? "";
  const currentOrder = searchParams.get(orderField) ?? "";

  const currentValue = currentSortBy && currentOrder
    ? `${currentSortBy}:${currentOrder}`
    : "";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      const [sortBy, order] = value.split(":");
      params.set(sortByField, sortBy);
      params.set(orderField, order);
    } else {
      params.delete(sortByField);
      params.delete(orderField);
    }

    if (params.get("page")) {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className={`flex w-full flex-col gap-3 ${className}`}>
      <label
        className="
          metal-text metal-glow
          text-sm font-semibold
          uppercase tracking-[0.18em]
        "
      >
        {label}
      </label>

      <div className="relative">
        <select
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          className="appearance-none w-full rounded-2xl border border-border bg-card px-5 py-3 pr-12 text-base font-medium text-foreground shadow-glass backdrop-blur-xl transition-all duration-300 hover:border-border-strong hover:bg-card-hover focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] outline-none"
        >
          {options.map((option) => (
            <option
              key={`${option.sortBy}:${option.order}`}
              value={`${option.sortBy}:${option.order}`}
              className="bg-primary-dark text-foreground"
            >
              {option.label}
            </option>
          ))}
        </select>

        <HiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted transition-colors duration-300" />

        <div
          className="
            pointer-events-none
            absolute inset-x-6 top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-primary-light/50
            to-transparent
          "
        />
      </div>
    </div>
  );
}
