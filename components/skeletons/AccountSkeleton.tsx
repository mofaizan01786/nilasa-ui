export function AccountSkeleton() {
  return (
    <div className="shell" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div className="skeleton skeleton-line" style={{ width: 160, height: 28, marginBottom: 8 }} />
          <div className="skeleton skeleton-line" style={{ width: 220, height: 14 }} />
        </div>
        <div className="skeleton" style={{ width: 90, height: 38, borderRadius: 8 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 36 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 110, borderRadius: 12 }} />
        ))}
      </div>

      <div className="skeleton skeleton-line" style={{ width: 140, height: 22, marginBottom: 16 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  );
}
