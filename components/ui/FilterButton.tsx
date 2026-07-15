import type { ReactNode } from "react";

interface FilterButtonProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function FilterButton({
  children,
  active = false,
  onClick,
  disabled = false,
}: FilterButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        relative overflow-hidden

        rounded-2xl
        border
        px-5 py-3

        text-sm font-semibold
        uppercase tracking-[0.12em]

        backdrop-blur-xl
        transition-all duration-300

        disabled:cursor-not-allowed
        disabled:opacity-50

        ${
          active
            ? `
              border-primary-light/50
              bg-card-hover
              text-white
              shadow-[0_0_24px_rgba(21,174,245,0.18)]
            `
            : `
              border-border
              bg-card
              text-muted

              hover:border-border-strong
              hover:bg-card-hover
              hover:text-foreground
            `
        }
      `}
    >
      <span
        className={`
          ${active ? "metal-text metal-glow" : ""}
        `}
      >
        {children}
      </span>

      {active && (
        <div
          className="
            absolute inset-x-4 bottom-0
            h-px

            bg-gradient-to-r
            from-transparent
            via-primary-light
            to-transparent
          "
        />
      )}
    </button>
  );
}