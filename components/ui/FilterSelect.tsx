"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { HiChevronDown } from "react-icons/hi2";

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  filterField: string;
  options: Option[];
  className?: string;
}

export default function FilterSelect({
  label,
  filterField,
  options,
  className = "",
}: FilterSelectProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentValue = searchParams.get(filterField) ?? "";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(filterField, value);
    } else {
      params.delete(filterField);
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
          <option value="" className="bg-primary-dark text-foreground">
            All
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
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
