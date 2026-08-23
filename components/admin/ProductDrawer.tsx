"use client";

import { useState, useEffect, FormEvent, useMemo } from "react";
import Image from "next/image";
import { Product, Category, ProductStatus, ProductVariant, ProductImage } from "@/lib/types";
import { AdminDrawer } from "./AdminDrawer";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant
} from "@/lib/dotnet-backend";
import { resolveProductImageUrl } from "@/lib/catalog";
import {
  Camera,
  UploadCloud,
  Trash2,
  Check,
  X,
  AlertCircle,
  Layers,
  Sparkles,
  RefreshCw,
  Plus
} from "lucide-react";

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  onSaved: (msg?: string) => void;
}

interface StagedFile {
  file: File;
  previewUrl: string;
}

export interface VariantRow {
  productVariantId?: number; // Exists if persisted in backend
  size: string;
  color: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isNew?: boolean;
}

export function ProductDrawer({
  isOpen,
  onClose,
  product,
  categories,
  onSaved
}: ProductDrawerProps) {
  const isEditing = !!product;

  // Basic Product Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<ProductStatus>("Published");
  const [description, setDescription] = useState("");
  const [defaultColor, setDefaultColor] = useState("Indigo Blue");

  // Variant Matrix State
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [batchStockInput, setBatchStockInput] = useState("15");

  // Multi-image management
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});

  // Helper to generate professional SKU
  const generateSkuCode = (productSlug: string, color: string, size: string) => {
    const slugPart = (productSlug || "NIL")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .slice(0, 8);
    const colorPart = (color || "STD")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 3);
    const sizePart = size.toUpperCase().replace(/\s+/g, "");
    return `${slugPart}-${colorPart}-${sizePart}`;
  };

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setBasePrice(String(product.basePrice));
      setCategoryId(String(product.categoryId));
      setStatus(product.status);
      setDescription(product.description || "");
      setExistingImages(product.images || []);

      const primaryColor = product.variants?.[0]?.color || "Indigo Blue";
      setDefaultColor(primaryColor);

      if (product.variants && product.variants.length > 0) {
        setVariants(
          product.variants.map((v) => ({
            productVariantId: v.productVariantId,
            size: v.size,
            color: v.color || primaryColor,
            sku: v.sku || generateSkuCode(product.slug, v.color || primaryColor, v.size),
            price: v.price || product.basePrice,
            stockQuantity: v.stockQuantity ?? 10
          }))
        );
      } else {
        // Fallback standard sizes for existing product without variants
        const standardInit = ["S", "M", "L", "XL"].map((sz) => ({
          size: sz,
          color: primaryColor,
          sku: generateSkuCode(product.slug, primaryColor, sz),
          price: product.basePrice || 4990,
          stockQuantity: 15,
          isNew: true
        }));
        setVariants(standardInit);
      }
    } else {
      // Create mode defaults
      const initSlug = "";
      setName("");
      setSlug(initSlug);
      setBasePrice("4990");
      setCategoryId(categories.length > 0 ? String(categories[0].categoryId || categories[0].id) : "1");
      setStatus("Published");
      setDescription("");
      setDefaultColor("Indigo Blue");
      setExistingImages([]);

      const standardInit = ["S", "M", "L", "XL"].map((sz) => ({
        size: sz,
        color: "Indigo Blue",
        sku: generateSkuCode("PRODUCT", "Indigo Blue", sz),
        price: 4990,
        stockQuantity: 15,
        isNew: true
      }));
      setVariants(standardInit);
    }

    setDeletedVariantIds([]);
    setStagedFiles([]);
    setCustomSizeInput("");
    setError("");
    setFieldErrors({});
  }, [product, categories, isOpen]);

  // Sync slug on title change in Create mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
    if (!isEditing) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(autoSlug);
      if (fieldErrors.slug) setFieldErrors((prev) => ({ ...prev, slug: "" }));

      // Update SKUs of new variants
      setVariants((prev) =>
        prev.map((v) => ({
          ...v,
          sku: generateSkuCode(autoSlug, v.color, v.size)
        }))
      );
    }
  };

  // Toggle Standard Size in Matrix
  const handleToggleSize = (sizeName: string) => {
    const existingIndex = variants.findIndex((v) => v.size.toLowerCase() === sizeName.toLowerCase());

    if (existingIndex >= 0) {
      // Remove size from matrix
      const itemToRemove = variants[existingIndex];
      if (itemToRemove.productVariantId) {
        setDeletedVariantIds((prev) => [...prev, itemToRemove.productVariantId!]);
      }
      setVariants((prev) => prev.filter((_, i) => i !== existingIndex));
    } else {
      // Add size to matrix
      const parsedBasePrice = parseFloat(basePrice) || 4990;
      const parsedStock = parseInt(batchStockInput, 10) || 15;
      const newSku = generateSkuCode(slug, defaultColor, sizeName);

      setVariants((prev) => [
        ...prev,
        {
          size: sizeName,
          color: defaultColor,
          sku: newSku,
          price: parsedBasePrice,
          stockQuantity: parsedStock,
          isNew: true
        }
      ]);
    }
  };

  // Add Custom Size (e.g. 3XL, 32, 34)
  const handleAddCustomSize = () => {
    if (!customSizeInput.trim()) return;
    const trimmedSize = customSizeInput.trim().toUpperCase();

    if (variants.some((v) => v.size.toLowerCase() === trimmedSize.toLowerCase())) {
      setError(`Size "${trimmedSize}" is already in the matrix.`);
      return;
    }

    const parsedBasePrice = parseFloat(basePrice) || 4990;
    const parsedStock = parseInt(batchStockInput, 10) || 15;
    const newSku = generateSkuCode(slug, defaultColor, trimmedSize);

    setVariants((prev) => [
      ...prev,
      {
        size: trimmedSize,
        color: defaultColor,
        sku: newSku,
        price: parsedBasePrice,
        stockQuantity: parsedStock,
        isNew: true
      }
    ]);

    setCustomSizeInput("");
    setError("");
  };

  // Remove individual variant row
  const handleRemoveVariantRow = (index: number) => {
    const itemToRemove = variants[index];
    if (itemToRemove.productVariantId) {
      setDeletedVariantIds((prev) => [...prev, itemToRemove.productVariantId!]);
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Update specific field in variant row
  const handleUpdateVariantField = (
    index: number,
    field: keyof VariantRow,
    value: string | number
  ) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Batch Tool: Apply stock quantity across all active variants
  const handleBatchApplyStock = () => {
    const stockVal = parseInt(batchStockInput, 10);
    if (isNaN(stockVal) || stockVal < 0) {
      setError("Please enter a valid stock quantity for batch fill.");
      return;
    }
    setVariants((prev) =>
      prev.map((v) => ({ ...v, stockQuantity: stockVal }))
    );
    setError("");
  };

  // Batch Tool: Sync all variant prices with basePrice
  const handleSyncPrices = () => {
    const parsedBasePrice = parseFloat(basePrice) || 0;
    if (parsedBasePrice <= 0) {
      setError("Please set a valid base price first.");
      return;
    }
    setVariants((prev) =>
      prev.map((v) => ({ ...v, price: parsedBasePrice }))
    );
    setError("");
  };

  // Batch Tool: Auto-regenerate SKUs
  const handleRegenerateSkus = () => {
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        sku: generateSkuCode(slug, v.color || defaultColor, v.size)
      }))
    );
  };

  // Multi-Image Handler
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const validNewFiles: StagedFile[] = [];
    for (const file of files) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError(`File "${file.name}" rejected: Only JPEG, PNG, or WebP formats are allowed.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" rejected: File exceeds the 5MB size limit.`);
        return;
      }
      validNewFiles.push({
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }

    setStagedFiles((prev) => [...prev, ...validNewFiles]);
    setError("");
  };

  const handleRemoveStaged = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (!product) return;
    const prodId = product.productId || product.id || 0;
    setDeletingImageId(imageId);

    try {
      const success = await deleteProductImage(prodId, imageId);
      if (success) {
        setExistingImages((prev) => prev.filter((img) => img.productImageId !== imageId));
      } else {
        setError("Failed to delete image from storage.");
      }
    } catch {
      setError("Network error occurred while deleting image.");
    } finally {
      setDeletingImageId(null);
    }
  };

  // Inventory Totals Summary
  const inventorySummary = useMemo(() => {
    const totalUnits = variants.reduce((acc, v) => acc + (Number(v.stockQuantity) || 0), 0);
    const lowStockCount = variants.filter((v) => (Number(v.stockQuantity) || 0) > 0 && (Number(v.stockQuantity) || 0) <= 5).length;
    const outOfStockCount = variants.filter((v) => (Number(v.stockQuantity) || 0) === 0).length;
    return { totalUnits, totalSizes: variants.length, lowStockCount, outOfStockCount };
  }, [variants]);

  // Form Submit Handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const newFieldErrors: { [k: string]: string } = {};

    if (!name.trim()) newFieldErrors.name = "Product name is required.";
    if (!slug.trim()) newFieldErrors.slug = "URL slug is required.";

    const parsedPrice = parseFloat(basePrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      newFieldErrors.basePrice = "Base price must be greater than 0.";
    }

    const parsedCatId = parseInt(categoryId, 10);
    if (isNaN(parsedCatId) || parsedCatId <= 0) {
      newFieldErrors.categoryId = "A category must be selected.";
    }

    if (variants.length === 0) {
      setError("Please configure at least one size variant in the inventory matrix.");
      setLoading(false);
      return;
    }

    // Check SKU uniqueness
    const skus = variants.map((v) => v.sku.trim().toUpperCase());
    const duplicateSku = skus.find((sku, idx) => skus.indexOf(sku) !== idx);
    if (duplicateSku) {
      setError(`Duplicate SKU detected: "${duplicateSku}". Each size variant must have a unique SKU.`);
      setLoading(false);
      return;
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      let activeProductId = 0;

      if (isEditing && product) {
        activeProductId = product.productId || product.id || 0;

        // 1. Update Core Product Attributes
        const success = await updateProduct(activeProductId, {
          categoryId: parsedCatId,
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: description.trim() || undefined,
          basePrice: parsedPrice
        });

        if (!success) {
          setError("Failed to update product details. Please check connection.");
          setLoading(false);
          return;
        }

        // 2. Delete Removed Variants
        for (const delId of deletedVariantIds) {
          await deleteProductVariant(delId);
        }

        // 3. Update Existing & Create New Variants
        for (const v of variants) {
          const varPrice = Number(v.price) > 0 ? Number(v.price) : parsedPrice;
          const varStock = Number(v.stockQuantity) >= 0 ? Number(v.stockQuantity) : 0;
          const varColor = v.color.trim() || defaultColor.trim() || "Standard";
          const varSku = v.sku.trim() || generateSkuCode(slug, varColor, v.size);

          if (v.productVariantId && !v.isNew) {
            // Update existing variant
            await updateProductVariant(v.productVariantId, {
              size: v.size,
              color: varColor,
              sku: varSku,
              price: varPrice,
              stockQuantity: varStock
            });
          } else {
            // Create newly added variant on existing product
            await createProductVariant(activeProductId, {
              size: v.size,
              color: varColor,
              sku: varSku,
              price: varPrice,
              stockQuantity: varStock
            });
          }
        }
      } else {
        // Create Mode
        const created = await createProduct({
          categoryId: parsedCatId,
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: description.trim() || undefined,
          basePrice: parsedPrice
        });

        if (!created) {
          setError("Failed to create product. Slug may already be in use.");
          setLoading(false);
          return;
        }

        activeProductId = created.productId || created.id || 0;

        // Create All Variants
        if (activeProductId) {
          for (const v of variants) {
            const varPrice = Number(v.price) > 0 ? Number(v.price) : parsedPrice;
            const varStock = Number(v.stockQuantity) >= 0 ? Number(v.stockQuantity) : 0;
            const varColor = v.color.trim() || defaultColor.trim() || "Standard";
            const varSku = v.sku.trim() || generateSkuCode(created.slug, varColor, v.size);

            await createProductVariant(activeProductId, {
              size: v.size,
              color: varColor,
              sku: varSku,
              price: varPrice,
              stockQuantity: varStock
            });
          }
        }
      }

      // Upload staged images
      if (activeProductId && stagedFiles.length > 0) {
        const baseSortOrder = existingImages.length;
        for (let i = 0; i < stagedFiles.length; i++) {
          await uploadProductImage(activeProductId, stagedFiles[i].file, baseSortOrder + i);
        }
      }

      onSaved(isEditing ? "Product changes and size matrix saved" : "Product SKU published with size matrix");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const resolveImgUrl = (url?: string) => {
    return resolveProductImageUrl(url);
  };

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit SKU #${product?.productId || product?.id}` : "Add Product SKU"}
      subtitle={isEditing ? "Update product attributes, photo gallery and granular size inventory" : "Create a catalog product with multi-size SKU matrix and photo gallery"}
      width={720}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 24 }}>
          {error && (
            <div
              style={{
                backgroundColor: "#FDF0EE",
                color: "var(--status-danger)",
                border: "1px solid #F8C8C3",
                padding: "10px 14px",
                borderRadius: 6,
                fontSize: "13px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <AlertCircle size={16} strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: Product Core Details */}
          <div className="form-grid">
            <label className="field wide">
              <span>
                Product Name <strong className="req-star">*</strong>
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Indigo Pleat Anarkali Suit"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {fieldErrors.name && <span className="field-error-msg">{fieldErrors.name}</span>}
            </label>

            <label className="field">
              <span>
                URL Slug <strong className="req-star">*</strong>
              </span>
              <input
                type="text"
                required
                placeholder="indigo-pleat-anarkali-suit"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              {fieldErrors.slug && <span className="field-error-msg">{fieldErrors.slug}</span>}
            </label>

            <label className="field">
              <span>
                Base Price (₹ INR) <strong className="req-star">*</strong>
              </span>
              <input
                type="number"
                required
                min="1"
                placeholder="4990"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="admin-tabular"
              />
              {fieldErrors.basePrice && <span className="field-error-msg">{fieldErrors.basePrice}</span>}
            </label>

            <label className="field">
              <span>
                Category <strong className="req-star">*</strong>
              </span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="field-select"
              >
                {categories.map((c) => (
                  <option key={c.categoryId || c.id} value={c.categoryId || c.id}>
                    #{c.categoryId || c.id} — {c.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId && <span className="field-error-msg">{fieldErrors.categoryId}</span>}
            </label>

            <label className="field">
              <span>
                Catalog Status <strong className="req-star">*</strong>
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="field-select"
              >
                <option value="Published">Published (Live on Storefront)</option>
                <option value="Draft">Draft (Staff Only)</option>
                <option value="Archived">Archived (Decommissioned)</option>
              </select>
            </label>

            <label className="field wide">
              <span>Description</span>
              <textarea
                rows={3}
                placeholder="Fabric weave, zari embroidery craftsmanship, and sizing notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </div>

          {/* SECTION 2: Size & Stock Matrix (Add & Update) */}
          <div
            style={{
              backgroundColor: "var(--admin-surface)",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: 8,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}
          >
            {/* Header with Inventory Metric Badges */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Layers size={16} color="var(--admin-accent)" />
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-ink)" }}>
                  Size & Stock Matrix
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  className="status-badge"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--admin-slate-200)", color: "var(--admin-ink)", fontSize: "11px" }}
                >
                  <strong>{inventorySummary.totalUnits}</strong>&nbsp;Units Total
                </span>
                <span
                  className="status-badge"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--admin-slate-200)", color: "var(--admin-slate-600)", fontSize: "11px" }}
                >
                  <strong>{inventorySummary.totalSizes}</strong>&nbsp;Active Sizes
                </span>
                {inventorySummary.lowStockCount > 0 && (
                  <span className="status-badge status-badge--pending" style={{ fontSize: "11px" }}>
                    <span className="status-dot" />
                    <span>{inventorySummary.lowStockCount} Low</span>
                  </span>
                )}
                {inventorySummary.outOfStockCount > 0 && (
                  <span className="status-badge status-badge--cancelled" style={{ fontSize: "11px" }}>
                    <span className="status-dot" />
                    <span>{inventorySummary.outOfStockCount} OOS</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Size Toggle Pills */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "12px", color: "var(--admin-slate-600)", fontWeight: 500 }}>
                  Toggle Standard Sizes:
                </span>
                <span style={{ fontSize: "11px", color: "var(--admin-slate-600)" }}>
                  Click to add or remove size row
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                {STANDARD_SIZES.map((sz) => {
                  const isPresent = variants.some((v) => v.size.toLowerCase() === sz.toLowerCase());
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: isPresent ? "1px solid var(--admin-accent)" : "1px solid var(--admin-slate-200)",
                        background: isPresent ? "var(--admin-accent-tint)" : "#FFFFFF",
                        color: isPresent ? "var(--admin-accent)" : "var(--admin-slate-600)",
                        fontWeight: isPresent ? 600 : 500,
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.12s ease"
                      }}
                    >
                      {isPresent && <Check size={12} strokeWidth={2.5} />}
                      <span>{sz}</span>
                    </button>
                  );
                })}

                {/* Custom Size Adder Input */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
                  <input
                    type="text"
                    placeholder="Custom size (e.g. 3XL)"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomSize();
                      }
                    }}
                    style={{
                      height: 30,
                      width: 140,
                      padding: "0 8px",
                      fontSize: "12px",
                      borderRadius: 6,
                      border: "1px solid var(--admin-slate-200)",
                      backgroundColor: "#FFFFFF",
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    style={{
                      height: 30,
                      padding: "0 10px",
                      borderRadius: 6,
                      background: "#FFFFFF",
                      border: "1px solid var(--admin-slate-200)",
                      color: "var(--admin-ink)",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <Plus size={12} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Batch Automation Bar */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--admin-slate-200)",
                borderRadius: 6,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "var(--admin-slate-600)", fontWeight: 500 }}>
                  Batch Quantity:
                </span>
                <input
                  type="number"
                  min="0"
                  value={batchStockInput}
                  onChange={(e) => setBatchStockInput(e.target.value)}
                  style={{
                    width: 60,
                    height: 28,
                    padding: "0 6px",
                    fontSize: "12px",
                    border: "1px solid var(--admin-slate-200)",
                    borderRadius: 4,
                    textAlign: "center"
                  }}
                  className="admin-tabular"
                />
                <button
                  type="button"
                  onClick={handleBatchApplyStock}
                  className="admin-table-btn"
                  style={{ height: 28 }}
                  title="Apply this stock amount to all sizes in table"
                >
                  <Sparkles size={11} color="var(--admin-accent)" />
                  <span>Apply to all</span>
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  type="button"
                  onClick={handleSyncPrices}
                  className="admin-table-btn"
                  style={{ height: 28 }}
                  title="Sync all variant prices to base price"
                >
                  <span>Sync Price (₹{basePrice})</span>
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateSkus}
                  className="admin-table-btn"
                  style={{ height: 28 }}
                  title="Re-generate SKU format for all rows"
                >
                  <RefreshCw size={11} />
                  <span>Format SKUs</span>
                </button>
              </div>
            </div>

            {/* Granular Variant Table */}
            {variants.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 16px", backgroundColor: "#FFFFFF", borderRadius: 6, border: "1px dashed var(--admin-slate-200)" }}>
                <span style={{ fontSize: "13px", color: "var(--admin-slate-600)", display: "block", marginBottom: 6 }}>
                  No size variants added yet.
                </span>
                <span style={{ fontSize: "12px", color: "var(--admin-slate-400)" }}>
                  Click one of the size pills above (e.g. S, M, L, XL) to generate inventory rows.
                </span>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table" style={{ fontSize: "12px" }}>
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Size</th>
                      <th style={{ width: 120 }}>Color</th>
                      <th>SKU Code</th>
                      <th style={{ width: 100, textAlign: "right" }}>Price (₹)</th>
                      <th style={{ width: 100, textAlign: "right" }}>Stock (Qty)</th>
                      <th style={{ width: 90 }}>Status</th>
                      <th style={{ width: 44, textAlign: "center" }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, idx) => {
                      const stockVal = Number(v.stockQuantity) || 0;
                      let stockBadge = (
                        <span className="status-badge status-badge--published" style={{ fontSize: "10px", padding: "1px 6px" }}>
                          <span className="status-dot" />
                          <span>In Stock</span>
                        </span>
                      );
                      if (stockVal === 0) {
                        stockBadge = (
                          <span className="status-badge status-badge--cancelled" style={{ fontSize: "10px", padding: "1px 6px" }}>
                            <span className="status-dot" />
                            <span>Out of Stock</span>
                          </span>
                        );
                      } else if (stockVal <= 5) {
                        stockBadge = (
                          <span className="status-badge status-badge--pending" style={{ fontSize: "10px", padding: "1px 6px" }}>
                            <span className="status-dot" />
                            <span>Low ({stockVal})</span>
                          </span>
                        );
                      }

                      return (
                        <tr key={v.productVariantId ? `pv-${v.productVariantId}` : `new-${v.size}-${idx}`}>
                          {/* Size Pill */}
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 34,
                                height: 26,
                                borderRadius: 4,
                                backgroundColor: "var(--admin-accent-tint)",
                                color: "var(--admin-accent)",
                                fontWeight: 700,
                                fontSize: "12px"
                              }}
                            >
                              {v.size}
                            </span>
                          </td>

                          {/* Color Input */}
                          <td>
                            <input
                              type="text"
                              value={v.color}
                              onChange={(e) => handleUpdateVariantField(idx, "color", e.target.value)}
                              placeholder="Indigo Blue"
                              style={{
                                height: 28,
                                width: "100%",
                                padding: "0 6px",
                                fontSize: "12px",
                                border: "1px solid var(--admin-slate-200)",
                                borderRadius: 4,
                                backgroundColor: "#FFFFFF"
                              }}
                            />
                          </td>

                          {/* SKU Input */}
                          <td>
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => handleUpdateVariantField(idx, "sku", e.target.value.toUpperCase())}
                              placeholder="IND-001-S"
                              style={{
                                height: 28,
                                width: "100%",
                                padding: "0 6px",
                                fontSize: "11px",
                                fontFamily: "var(--font-mono)",
                                border: "1px solid var(--admin-slate-200)",
                                borderRadius: 4,
                                backgroundColor: "#FFFFFF"
                              }}
                            />
                          </td>

                          {/* Price Input */}
                          <td style={{ textAlign: "right" }}>
                            <input
                              type="number"
                              min="1"
                              value={v.price}
                              onChange={(e) => handleUpdateVariantField(idx, "price", parseFloat(e.target.value) || 0)}
                              style={{
                                height: 28,
                                width: "100%",
                                padding: "0 6px",
                                fontSize: "12px",
                                textAlign: "right",
                                border: "1px solid var(--admin-slate-200)",
                                borderRadius: 4,
                                backgroundColor: "#FFFFFF"
                              }}
                              className="admin-tabular"
                            />
                          </td>

                          {/* Stock Quantity Input */}
                          <td style={{ textAlign: "right" }}>
                            <input
                              type="number"
                              min="0"
                              value={v.stockQuantity}
                              onChange={(e) => handleUpdateVariantField(idx, "stockQuantity", parseInt(e.target.value, 10) || 0)}
                              style={{
                                height: 28,
                                width: "100%",
                                padding: "0 6px",
                                fontSize: "12px",
                                textAlign: "right",
                                border: "1px solid var(--admin-slate-200)",
                                borderRadius: 4,
                                backgroundColor: "#FFFFFF",
                                fontWeight: 600
                              }}
                              className="admin-tabular"
                            />
                          </td>

                          {/* Status Badge */}
                          <td>{stockBadge}</td>

                          {/* Delete / Remove Action */}
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(idx)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--status-danger)",
                                cursor: "pointer",
                                padding: 4,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              title={`Remove size ${v.size}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION 3: Multi-Image Gallery Manager */}
          <div
            style={{
              backgroundColor: "var(--admin-surface)",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: 8,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 14
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Camera size={16} color="var(--admin-accent)" />
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-ink)" }}>
                  Photo Gallery
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--admin-slate-600)" }}>
                Only JPEG, PNG, or WebP, up to 5MB
              </span>
            </div>

            {/* Saved Images */}
            {existingImages.length > 0 && (
              <div>
                <span style={{ fontSize: "12px", color: "var(--admin-slate-600)", fontWeight: 500, display: "block", marginBottom: 6 }}>
                  Saved Photos ({existingImages.length}):
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
                  {existingImages.map((img, idx) => (
                    <div
                      key={img.productImageId}
                      style={{
                        position: "relative",
                        borderRadius: 6,
                        overflow: "hidden",
                        border: "1px solid var(--admin-slate-200)",
                        backgroundColor: "#FFFFFF"
                      }}
                    >
                      <div style={{ position: "relative", height: 110, width: "100%" }}>
                        <Image
                          src={resolveImgUrl(img.imageUrl)}
                          alt={`Photo ${idx + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div
                        style={{
                          padding: "3px 6px",
                          backgroundColor: "#FFFFFF",
                          borderTop: "1px solid var(--admin-slate-200)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <span style={{ fontSize: "11px", color: idx === 0 ? "var(--admin-accent)" : "var(--admin-slate-600)", fontWeight: 600 }}>
                          {idx === 0 ? "Cover" : `#${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          disabled={deletingImageId === img.productImageId}
                          onClick={() => handleDeleteExistingImage(img.productImageId)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--status-danger)",
                            cursor: "pointer",
                            padding: 2,
                            display: "flex"
                          }}
                          title="Delete photo"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staged Uploads */}
            {stagedFiles.length > 0 && (
              <div>
                <span style={{ fontSize: "12px", color: "var(--admin-accent)", fontWeight: 600, display: "block", marginBottom: 6 }}>
                  Queued for Upload ({stagedFiles.length}):
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
                  {stagedFiles.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        borderRadius: 6,
                        overflow: "hidden",
                        border: "1px solid var(--admin-accent-border)",
                        backgroundColor: "#FFFFFF"
                      }}
                    >
                      <div style={{ position: "relative", height: 110, width: "100%" }}>
                        <Image
                          src={item.previewUrl}
                          alt={`Queued ${idx + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div
                        style={{
                          padding: "3px 6px",
                          backgroundColor: "var(--admin-accent-tint)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <span style={{ fontSize: "11px", color: "var(--admin-accent)", fontWeight: 600 }}>
                          Ready
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStaged(idx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--admin-slate-600)",
                            cursor: "pointer",
                            padding: 2,
                            display: "flex"
                          }}
                          title="Remove from queue"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drop Zone */}
            <div
              style={{
                border: "1px dashed var(--admin-slate-200)",
                padding: "16px",
                borderRadius: 6,
                backgroundColor: "#FFFFFF",
                textAlign: "center"
              }}
            >
              <label
                style={{
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <UploadCloud size={24} color="var(--admin-accent)" strokeWidth={1.75} />
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--admin-ink)", display: "block" }}>
                    Click or drop photos to upload
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--admin-slate-600)" }}>
                    Hold Ctrl/Cmd to select multiple files
                  </span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFilesSelect}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Sticky Save Bar at Bottom */}
        <div className="admin-sticky-save-bar">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="admin-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary"
          >
            {loading
              ? (isEditing ? "Saving changes & inventory..." : "Publishing SKU...")
              : (isEditing ? "Save product changes" : "Publish product SKU")}
          </button>
        </div>
      </form>
    </AdminDrawer>
  );
}
