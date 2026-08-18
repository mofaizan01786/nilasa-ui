export function ProductDetailSkeleton() {
  return (
    <div className="shell shop-page-container" style={{ paddingTop: 40, paddingBottom: 100 }}>
      {/* Breadcrumb skeleton */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        <div className="skeleton skeleton-line" style={{ width: 60, height: 12 }} />
        <div className="skeleton skeleton-line" style={{ width: 12, height: 12 }} />
        <div className="skeleton skeleton-line" style={{ width: 80, height: 12 }} />
        <div className="skeleton skeleton-line" style={{ width: 12, height: 12 }} />
        <div className="skeleton skeleton-line" style={{ width: 140, height: 12 }} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "48px",
          alignItems: "flex-start"
        }}
      >
        {/* Gallery skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            className="skeleton"
            style={{
              aspectRatio: "3/4",
              borderRadius: 16,
              width: "100%"
            }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  width: 72,
                  height: 96,
                  borderRadius: 8
                }}
              />
            ))}
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="skeleton skeleton-line" style={{ width: 120, height: 12 }} />
          <div className="skeleton skeleton-line" style={{ width: "80%", height: 32 }} />
          <div className="skeleton skeleton-line" style={{ width: 100, height: 24 }} />

          <div style={{ borderTop: "1px solid var(--nilasa-border)", paddingTop: 20 }}>
            <div className="skeleton skeleton-line" style={{ width: 100, height: 14, marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 10 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ width: 48, height: 40, borderRadius: 8 }} />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <div className="skeleton" style={{ flex: 1, height: 48, borderRadius: 8 }} />
            <div className="skeleton" style={{ flex: 1, height: 48, borderRadius: 8 }} />
          </div>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="skeleton skeleton-line" style={{ width: "100%", height: 14 }} />
            <div className="skeleton skeleton-line" style={{ width: "95%", height: 14 }} />
            <div className="skeleton skeleton-line" style={{ width: "70%", height: 14 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
