"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface AdminTablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems?: number;
  totalPages?: number;
  currentCount: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  loading?: boolean;
}

export function AdminTablePagination({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  currentCount,
  hasMore,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
  itemLabel = "items",
  loading = false
}: AdminTablePaginationProps) {
  // Compute total pages from totalPages prop if provided, else from totalItems / pageSize, else estimate
  const computedTotalPages =
    typeof totalPages === "number" && totalPages > 0
      ? totalPages
      : totalItems !== undefined && totalItems > 0
      ? Math.ceil(totalItems / pageSize)
      : hasMore
      ? currentPage + 1
      : Math.max(1, currentPage);
  const startItem = currentCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = (currentPage - 1) * pageSize + currentCount;

  // Generate page numbers with smart ellipsis windowing
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (computedTotalPages <= maxVisible + 2) {
      for (let i = 1; i <= computedTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(computedTotalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < computedTotalPages - 2) {
        pages.push("...");
      }
      if (computedTotalPages > 1) {
        pages.push(computedTotalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className="admin-table-pagination"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "14px",
        padding: "12px 18px",
        backgroundColor: "var(--admin-card, #FFFFFF)",
        borderTop: "1px solid var(--admin-slate-200, #E2E5EA)",
        borderRadius: "0 0 8px 8px",
        flexShrink: 0,
        zIndex: 5
      }}
    >
      {/* Left: Rows Per Page & Counter Context */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "var(--admin-text-muted, #64748B)" }}>
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={loading}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid var(--admin-border-subtle, #E2E8F0)",
              backgroundColor: "var(--admin-surface-bg, #FFFFFF)",
              color: "var(--admin-text-main, #1E293B)",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              outline: "none"
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: "12.5px", color: "var(--admin-text-muted, #64748B)" }}>
          {currentCount > 0 ? (
            <>
              Showing <strong style={{ color: "var(--admin-text-main, #1E293B)" }}>{startItem}</strong> –{" "}
              <strong style={{ color: "var(--admin-text-main, #1E293B)" }}>{endItem}</strong>
              {totalItems ? (
                <> of <strong style={{ color: "var(--admin-text-main, #1E293B)" }}>{totalItems}</strong></>
              ) : null}{" "}
              {itemLabel}
            </>
          ) : (
            `No ${itemLabel} to display`
          )}
        </span>
      </div>

      {/* Right: Pagination Controls & Page Number Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
          title="First Page"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            border: "1px solid var(--admin-border-subtle, #E2E8F0)",
            backgroundColor: "var(--admin-surface-bg, #FFFFFF)",
            color: currentPage === 1 ? "var(--admin-text-muted, #94A3B8)" : "var(--admin-text-main, #1E293B)",
            cursor: currentPage === 1 || loading ? "not-allowed" : "pointer",
            opacity: currentPage === 1 ? 0.45 : 1,
            transition: "all 0.15s ease"
          }}
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "0 10px",
            height: "32px",
            borderRadius: "6px",
            border: "1px solid var(--admin-border-subtle, #E2E8F0)",
            backgroundColor: "var(--admin-surface-bg, #FFFFFF)",
            color: currentPage === 1 ? "var(--admin-text-muted, #94A3B8)" : "var(--admin-text-main, #1E293B)",
            fontSize: "12px",
            fontWeight: 600,
            cursor: currentPage === 1 || loading ? "not-allowed" : "pointer",
            opacity: currentPage === 1 ? 0.45 : 1,
            transition: "all 0.15s ease"
          }}
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </button>

        {/* Numeric Page Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  style={{
                    padding: "0 6px",
                    fontSize: "12px",
                    color: "var(--admin-text-muted, #94A3B8)",
                    userSelect: "none"
                  }}
                >
                  …
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                disabled={loading || isActive}
                style={{
                  minWidth: "32px",
                  height: "32px",
                  padding: "0 8px",
                  borderRadius: "6px",
                  border: isActive ? "1px solid var(--admin-primary, #7A2832)" : "1px solid var(--admin-border-subtle, #E2E8F0)",
                  backgroundColor: isActive ? "var(--admin-primary, #7A2832)" : "var(--admin-surface-bg, #FFFFFF)",
                  color: isActive ? "#FFFFFF" : "var(--admin-text-main, #1E293B)",
                  fontSize: "12.5px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: isActive || loading ? "default" : "pointer",
                  boxShadow: isActive ? "0 2px 6px var(--admin-primary-glow, rgba(122,40,50,0.25))" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasMore || loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "0 10px",
            height: "32px",
            borderRadius: "6px",
            border: "1px solid var(--admin-border-subtle, #E2E8F0)",
            backgroundColor: "var(--admin-surface-bg, #FFFFFF)",
            color: !hasMore ? "var(--admin-text-muted, #94A3B8)" : "var(--admin-text-main, #1E293B)",
            fontSize: "12px",
            fontWeight: 600,
            cursor: !hasMore || loading ? "not-allowed" : "pointer",
            opacity: !hasMore ? 0.45 : 1,
            transition: "all 0.15s ease"
          }}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>

        {/* Last Page (if totalPages is known) */}
        {totalItems && computedTotalPages > 1 && (
          <button
            type="button"
            onClick={() => onPageChange(computedTotalPages)}
            disabled={currentPage >= computedTotalPages || loading}
            title="Last Page"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              border: "1px solid var(--admin-border-subtle, #E2E8F0)",
              backgroundColor: "var(--admin-surface-bg, #FFFFFF)",
              color: currentPage >= computedTotalPages ? "var(--admin-text-muted, #94A3B8)" : "var(--admin-text-main, #1E293B)",
              cursor: currentPage >= computedTotalPages || loading ? "not-allowed" : "pointer",
              opacity: currentPage >= computedTotalPages ? 0.45 : 1,
              transition: "all 0.15s ease"
            }}
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
