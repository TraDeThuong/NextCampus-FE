"use client";

interface SidebarBadgeProps {
  count?: number;
}

/**
 * Badge hiển thị số đếm hạng mục cần xử lý trên icon Sidebar.
 * - Ẩn hoàn toàn khi count = 0 hoặc undefined
 * - Hiển thị "99+" khi count > 99
 * - Đặt ở góc trên phải của icon container (absolute positioning)
 */
export function SidebarBadge({ count }: SidebarBadgeProps) {
  if (!count || count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);
  const isCompact = count > 9;

  return (
    <span
      aria-label={`${count} hạng mục cần xử lý`}
      className={`
        pointer-events-none absolute -top-1.5 -right-1.5 z-20
        flex items-center justify-center
        min-w-[18px] h-[18px]
        ${isCompact ? "px-1 rounded-full" : "rounded-full"}
        bg-gradient-to-br from-rose-500 to-red-600
        text-white font-bold leading-none
        shadow-[0_0_8px_rgba(239,68,68,0.6)]
        text-[10px] tracking-tight select-none
        animate-[pulse_2s_ease-in-out_infinite]
      `}
    >
      {label}
    </span>
  );
}
