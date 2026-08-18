"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { patchProductStatus } from "@/lib/api";
import { ProductStatus } from "@/lib/types";

interface ProductStatusToggleProps {
  productId: number;
  currentStatus: ProductStatus;
  onStatusChange?: (newStatus: ProductStatus) => void;
}

export function ProductStatusToggle({
  productId,
  currentStatus,
  onStatusChange
}: ProductStatusToggleProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ProductStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  async function handleToggle(newStatus: ProductStatus) {
    if (newStatus === status) return;
    setStatus(newStatus);
    setLoading(true);
    const success = await patchProductStatus(productId, newStatus);
    setLoading(false);
    if (success) {
      if (onStatusChange) onStatusChange(newStatus);
      router.refresh();
    } else {
      setStatus(currentStatus);
    }
  }

  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case "published":
        return "#1E8E5A";
      case "draft":
        return "#8A8F98";
      case "archived":
        return "#B45309";
      default:
        return "#8A8F98";
    }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: getStatusColor(),
          flexShrink: 0
        }}
      />
      <select
        value={status}
        disabled={loading}
        onChange={(e) => handleToggle(e.target.value as ProductStatus)}
        style={{
          padding: "3px 8px",
          borderRadius: 4,
          fontSize: "12px",
          fontWeight: 500,
          border: "1px solid var(--admin-slate-200)",
          backgroundColor: "#FFFFFF",
          color: "var(--admin-ink)",
          cursor: loading ? "wait" : "pointer",
          outline: "none",
          transition: "border-color 0.12s ease"
        }}
      >
        <option value="Published">Published</option>
        <option value="Draft">Draft</option>
        <option value="Archived">Archived</option>
      </select>
    </div>
  );
}
