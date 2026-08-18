export function ProductCardSkeleton() {
  return (
    <div className="skeleton-product-card">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-body">
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div className="skeleton skeleton-line" style={{ width: "35%", height: 10 }} />
          <div className="skeleton skeleton-line" style={{ width: "25%", height: 10 }} />
        </div>
        <div className="skeleton skeleton-line" style={{ width: "85%", height: 16, margin: "4px 0" }} />
        <div className="skeleton skeleton-line" style={{ width: "40%", height: 14 }} />
      </div>
    </div>
  );
}
