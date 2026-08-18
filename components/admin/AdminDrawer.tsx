"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: number | string;
}

export function AdminDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 560
}: AdminDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end"
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(28, 35, 51, 0.45)",
          animation: "fadeIn 0.15s ease-out"
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: "relative",
          width: typeof width === "number" ? `min(${width}px, 100vw)` : width,
          maxWidth: "100vw",
          height: "100%",
          backgroundColor: "#FFFFFF",
          borderLeft: "1px solid var(--admin-slate-200)",
          boxShadow: "-8px 0 24px rgba(28, 35, 51, 0.08)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 1001
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--admin-slate-200)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            backgroundColor: "#FFFFFF"
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "18px",
                color: "var(--admin-ink)",
                margin: 0,
                fontWeight: 600,
                letterSpacing: "-0.01em"
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--admin-slate-600)" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#F7F8FA",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: 6,
              width: 28,
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--admin-slate-600)",
              transition: "all 0.12s ease"
            }}
            title="Close Drawer (Esc)"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Drawer Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px"
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
