import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";

export default function CategoryLoading() {
  return (
    <main className="shell shop-page-container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      {/* Category header skeleton */}
      <div style={{ marginBottom: 32, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="skeleton skeleton-line" style={{ width: 120, height: 14, marginBottom: 10 }} />
        <div className="skeleton skeleton-line" style={{ width: 260, height: 36, marginBottom: 12 }} />
        <div className="skeleton skeleton-line" style={{ width: "60%", maxWidth: 480, height: 16 }} />
      </div>

      <ProductGridSkeleton count={8} />
    </main>
  );
}
