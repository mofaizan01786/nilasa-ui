import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";

export default function ShopLoading() {
  return (
    <main className="shell shop-page-container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      {/* Category Pills Header Skeleton */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 16, marginBottom: 28 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: 100, height: 38, borderRadius: 20, flexShrink: 0 }} />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="skeleton skeleton-line" style={{ width: 140, height: 24 }} />
        <div className="skeleton skeleton-line" style={{ width: 100, height: 20 }} />
      </div>

      <ProductGridSkeleton count={8} />
    </main>
  );
}
