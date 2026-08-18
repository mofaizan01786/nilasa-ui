"use client";

import { OrderStatus } from "@/lib/types";

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  showStepper?: boolean;
}

const STEPS: { key: string; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" }
];

export function OrderStatusBadge({ status, showStepper = false }: OrderStatusBadgeProps) {
  const normStatus = (status || "").toLowerCase();

  const getBadgeClass = () => {
    switch (normStatus) {
      case "pending":
        return "status-badge--pending";
      case "confirmed":
        return "status-badge--confirmed";
      case "shipped":
        return "status-badge--shipped";
      case "delivered":
      case "completed":
        return "status-badge--delivered";
      case "cancelled":
      case "failed":
        return "status-badge--cancelled";
      default:
        return "status-badge--draft";
    }
  };

  const getLabel = () => {
    if (!status) return "Draft";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // If stepper requested (compact horizontal progress line: Pending -> Confirmed -> Shipped -> Delivered)
  if (showStepper && normStatus !== "cancelled" && normStatus !== "failed") {
    let currentStepIdx = 0;
    if (normStatus === "confirmed") currentStepIdx = 1;
    else if (normStatus === "shipped") currentStepIdx = 2;
    else if (normStatus === "delivered" || normStatus === "completed") currentStepIdx = 3;

    return (
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={`status-badge ${getBadgeClass()}`}>
            <span className="status-dot" />
            <span>{getLabel()}</span>
          </span>
          <span style={{ fontSize: "11px", color: "var(--admin-slate-600)" }}>
            Step {currentStepIdx + 1} of 4
          </span>
        </div>

        {/* Compact Progress Line */}
        <div className="order-stepper" title={`Progress: ${getLabel()}`}>
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div key={step.key} className="order-stepper-node" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                <div
                  className={`order-stepper-dot ${isCurrent ? "active" : isCompleted ? "completed" : ""}`}
                  style={{
                    backgroundColor: isCompleted ? (idx === 3 ? "var(--status-delivered)" : "var(--admin-accent)") : "#D1D5DB"
                  }}
                />
                {idx < STEPS.length - 1 && (
                  <div
                    className={`order-stepper-line ${idx < currentStepIdx ? "completed" : ""}`}
                    style={{
                      backgroundColor: idx < currentStepIdx ? "var(--admin-accent)" : "#E5E7EB"
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Standalone accessible Dot + Label badge
  return (
    <span className={`status-badge ${getBadgeClass()}`}>
      <span className="status-dot" />
      <span>{getLabel()}</span>
    </span>
  );
}
