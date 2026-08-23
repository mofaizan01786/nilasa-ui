import { notFound } from "next/navigation";
import { fetchProductById } from "@/lib/dotnet-backend";
import { EditProductClient } from "./EditProductClient";

export const dynamic = "force-dynamic"; // SSR page for fresh product data

export default async function AdminEditProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  const product = await fetchProductById(isNaN(numId) ? 1 : numId);

  if (!product) notFound();

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow eyebrow--gold">EDIT SKU #{product.productId || product.id}</span>
          <h1 className="admin-page-title">Edit Product: {product.name}</h1>
        </div>
      </div>

      <div className="admin-card">
        <EditProductClient product={product} />
      </div>
    </div>
  );
}
