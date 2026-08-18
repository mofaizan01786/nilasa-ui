"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface AdminToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export function AdminToast({ message, type = "success", onClose }: AdminToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        backgroundColor: isSuccess ? "#1C2333" : "#C4392B",
        color: "#FFFFFF",
        padding: "10px 16px",
        borderRadius: 6,
        boxShadow: "0 4px 12px rgba(28, 35, 51, 0.2)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 9999,
        fontSize: "13px",
        fontWeight: 500,
        animation: "fadeIn 0.15s ease-out"
      }}
      role="alert"
    >
      {isSuccess ? (
        <CheckCircle2 size={16} color="#1E8E5A" strokeWidth={2.5} />
      ) : (
        <AlertCircle size={16} color="#FFFFFF" strokeWidth={2.5} />
      )}
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255, 255, 255, 0.7)",
          cursor: "pointer",
          padding: 2,
          display: "flex",
          alignItems: "center",
          marginLeft: 6
        }}
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </div>
  );
}
