"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 600));
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow eyebrow--gold">TAXONOMY CREATION</span>
          <h1 className="admin-page-title">Add New Category</h1>
        </div>
      </div>

      <div className="admin-card">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <label className="field">
            <span>Category Name *</span>
            <input
              type="text"
              required
              placeholder="e.g. Festive Dupattas"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </label>

          <label className="field">
            <span>URL Slug *</span>
            <input
              type="text"
              required
              placeholder="festive-dupattas"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Category Description</span>
            <textarea
              rows={3}
              placeholder="Brief description for category collection header..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div style={{ display: "flex", gap: 14, justifyContent: "flex-end", marginTop: 10 }}>
            <button type="button" onClick={() => router.back()} className="button" style={{ background: "#E2E8F0", color: "#475569" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="button button--indigo">
              {submitting ? "Saving..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
