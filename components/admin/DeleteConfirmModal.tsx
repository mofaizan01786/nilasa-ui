"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  loading = false
}: DeleteConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!loading) onClose();
        }}
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

      {/* Modal Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--admin-slate-200)",
          borderRadius: 8,
          padding: 24,
          boxShadow: "0 8px 24px rgba(28, 35, 51, 0.12)",
          zIndex: 1101,
          animation: "scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#FDF0EE",
                color: "var(--status-danger)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <AlertTriangle size={16} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--admin-ink)" }}>{title}</h3>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--admin-slate-600)",
              cursor: "pointer",
              padding: 2
            }}
          >
            <X size={15} />
          </button>
        </div>

        <p style={{ color: "var(--admin-slate-600)", fontSize: "13px", lineHeight: 1.5, margin: "0 0 20px" }}>
          Delete &ldquo;<strong style={{ color: "var(--admin-ink)" }}>{itemName}</strong>&rdquo;? This action cannot be undone.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="admin-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="admin-btn-destructive"
          >
            {loading ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
