"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  NavigationMenuItem,
  NavigationSubLink,
  NavigationPromoCard
} from "@/lib/types";
import { fetchNavigationConfig, saveNavigationConfig } from "@/lib/api";
import {
  Compass,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Sparkles,
  ChevronRight,
  Layers,
  ArrowRight
} from "lucide-react";

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavigationMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Load navigation config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const config = await fetchNavigationConfig();
      if (config && Array.isArray(config.items)) {
        setItems(config.items.sort((a, b) => a.order - b.order));
        if (config.items.length > 0 && !editingItemId) {
          setEditingItemId(config.items[0].id);
        }
      }
    } catch {
      setStatusMessage("Failed to load navigation config");
    } finally {
      setLoading(false);
    }
  };

  // Reorder items
  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Update order numbers
    const updated = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(updated);
  };

  // Toggle active state
  const toggleItemActive = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  // Add new tab
  const handleAddNewTab = () => {
    const newId = `nav-${Date.now()}`;
    const newTab: NavigationMenuItem = {
      id: newId,
      label: "NEW TAB",
      href: "/shop",
      isActive: true,
      order: items.length + 1,
      subLinks: [
        { id: `sub-${Date.now()}-1`, label: "All Items", href: "/shop" }
      ],
      fabricLinks: [],
      promoCard: {
        badge: "FEATURED",
        title: "Signature Edit",
        description: "Explore our latest handcrafted artisanal designs.",
        href: "/shop"
      }
    };
    setItems([...items, newTab]);
    setEditingItemId(newId);
  };

  // Delete tab
  const handleDeleteTab = (id: string) => {
    if (items.length <= 1) {
      alert("You must keep at least one navigation tab.");
      return;
    }
    if (confirm("Are you sure you want to delete this navigation tab?")) {
      const filtered = items
        .filter((item) => item.id !== id)
        .map((item, idx) => ({ ...item, order: idx + 1 }));
      setItems(filtered);
      if (editingItemId === id) {
        setEditingItemId(filtered[0]?.id || null);
      }
    }
  };

  // Update current editing tab
  const updateEditingItem = (fields: Partial<NavigationMenuItem>) => {
    if (!editingItemId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === editingItemId ? { ...item, ...fields } : item
      )
    );
  };

  // Sub-links helpers
  const activeItem = items.find((item) => item.id === editingItemId);

  const addSubLink = () => {
    if (!activeItem) return;
    const newSub: NavigationSubLink = {
      id: `sub-${Date.now()}`,
      label: "New Subcategory",
      href: "/category/suits"
    };
    updateEditingItem({
      subLinks: [...(activeItem.subLinks || []), newSub]
    });
  };

  const updateSubLink = (id: string, fields: Partial<NavigationSubLink>) => {
    if (!activeItem) return;
    updateEditingItem({
      subLinks: (activeItem.subLinks || []).map((sub) =>
        sub.id === id ? { ...sub, ...fields } : sub
      )
    });
  };

  const deleteSubLink = (id: string) => {
    if (!activeItem) return;
    updateEditingItem({
      subLinks: (activeItem.subLinks || []).filter((sub) => sub.id !== id)
    });
  };

  // Fabric links helpers
  const addFabricLink = () => {
    if (!activeItem) return;
    const newFab: NavigationSubLink = {
      id: `fab-${Date.now()}`,
      label: "Pure Chanderi Silk",
      href: "/shop?fabric=chanderi"
    };
    updateEditingItem({
      fabricLinks: [...(activeItem.fabricLinks || []), newFab]
    });
  };

  const updateFabricLink = (id: string, fields: Partial<NavigationSubLink>) => {
    if (!activeItem) return;
    updateEditingItem({
      fabricLinks: (activeItem.fabricLinks || []).map((fab) =>
        fab.id === id ? { ...fab, ...fields } : fab
      )
    });
  };

  const deleteFabricLink = (id: string) => {
    if (!activeItem) return;
    updateEditingItem({
      fabricLinks: (activeItem.fabricLinks || []).filter((fab) => fab.id !== id)
    });
  };

  // Promo card helpers
  const updatePromoCard = (fields: Partial<NavigationPromoCard>) => {
    if (!activeItem) return;
    const currentPromo = activeItem.promoCard || {
      title: "",
      description: "",
      href: "/shop"
    };
    updateEditingItem({
      promoCard: { ...currentPromo, ...fields }
    });
  };

  const togglePromoCard = (enabled: boolean) => {
    if (!activeItem) return;
    if (enabled) {
      updateEditingItem({
        promoCard: {
          badge: "FEATURED",
          title: `${activeItem.label} Spotlight`,
          description: "Handcrafted ethnic elegance crafted with authentic handlooms.",
          href: activeItem.href || "/shop"
        }
      });
    } else {
      updateEditingItem({ promoCard: undefined });
    }
  };

  // Save all changes
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveStatus("idle");
    setStatusMessage("");

    const res = await saveNavigationConfig(items);
    setSaving(false);

    if (res.success) {
      setSaveStatus("success");
      setStatusMessage("Navigation menus updated successfully! Live website reflects changes.");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } else {
      setSaveStatus("error");
      setStatusMessage(res.error || "Failed to save navigation.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "32px", color: "var(--admin-slate-600)" }}>
        <p>Loading navigation configuration...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Page Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Compass size={22} color="var(--admin-accent)" />
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--admin-ink)",
                margin: 0
              }}
            >
              Store Navigation & Mega Menu Manager
            </h1>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--admin-slate-600)",
              margin: "4px 0 0"
            }}
          >
            Customize your storefront navigation tabs, dropdown subcategories, fabric filters, and promotional spotlight cards.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={handleAddNewTab}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid var(--admin-slate-300)",
              background: "#FFFFFF",
              color: "var(--admin-ink)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <Plus size={14} />
            <span>Add Menu Tab</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              borderRadius: "6px",
              border: "none",
              background: "var(--admin-accent)",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(59, 76, 122, 0.25)"
            }}
          >
            <Save size={14} />
            <span>{saving ? "Saving..." : "Save Navigation"}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {saveStatus === "success" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            padding: "10px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            marginBottom: "20px"
          }}
        >
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {saveStatus === "error" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#991B1B",
            padding: "10px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            marginBottom: "20px"
          }}
        >
          <AlertCircle size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main 2-Column Workspace */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "24px",
          alignItems: "flex-start"
        }}
      >
        {/* Left Column: Navigation Tabs List */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid var(--admin-slate-200)",
            borderRadius: "10px",
            padding: "16px"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px"
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--admin-slate-600)",
                letterSpacing: "0.04em",
                textTransform: "uppercase"
              }}
            >
              Navigation Tabs ({items.length})
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {items.map((item, index) => {
              const isSelected = item.id === editingItemId;
              return (
                <div
                  key={item.id}
                  onClick={() => setEditingItemId(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: isSelected ? "#F4F6FB" : "#FFFFFF",
                    border: isSelected
                      ? "1px solid var(--admin-accent)"
                      : "1px solid var(--admin-slate-200)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItemActive(item.id);
                      }}
                      title={item.isActive ? "Active on website" : "Hidden from website"}
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        border: "none",
                        background: item.isActive ? "#10B981" : "#D1D5DB",
                        cursor: "pointer"
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: isSelected ? "var(--admin-accent)" : "var(--admin-ink)"
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--admin-slate-600)"
                        }}
                      >
                        {item.subLinks?.length || 0} sub-links • {item.href}
                      </div>
                    </div>
                  </div>

                  {/* Move Up / Down Controls */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "2px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      style={{
                        background: "none",
                        border: "none",
                        color: index === 0 ? "#E5E7EB" : "var(--admin-slate-600)",
                        cursor: index === 0 ? "default" : "pointer",
                        padding: "4px"
                      }}
                      title="Move Up"
                    >
                      <MoveUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, "down")}
                      disabled={index === items.length - 1}
                      style={{
                        background: "none",
                        border: "none",
                        color:
                          index === items.length - 1
                            ? "#E5E7EB"
                            : "var(--admin-slate-600)",
                        cursor:
                          index === items.length - 1 ? "default" : "pointer",
                        padding: "4px"
                      }}
                      title="Move Down"
                    >
                      <MoveDown size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tab Editor & Mega Menu Config */}
        {activeItem ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: "10px",
              padding: "24px"
            }}
          >
            {/* Tab Basic Settings */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--admin-slate-200)",
                paddingBottom: "16px",
                marginBottom: "20px"
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--admin-slate-600)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em"
                  }}
                >
                  Editing Tab
                </span>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--admin-ink)",
                    margin: "2px 0 0"
                  }}
                >
                  {activeItem.label}
                </h2>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    color: "var(--admin-slate-600)",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={activeItem.isActive}
                    onChange={() => toggleItemActive(activeItem.id)}
                  />
                  <span>Show in Navbar</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleDeleteTab(activeItem.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #FECACA",
                    background: "#FEF2F2",
                    color: "#DC2626",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <Trash2 size={12} />
                  <span>Delete Tab</span>
                </button>
              </div>
            </div>

            {/* Tab Label & Target URL Input Form */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px"
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--admin-ink)",
                    marginBottom: "6px"
                  }}
                >
                  Tab Label (e.g. SUITS, FESTIVE EDIT)
                </label>
                <input
                  type="text"
                  value={activeItem.label}
                  onChange={(e) =>
                    updateEditingItem({ label: e.target.value.toUpperCase() })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "13px"
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--admin-ink)",
                    marginBottom: "6px"
                  }}
                >
                  Target Link / Category URL (e.g. /category/suits)
                </label>
                <input
                  type="text"
                  value={activeItem.href}
                  onChange={(e) => updateEditingItem({ href: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "13px"
                  }}
                />
              </div>
            </div>

            {/* Section: Subcategory Links List */}
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid var(--admin-slate-200)",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--admin-ink)"
                    }}
                  >
                    1. Subcategory Links ({activeItem.subLinks?.length || 0})
                  </span>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--admin-slate-600)",
                      margin: "2px 0 0"
                    }}
                  >
                    Links listed in the main dropdown column.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSubLink}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    background: "#FFFFFF",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <Plus size={12} />
                  <span>Add Sub-link</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(activeItem.subLinks || []).map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1.5fr 90px 32px",
                      gap: "8px",
                      alignItems: "center",
                      background: "#FFFFFF",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--admin-slate-200)"
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Link Label (e.g. Anarkali Suits)"
                      value={sub.label}
                      onChange={(e) =>
                        updateSubLink(sub.id, { label: e.target.value })
                      }
                      style={{
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid var(--admin-slate-300)",
                        fontSize: "12px"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="URL (e.g. /category/suits?type=anarkali)"
                      value={sub.href}
                      onChange={(e) =>
                        updateSubLink(sub.id, { href: e.target.value })
                      }
                      style={{
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid var(--admin-slate-300)",
                        fontSize: "12px"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Badge (NEW)"
                      value={sub.badge || ""}
                      onChange={(e) =>
                        updateSubLink(sub.id, {
                          badge: e.target.value.toUpperCase()
                        })
                      }
                      style={{
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid var(--admin-slate-300)",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#B38F3F"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => deleteSubLink(sub.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#EF4444",
                        cursor: "pointer",
                        padding: "4px"
                      }}
                      title="Delete Sub-link"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Fabric Filters (Optional Column 2) */}
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid var(--admin-slate-200)",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--admin-ink)"
                    }}
                  >
                    2. Fabric & Weave Filters ({activeItem.fabricLinks?.length || 0})
                  </span>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--admin-slate-600)",
                      margin: "2px 0 0"
                    }}
                  >
                    Optional secondary column in the mega menu (e.g. Pure Chanderi Silk, Linen).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addFabricLink}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    background: "#FFFFFF",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <Plus size={12} />
                  <span>Add Fabric Filter</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(activeItem.fabricLinks || []).map((fab) => (
                  <div
                    key={fab.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 32px",
                      gap: "8px",
                      alignItems: "center",
                      background: "#FFFFFF",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--admin-slate-200)"
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Fabric Label (e.g. Pure Chanderi Silk)"
                      value={fab.label}
                      onChange={(e) =>
                        updateFabricLink(fab.id, { label: e.target.value })
                      }
                      style={{
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid var(--admin-slate-300)",
                        fontSize: "12px"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="URL (e.g. /category/suits?fabric=chanderi)"
                      value={fab.href}
                      onChange={(e) =>
                        updateFabricLink(fab.id, { href: e.target.value })
                      }
                      style={{
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid var(--admin-slate-300)",
                        fontSize: "12px"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => deleteFabricLink(fab.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#EF4444",
                        cursor: "pointer",
                        padding: "4px"
                      }}
                      title="Delete Fabric Filter"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(!activeItem.fabricLinks || activeItem.fabricLinks.length === 0) && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--admin-slate-600)",
                      fontStyle: "italic",
                      padding: "4px 0"
                    }}
                  >
                    No fabric filters configured for this tab (optional).
                  </div>
                )}
              </div>
            </div>

            {/* Section: Promotional Spotlight Card */}
            <div
              style={{
                background: "#151D30",
                color: "#FAF7F2",
                borderRadius: "8px",
                padding: "16px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--nilasa-gold)",
                      letterSpacing: "0.04em"
                    }}
                  >
                    3. Visual Spotlight Promo Card
                  </span>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "rgba(250, 247, 242, 0.7)",
                      margin: "2px 0 0"
                    }}
                  >
                    Featured right-side card in the mega dropdown menu.
                  </p>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    color: "#FAF7F2",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!activeItem.promoCard}
                    onChange={(e) => togglePromoCard(e.target.checked)}
                  />
                  <span>Enable Spotlight Card</span>
                </label>
              </div>

              {activeItem.promoCard ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px"
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--nilasa-gold)",
                        marginBottom: "4px"
                      }}
                    >
                      Card Badge (e.g. BESTSELLER, NEW)
                    </label>
                    <input
                      type="text"
                      value={activeItem.promoCard.badge || ""}
                      onChange={(e) =>
                        updatePromoCard({
                          badge: e.target.value.toUpperCase()
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        background: "#1E273F",
                        border: "1px solid rgba(212, 178, 88, 0.4)",
                        color: "#FFFFFF",
                        fontSize: "12px"
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#FFFFFF",
                        marginBottom: "4px"
                      }}
                    >
                      Headline Title
                    </label>
                    <input
                      type="text"
                      value={activeItem.promoCard.title}
                      onChange={(e) =>
                        updatePromoCard({ title: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        background: "#1E273F",
                        border: "1px solid rgba(212, 178, 88, 0.4)",
                        color: "#FFFFFF",
                        fontSize: "12px"
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "rgba(250, 247, 242, 0.8)",
                        marginBottom: "4px"
                      }}
                    >
                      Short Description / Artisan Story
                    </label>
                    <textarea
                      rows={2}
                      value={activeItem.promoCard.description}
                      onChange={(e) =>
                        updatePromoCard({ description: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        background: "#1E273F",
                        border: "1px solid rgba(212, 178, 88, 0.4)",
                        color: "#FFFFFF",
                        fontSize: "12px"
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#FFFFFF",
                        marginBottom: "4px"
                      }}
                    >
                      CTA Target URL
                    </label>
                    <input
                      type="text"
                      value={activeItem.promoCard.href}
                      onChange={(e) =>
                        updatePromoCard({ href: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        background: "#1E273F",
                        border: "1px solid rgba(212, 178, 88, 0.4)",
                        color: "#FFFFFF",
                        fontSize: "12px"
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(250, 247, 242, 0.6)",
                    fontStyle: "italic"
                  }}
                >
                  Spotlight card is currently disabled for this tab.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: "var(--admin-slate-600)",
              background: "#FFFFFF",
              borderRadius: "10px",
              border: "1px solid var(--admin-slate-200)"
            }}
          >
            Select a tab on the left to edit its dropdown links and promo card.
          </div>
        )}
      </div>
    </div>
  );
}
