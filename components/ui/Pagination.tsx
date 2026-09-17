"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = "",
  showFirstLast = false,
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) {
    return null;
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Phân trang"
      className={`flex flex-wrap items-center justify-between gap-4 w-full text-xs sm:text-sm ${className}`}
    >
      {/* Information text */}
      <div className="text-muted select-none">
        <span>
          Trang <span className="font-semibold text-foreground">{currentPage}</span> /{" "}
          <span className="font-semibold text-foreground">{Math.max(1, totalPages)}</span>
        </span>
        {totalItems !== undefined && (
          <span className="ml-1.5 opacity-80">
            · Tổng <span className="font-semibold text-foreground">{totalItems}</span>
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {showFirstLast && (
          <button
            type="button"
            onClick={() => handlePageClick(1)}
            disabled={currentPage <= 1}
            aria-label="Trang đầu tiên"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-border bg-card text-muted transition-all hover:bg-card-hover hover:text-foreground active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
          >
            <ChevronsLeft className="h-4 w-4 shrink-0" />
          </button>
        )}

        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Trang trước"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-border bg-card text-muted transition-all hover:bg-card-hover hover:text-foreground active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
        </button>

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center text-muted select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => handlePageClick(pageNum)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Trang ${pageNum}`}
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light cursor-pointer ${
                isActive
                  ? "bg-primary-main text-white font-semibold shadow-soft border border-primary-light/40"
                  : "border border-border bg-card text-muted hover:bg-card-hover hover:text-foreground"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Trang tiếp theo"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-border bg-card text-muted transition-all hover:bg-card-hover hover:text-foreground active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
        >
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>

        {showFirstLast && (
          <button
            type="button"
            onClick={() => handlePageClick(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="Trang cuối cùng"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-border bg-card text-muted transition-all hover:bg-card-hover hover:text-foreground active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
          >
            <ChevronsRight className="h-4 w-4 shrink-0" />
          </button>
        )}
      </div>
    </nav>
  );
}
