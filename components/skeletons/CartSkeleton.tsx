export function CartSkeleton() {
  return (
    <div className="shell" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div className="skeleton skeleton-line" style={{ width: 180, height: 32, marginBottom: 28 }} />
      <div className="cart-layout">
        <div className="cart-items-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="cart-item-card" style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div className="skeleton cart-item-img-wrapper" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton skeleton-line" style={{ width: "60%", height: 18 }} />
                <div className="skeleton skeleton-line" style={{ width: "30%", height: 14 }} />
                <div className="skeleton skeleton-line" style={{ width: "40%", height: 14 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="skeleton skeleton-line" style={{ width: "50%", height: 20 }} />
          <div className="skeleton skeleton-line" style={{ width: "100%", height: 14 }} />
          <div className="skeleton skeleton-line" style={{ width: "100%", height: 14 }} />
          <div className="skeleton" style={{ width: "100%", height: 48, borderRadius: 8, marginTop: 12 }} />
        </div>
      </div>
    </div>
  );
}
