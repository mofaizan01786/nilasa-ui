"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Product, Order, Coupon, User } from "@/lib/types";
import {
  ATELIER_STATIC_KPIS,
  ATELIER_REVENUE_CHART,
  ATELIER_MONTHLY_TARGET,
  ATELIER_TOP_COLLECTIONS,
  ATELIER_ACTIVE_PATRONS,
  ATELIER_CONVERSION_FUNNEL,
  ATELIER_TRAFFIC_SOURCES,
  ATELIER_RECENT_ORDERS,
  ATELIER_RECENT_ACTIVITY,
  RecentOrderItem
} from "@/lib/admin-mock-data";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Eye,
  DollarSign,
  Search,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Layers,
  Check,
  Building,
  Star,
  Truck,
  RotateCcw,
  SlidersHorizontal,
  Share2
} from "lucide-react";

interface AdminDashboardOverviewProps {
  initialProducts?: Product[];
  initialOrders?: Order[];
  initialCoupons?: Coupon[];
  initialUsers?: User[];
}

export function AdminDashboardOverview({
  initialProducts = [],
  initialOrders = [],
  initialCoupons = [],
  initialUsers = []
}: AdminDashboardOverviewProps) {
  const [revenueRange, setRevenueRange] = useState("Last 8 Days");
  const [funnelRange, setFunnelRange] = useState("This Week");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredRevenueIndex, setHoveredRevenueIndex] = useState<number | null>(4); // Default peak (Aug 16)

  // Merge live API orders with static mock orders when API is empty
  const ordersList: RecentOrderItem[] = useMemo(() => {
    if (initialOrders && initialOrders.length > 0) {
      return initialOrders.slice(0, 10).map((o, idx) => ({
        no: idx + 1,
        orderId: `#NL-${o.orderId || o.id || o.orderNumber || 8920 + idx}`,
        customer: o.shippingAddress?.name || `Patron #${o.userId || idx + 1}`,
        product: o.items?.[0]?.productName || "Bespoke Ensemble",
        productColorDot: idx % 2 === 0 ? "var(--admin-primary)" : "#C69244",
        qty: o.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1,
        total: `₹${(o.totalAmount || 12500).toLocaleString("en-IN")}`,
        rawTotal: o.totalAmount || 12500,
        status: (o.status as any) || (idx === 0 ? "Shipped" : idx === 1 ? "Processing" : "Delivered"),
        category: "Atelier Silk",
        date: o.placedAt ? new Date(o.placedAt).toLocaleDateString("en-IN") : "Today"
      }));
    }
    return ATELIER_RECENT_ORDERS;
  }, [initialOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      const matchSearch =
        orderSearch.trim() === "" ||
        o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.product.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.orderId.toLowerCase().includes(orderSearch.toLowerCase());
      const matchCategory =
        selectedCategory === "All" || o.category.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchSearch && matchCategory;
    });
  }, [ordersList, orderSearch, selectedCategory]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ─── 1. TOP KPI METRIC CARDS (3 Cards) ─── */}
      <div
        className="admin-dashboard-kpis"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20
        }}
      >
        {/* KPI 1: Total Atelier Sales */}
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--admin-text-muted)"
              }}
            >
              TOTAL ATELIER SALES
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--admin-primary-soft)",
                color: "var(--admin-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: 700
              }}
            >
              ₹
            </div>
          </div>

          <div
            style={{
              fontSize: "30px",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "var(--admin-primary)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em"
            }}
          >
            {ATELIER_STATIC_KPIS.totalSales}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
            <span style={{ color: "#2E7D32", fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
              <ArrowUpRight size={14} /> {ATELIER_STATIC_KPIS.totalSalesChange}
            </span>
            <span>vs last week</span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--admin-text-muted)"
              }}
            >
              TOTAL ORDERS
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--admin-surface-bg)",
                color: "var(--admin-text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <ShoppingBag size={16} />
            </div>
          </div>

          <div
            style={{
              fontSize: "30px",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "var(--admin-text-main)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em"
            }}
          >
            {ATELIER_STATIC_KPIS.totalOrders}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
            <span style={{ color: "#E05353", fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
              <ArrowDownRight size={14} /> {ATELIER_STATIC_KPIS.totalOrdersChange}
            </span>
            <span>vs last week</span>
          </div>
        </div>

        {/* KPI 3: Atelier Visitors / Patrons */}
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--admin-text-muted)"
              }}
            >
              ATELIER VISITORS / PATRONS
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--admin-surface-bg)",
                color: "var(--admin-text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Eye size={16} />
            </div>
          </div>

          <div
            style={{
              fontSize: "30px",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "var(--admin-text-main)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em"
            }}
          >
            {ATELIER_STATIC_KPIS.visitors}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
            <span style={{ color: "#2E7D32", fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
              <ArrowUpRight size={14} /> {ATELIER_STATIC_KPIS.visitorsChange}
            </span>
            <span>vs last week</span>
          </div>
        </div>
      </div>

      {/* ─── 2. MIDDLE GRID: REVENUE, MONTHLY TARGET, TOP COLLECTIONS ─── */}
      <div
        className="admin-dashboard-middle-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr",
          gap: 20
        }}
      >
        {/* Middle Card 1: Revenue Analytics Dual Spline Chart */}
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  color: "var(--admin-text-main)"
                }}
              >
                Revenue Analytics
              </h3>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "var(--admin-primary)",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <span>{revenueRange}</span>
                <ChevronDown size={13} />
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--admin-primary)" }} />
                <span>Silk & Zari Kurtis</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C69244" }} />
                <span>Bespoke Sets</span>
              </div>
            </div>
          </div>

          {/* Smooth Dual Spline SVG Chart */}
          <div style={{ position: "relative", width: "100%", height: 210, marginTop: 10 }}>
            <svg
              viewBox="0 0 500 200"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="silkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--admin-primary)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="var(--admin-primary)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="bespokeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C69244" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#C69244" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="var(--admin-border-subtle)" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="var(--admin-border-subtle)" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="var(--admin-border-subtle)" strokeDasharray="3 3" />
              <line x1="0" y1="185" x2="500" y2="185" stroke="var(--admin-border-subtle)" />

              {/* Silk & Zari Kurtis Curve (Burgundy / Primary) */}
              <path
                d="M 15 155 Q 85 130 155 135 T 295 45 T 435 90 T 485 55 L 485 185 L 15 185 Z"
                fill="url(#silkGradient)"
              />
              <path
                d="M 15 155 Q 85 130 155 135 T 295 45 T 435 90 T 485 55"
                fill="none"
                stroke="var(--admin-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Bespoke Sets Curve (Gold Accent) */}
              <path
                d="M 15 175 Q 85 160 155 145 T 295 110 T 435 125 T 485 95 L 485 185 L 15 185 Z"
                fill="url(#bespokeGradient)"
              />
              <path
                d="M 15 175 Q 85 160 155 145 T 295 110 T 435 125 T 485 95"
                fill="none"
                stroke="#C69244"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 2"
              />

              {/* Peak Marker Dot at Aug 16 */}
              <circle cx="295" cy="45" r="5" fill="#FFFFFF" stroke="var(--admin-primary)" strokeWidth="3" />
            </svg>

            {/* Peak Tooltip Pill matching reference design */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "58%",
                transform: "translateX(-50%)",
                background: "var(--admin-card-bg)",
                border: "1px solid var(--admin-border-strong)",
                borderRadius: 8,
                padding: "4px 10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                textAlign: "center",
                pointerEvents: "none"
              }}
            >
              <div style={{ fontSize: "8px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                FESTIVE PEAK
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-primary)" }}>
                ₹4,82,000
              </div>
            </div>
          </div>

          {/* X-Axis Days */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 10,
              borderTop: "1px solid var(--admin-border-subtle)",
              fontSize: "10px",
              color: "var(--admin-text-light)",
              fontWeight: 500
            }}
          >
            {ATELIER_REVENUE_CHART.map((pt) => (
              <span key={pt.day}>{pt.day}</span>
            ))}
          </div>
        </div>

        {/* Middle Card 2: Monthly Target Gauge Progress */}
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  color: "var(--admin-text-main)"
                }}
              >
                Monthly Target
              </h3>
              <button
                type="button"
                aria-label="Target options"
                style={{ background: "none", border: "none", color: "var(--admin-text-light)", cursor: "pointer" }}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Gauge Semi-Circle Meter */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "14px 0 10px" }}>
              <div style={{ position: "relative", width: 160, height: 95 }}>
                <svg viewBox="0 0 160 100" style={{ width: "100%", height: "100%" }}>
                  {/* Background Arc */}
                  <path
                    d="M 20 90 A 60 60 0 0 1 140 90"
                    fill="none"
                    stroke="var(--admin-border-subtle)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Progress Arc (85%) */}
                  <path
                    d="M 20 90 A 60 60 0 0 1 132 55"
                    fill="none"
                    stroke="var(--admin-primary)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center Percentage */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    textAlign: "center"
                  }}
                >
                  <span
                    style={{
                      fontSize: "26px",
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      color: "var(--admin-text-main)"
                    }}
                  >
                    {ATELIER_MONTHLY_TARGET.percentage}%
                  </span>
                </div>
              </div>

              <span style={{ fontSize: "11px", color: "#2E7D32", fontWeight: 600, marginTop: 4 }}>
                {ATELIER_MONTHLY_TARGET.growthText}
              </span>
            </div>

            {/* Festive Goal Progress Callout */}
            <div style={{ textAlign: "center", margin: "10px 0 14px" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--admin-primary)" }}>
                {ATELIER_MONTHLY_TARGET.highlightTitle}
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--admin-text-muted)", lineHeight: 1.4 }}>
                {ATELIER_MONTHLY_TARGET.highlightDesc}
              </p>
            </div>
          </div>

          {/* Target & Achieved Pills */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: "var(--admin-surface-bg)",
              border: "1px solid var(--admin-border-subtle)"
            }}
          >
            <div>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--admin-text-light)", textTransform: "uppercase" }}>
                TARGET
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-main)", marginTop: 2 }}>
                {ATELIER_MONTHLY_TARGET.targetAmount}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--admin-text-light)", textTransform: "uppercase" }}>
                ACHIEVED
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-primary)", marginTop: 2 }}>
                {ATELIER_MONTHLY_TARGET.achievedAmount}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Card 3: Top Collections Donut Chart & List */}
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  color: "var(--admin-text-main)"
                }}
              >
                Top Collections
              </h3>
              <Link
                href="/admin/products"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--admin-primary)",
                  textDecoration: "none"
                }}
              >
                See All
              </Link>
            </div>

            {/* Donut Chart */}
            <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
              <div style={{ position: "relative", width: 130, height: 130 }}>
                <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  {/* Segment 1: Chanderi Silk (41.7%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="var(--admin-primary)"
                    strokeWidth="14"
                    strokeDasharray="99.6 238.7"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Anarkali Bespoke (33.8%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#C69244"
                    strokeWidth="14"
                    strokeDasharray="80.7 238.7"
                    strokeDashoffset="-99.6"
                  />
                  {/* Segment 3: Handblock Co-ords (15.6%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#E5989B"
                    strokeWidth="14"
                    strokeDasharray="37.2 238.7"
                    strokeDashoffset="-180.3"
                  />
                  {/* Segment 4: Unstitched Festive (8.9%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#F7D1D5"
                    strokeWidth="14"
                    strokeDasharray="21.2 238.7"
                    strokeDashoffset="-217.5"
                  />
                </svg>

                {/* Center Text */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    pointerEvents: "none"
                  }}
                >
                  <span style={{ fontSize: "8px", fontWeight: 700, color: "var(--admin-text-light)", textTransform: "uppercase" }}>
                    TOTAL SALES
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--admin-text-main)", marginTop: 1 }}>
                    ₹34,00,000
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, borderTop: "1px solid var(--admin-border-subtle)", paddingTop: 12 }}>
            {ATELIER_TOP_COLLECTIONS.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "11.5px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.color }} />
                  <span style={{ color: "var(--admin-text-main)", fontWeight: 500 }}>{c.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: "var(--admin-text-main)", fontFamily: "var(--font-mono)" }}>
                  {c.sales}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 3. DEMOGRAPHICS & FUNNEL ROW (Active Patrons, Conversion Funnel, Traffic Sources) ─── */}
      <div
        className="admin-dashboard-funnel-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr 1fr",
          gap: 20
        }}
      >
        {/* Card 1: Active Patrons */}
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  color: "var(--admin-text-main)"
                }}
              >
                Active Patrons
              </h3>
              <button
                type="button"
                aria-label="Patron options"
                style={{ background: "none", border: "none", color: "var(--admin-text-light)", cursor: "pointer" }}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: "24px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--admin-text-main)" }}>
                {ATELIER_ACTIVE_PATRONS.totalUsers}
              </span>
              <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>users</span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 999,
                  background: "#E8F5E9",
                  color: "#2E7D32"
                }}
              >
                {ATELIER_ACTIVE_PATRONS.growth}
              </span>
            </div>
          </div>

          {/* Geo Breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ATELIER_ACTIVE_PATRONS.demographics.map((d) => (
              <div key={d.region} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                  <span style={{ color: "var(--admin-text-muted)", fontWeight: 500 }}>{d.region}</span>
                  <span style={{ color: "var(--admin-text-main)", fontWeight: 700 }}>{d.percentage}%</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 5,
                    borderRadius: 999,
                    background: "var(--admin-surface-bg)",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${d.percentage}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "var(--admin-primary)"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Conversion Funnel Bar Steps */}
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  color: "var(--admin-text-main)"
                }}
              >
                Conversion Funnel
              </h3>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "var(--admin-primary)",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <span>{funnelRange}</span>
                <ChevronDown size={12} />
              </div>
            </div>

            {/* Step Stats Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 8,
                textAlign: "center",
                marginBottom: 16
              }}
            >
              {ATELIER_CONVERSION_FUNNEL.map((step) => (
                <div key={step.stage}>
                  <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--admin-text-light)", letterSpacing: "0.06em" }}>
                    {step.stage}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-main)", margin: "2px 0" }}>
                    {step.count}
                  </div>
                  <div
                    style={{
                      fontSize: "9.5px",
                      fontWeight: 700,
                      color: step.change.startsWith("+") ? "#2E7D32" : "#E05353"
                    }}
                  >
                    {step.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart Funnel Pillars (Matching image height descent) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 12,
              alignItems: "end",
              height: 100,
              padding: "0 10px"
            }}
          >
            {/* Step 1: Views (100% height, pale blush) */}
            <div
              style={{
                height: "100%",
                background: "#E8D0D2",
                borderRadius: "8px 8px 0 0"
              }}
            />
            {/* Step 2: Bag (70% height) */}
            <div
              style={{
                height: "75%",
                background: "#D6B5B9",
                borderRadius: "8px 8px 0 0"
              }}
            />
            {/* Step 3: Fitting (55% height) */}
            <div
              style={{
                height: "55%",
                background: "#BF9399",
                borderRadius: "8px 8px 0 0"
              }}
            />
            {/* Step 4: Orders (38% height, burgundy velvet) */}
            <div
              style={{
                height: "40%",
                background: "var(--admin-primary)",
                opacity: 0.8,
                borderRadius: "8px 8px 0 0"
              }}
            />
            {/* Step 5: Dispatch (22% height with checkmark) */}
            <div
              style={{
                height: "25%",
                background: "var(--admin-primary)",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF"
              }}
            >
              <Check size={14} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Card 3: Traffic Sources */}
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  color: "var(--admin-text-main)"
                }}
              >
                Traffic Sources
              </h3>
              <button
                type="button"
                aria-label="Traffic options"
                style={{ background: "none", border: "none", color: "var(--admin-text-light)", cursor: "pointer" }}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Segmented Horizontal Bar */}
            <div
              style={{
                width: "100%",
                height: 10,
                borderRadius: 999,
                overflow: "hidden",
                display: "flex",
                gap: 2,
                marginBottom: 16
              }}
            >
              <div style={{ width: "40%", height: "100%", background: "#F28482" }} />
              <div style={{ width: "30%", height: "100%", background: "#F5CAC3" }} />
              <div style={{ width: "15%", height: "100%", background: "#B56576" }} />
              <div style={{ width: "10%", height: "100%", background: "#84A59D" }} />
              <div style={{ width: "5%", height: "100%", background: "#6D2B35" }} />
            </div>
          </div>

          {/* Sources List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ATELIER_TRAFFIC_SOURCES.map((s) => (
              <div
                key={s.source}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "11.5px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: s.color }} />
                  <span style={{ color: "var(--admin-text-muted)", fontWeight: 500 }}>{s.source}</span>
                </div>
                <span style={{ fontWeight: 700, color: "var(--admin-text-main)" }}>{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 4. BOTTOM GRID: RECENT ORDERS TABLE & RECENT ACTIVITY FEED ─── */}
      <div
        className="admin-dashboard-bottom-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.9fr 1.1fr",
          gap: 20
        }}
      >
        {/* Left: Recent Orders Table Card */}
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Header Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
                fontFamily: "var(--font-display)",
                color: "var(--admin-text-main)"
              }}
            >
              Recent Orders
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Filter Search */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--admin-surface-bg)",
                  border: "1px solid var(--admin-border-subtle)",
                  borderRadius: 999,
                  padding: "4px 12px",
                  width: 180
                }}
              >
                <Search size={13} color="var(--admin-text-light)" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search product, patron..."
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "11px",
                    color: "var(--admin-text-main)",
                    width: "100%"
                  }}
                />
              </div>

              {/* Category Filter Dropdown */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "var(--admin-primary)",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <span>{selectedCategory === "All" ? "All Categories" : selectedCategory}</span>
                <ChevronDown size={12} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="admin-table-responsive-wrapper">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
                textAlign: "left"
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--admin-border-subtle)",
                    color: "var(--admin-text-light)",
                    fontSize: "10.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em"
                  }}
                >
                  <th style={{ padding: "10px 8px 10px 4px", fontWeight: 700 }}>No ↕</th>
                  <th style={{ padding: "10px 8px", fontWeight: 700 }}>Order ID ↕</th>
                  <th style={{ padding: "10px 8px", fontWeight: 700 }}>Customer ↕</th>
                  <th style={{ padding: "10px 8px", fontWeight: 700 }}>Product ↕</th>
                  <th style={{ padding: "10px 8px", textAlign: "center", fontWeight: 700 }}>Qty ↕</th>
                  <th style={{ padding: "10px 8px", fontWeight: 700 }}>Total ↕</th>
                  <th style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700 }}>Status ↕</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  let statusBg = "var(--admin-surface-bg)";
                  let statusColor = "var(--admin-text-main)";
                  let dotColor = "#8A8F98";

                  if (o.status === "Shipped") {
                    statusBg = "#FFF8E7";
                    statusColor = "#8A5620";
                    dotColor = "#C69244";
                  } else if (o.status === "Processing") {
                    statusBg = "#FFF1ED";
                    statusColor = "#B84A2E";
                    dotColor = "#E07A5F";
                  } else if (o.status === "Delivered") {
                    statusBg = "#E8F5E9";
                    statusColor = "#1E6B24";
                    dotColor = "#2E7D32";
                  } else if (o.status === "Pending") {
                    statusBg = "#FDE8E8";
                    statusColor = "#9B2C2C";
                    dotColor = "#E05353";
                  }

                  return (
                    <tr
                      key={o.orderId}
                      style={{
                        borderBottom: "1px solid var(--admin-border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                    >
                      <td style={{ padding: "12px 8px 12px 4px", color: "var(--admin-text-muted)" }}>{o.no}</td>
                      <td style={{ padding: "12px 8px", fontWeight: 700, color: "var(--admin-primary)", fontFamily: "var(--font-mono)" }}>
                        {o.orderId}
                      </td>
                      <td style={{ padding: "12px 8px", fontWeight: 600, color: "var(--admin-text-main)" }}>
                        {o.customer}
                      </td>
                      <td style={{ padding: "12px 8px", color: "var(--admin-text-main)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: o.productColorDot || "var(--admin-primary)",
                              flexShrink: 0
                            }}
                          />
                          <span>{o.product}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 600, color: "var(--admin-text-main)" }}>
                        {o.qty}
                      </td>
                      <td style={{ padding: "12px 8px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--admin-text-main)" }}>
                        {o.total}
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 9px",
                            borderRadius: 999,
                            background: statusBg,
                            color: statusColor,
                            fontSize: "11px",
                            fontWeight: 700
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor }} />
                          <span>{o.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Activity Stream Card */}
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  color: "var(--admin-text-main)"
                }}
              >
                Recent Activity
              </h3>
              <button
                type="button"
                aria-label="Activity options"
                style={{ background: "none", border: "none", color: "var(--admin-text-light)", cursor: "pointer" }}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Timeline Stream */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {ATELIER_RECENT_ACTIVITY.map((act) => {
                let icon = <Sparkles size={14} color={act.iconColor} />;
                if (act.type === "loom") icon = <Layers size={14} color={act.iconColor} />;
                if (act.type === "review") icon = <Star size={14} color={act.iconColor} />;
                if (act.type === "inventory") icon = <Package size={14} color={act.iconColor} />;
                if (act.type === "courier") icon = <Truck size={14} color={act.iconColor} />;

                return (
                  <div key={act.id} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: act.avatarBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2
                      }}
                    >
                      {icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-main)", lineHeight: 1.35 }}>
                        <strong>{act.title}</strong> {act.description}
                      </div>
                      <div style={{ fontSize: "10.5px", color: "var(--admin-text-light)", marginTop: 2 }}>
                        {act.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--admin-border-subtle)", paddingTop: 12, marginTop: 14, textAlign: "center" }}>
            <Link
              href="/admin/orders"
              style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-primary)", textDecoration: "none" }}
            >
              View Full Atelier Timeline →
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 5. FOOTER (Matching reference design) ─── */}
      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 16,
          marginTop: 8,
          borderTop: "1px solid var(--admin-border-subtle)",
          fontSize: "11px",
          color: "var(--admin-text-muted)",
          flexWrap: "wrap",
          gap: 12
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span>Copyright © 2026 Nilasa Atelier Commerce</span>
          <span>•</span>
          <Link href="/privacy-policy" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms-of-service" style={{ color: "inherit", textDecoration: "none" }}>Term and conditions</Link>
          <Link href="/shipping-returns" style={{ color: "inherit", textDecoration: "none" }}>Contact</Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "12px", cursor: "pointer" }}>ⓕ</span>
          <span style={{ fontSize: "12px", cursor: "pointer" }}>𝕏</span>
          <span style={{ fontSize: "12px", cursor: "pointer" }}>📷</span>
          <span style={{ fontSize: "12px", cursor: "pointer" }}>▶</span>
          <span style={{ fontSize: "12px", cursor: "pointer" }}>in</span>
        </div>
      </footer>
    </div>
  );
}
