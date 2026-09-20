export interface AtelierKPIs {
  totalSales: string;
  totalSalesChange: string;
  totalOrders: string;
  totalOrdersChange: string;
  visitors: string;
  visitorsChange: string;
}

export interface RevenueDataPoint {
  day: string;
  silkKurtis: number;
  bespokeSets: number;
  label?: string;
  peak?: boolean;
}

export interface TopCollectionItem {
  id: string;
  name: string;
  sales: string;
  rawSales: number;
  percentage: number;
  color: string;
}

export interface PatronDemographic {
  region: string;
  percentage: number;
  count: string;
}

export interface FunnelStep {
  stage: string;
  count: string;
  change: string;
  percentage: number;
}

export interface TrafficSource {
  source: string;
  percentage: number;
  color: string;
}

export interface RecentOrderItem {
  no: number;
  orderId: string;
  customer: string;
  product: string;
  productSubtitle?: string;
  productColorDot?: string;
  qty: number;
  total: string;
  rawTotal: number;
  status: "Shipped" | "Processing" | "Delivered" | "Pending";
  category: string;
  date: string;
}

export interface RecentActivityItem {
  id: string;
  type: "concierge" | "loom" | "review" | "inventory" | "courier";
  title: string;
  description: string;
  time: string;
  avatarBg: string;
  iconColor: string;
}

export const ATELIER_STATIC_KPIS: AtelierKPIs = {
  totalSales: "₹48,24,600",
  totalSalesChange: "+3.34%",
  totalOrders: "1,428",
  totalOrdersChange: "-2.89%",
  visitors: "237,782",
  visitorsChange: "+8.02%"
};

export const ATELIER_REVENUE_CHART: RevenueDataPoint[] = [
  { day: "12 Aug", silkKurtis: 240000, bespokeSets: 180000 },
  { day: "13 Aug", silkKurtis: 310000, bespokeSets: 220000 },
  { day: "14 Aug", silkKurtis: 280000, bespokeSets: 290000 },
  { day: "15 Aug", silkKurtis: 390000, bespokeSets: 340000 },
  { day: "16 Aug", silkKurtis: 482000, bespokeSets: 380000, peak: true, label: "FESTIVE PEAK ₹4,82,000" },
  { day: "17 Aug", silkKurtis: 420000, bespokeSets: 360000 },
  { day: "18 Aug", silkKurtis: 340000, bespokeSets: 320000 },
  { day: "19 Aug", silkKurtis: 460000, bespokeSets: 410000 }
];

export const ATELIER_MONTHLY_TARGET = {
  percentage: 85,
  growthText: "+8.02% from last month",
  highlightTitle: "Festive Goal Progress! 🎉",
  highlightDesc: "Our target reached ₹48.2L; let's reach 100% this week.",
  targetAmount: "₹56,00,000",
  achievedAmount: "₹48,24,600"
};

export const ATELIER_TOP_COLLECTIONS: TopCollectionItem[] = [
  { id: "1", name: "Chanderi Silk Sets", sales: "₹14,20,000", rawSales: 1420000, percentage: 41.7, color: "#7A2832" },
  { id: "2", name: "Anarkali Bespoke", sales: "₹11,50,000", rawSales: 1150000, percentage: 33.8, color: "#C69244" },
  { id: "3", name: "Handblock Co-ords", sales: "₹5,30,000", rawSales: 530000, percentage: 15.6, color: "#E5989B" },
  { id: "4", name: "Unstitched Festive", sales: "₹3,00,000", rawSales: 300000, percentage: 8.9, color: "#F7D1D5" }
];

export const ATELIER_ACTIVE_PATRONS = {
  totalUsers: "2,758",
  growth: "+8.02%",
  demographics: [
    { region: "Delhi NCR", percentage: 36, count: "993 Patrons" },
    { region: "Mumbai & Pune", percentage: 24, count: "662 Patrons" },
    { region: "Bangalore", percentage: 17.5, count: "483 Patrons" },
    { region: "Overseas NRI", percentage: 15, count: "414 Patrons" }
  ]
};

export const ATELIER_CONVERSION_FUNNEL: FunnelStep[] = [
  { stage: "VIEWS", count: "25,000", change: "+9%", percentage: 100 },
  { stage: "BAG", count: "12,000", change: "+6%", percentage: 65 },
  { stage: "FITTING", count: "8,500", change: "+4%", percentage: 48 },
  { stage: "ORDERS", count: "6,200", change: "+7%", percentage: 34 },
  { stage: "DISPATCH", count: "3,000", change: "-5%", percentage: 20 }
];

export const ATELIER_TRAFFIC_SOURCES: TrafficSource[] = [
  { source: "Direct Atelier", percentage: 40, color: "#F28482" },
  { source: "Organic Search", percentage: 30, color: "#F5CAC3" },
  { source: "Instagram & Social", percentage: 15, color: "#B56576" },
  { source: "VIP Concierge", percentage: 10, color: "#84A59D" },
  { source: "Email Campaigns", percentage: 5, color: "#6D2B35" }
];

export const ATELIER_RECENT_ORDERS: RecentOrderItem[] = [
  {
    no: 1,
    orderId: "#NL-8924",
    customer: "Meera Singhania",
    product: "Indigo Pleat Anarkali Set",
    productColorDot: "#2B3A67",
    qty: 2,
    total: "₹14,990",
    rawTotal: 14990,
    status: "Shipped",
    category: "Suits & Sets",
    date: "Today, 10:45 AM"
  },
  {
    no: 2,
    orderId: "#NL-8923",
    customer: "Radhika Oberoi",
    product: "Banarasi Kashi Silk Ensemble",
    productColorDot: "#C69244",
    qty: 1,
    total: "₹22,400",
    rawTotal: 22400,
    status: "Processing",
    category: "Bespoke Silk",
    date: "Today, 09:20 AM"
  },
  {
    no: 3,
    orderId: "#NL-8922",
    customer: "Pooja Venkatesh",
    product: "Noor Chanderi Zari Kurti",
    productColorDot: "#7A2832",
    qty: 1,
    total: "₹8,490",
    rawTotal: 8490,
    status: "Delivered",
    category: "Kurtis",
    date: "Yesterday, 04:30 PM"
  },
  {
    no: 4,
    orderId: "#NL-8921",
    customer: "Tara Deshmukh",
    product: "Gulab Bagh Handblock Co-ord",
    productColorDot: "#E5989B",
    qty: 1,
    total: "₹5,200",
    rawTotal: 5200,
    status: "Pending",
    category: "Co-Ord Sets",
    date: "Yesterday, 02:15 PM"
  },
  {
    no: 5,
    orderId: "#NL-8920",
    customer: "Anita Singh",
    product: "Kashmiri Tilla Embroidered Dupatta",
    productColorDot: "#4A5240",
    qty: 3,
    total: "₹18,500",
    rawTotal: 18500,
    status: "Shipped",
    category: "Dupattas",
    date: "22 Aug, 11:10 AM"
  }
];

export const ATELIER_RECENT_ACTIVITY: RecentActivityItem[] = [
  {
    id: "act-1",
    type: "concierge",
    title: "Maureen Steel / Concierge",
    description: "booked 2 custom zari sets totaling ₹24,800.",
    time: "10:30 AM",
    avatarBg: "#FDF0D5",
    iconColor: "#C69244"
  },
  {
    id: "act-2",
    type: "loom",
    title: "Jaipur Loom #4 completed",
    description: "Chanderi batch clearance pass.",
    time: "9:45 AM",
    avatarBg: "#FDE2E4",
    iconColor: "#7A2832"
  },
  {
    id: "act-3",
    type: "review",
    title: "Vincent Laurent left a 5-star review",
    description: 'for "Banarasi Silk Ensemble".',
    time: "8:20 AM",
    avatarBg: "#FFF1E6",
    iconColor: "#DDA15E"
  },
  {
    id: "act-4",
    type: "inventory",
    title: '"Indigo Pleat Anarkali" fabric',
    description: "inventory is below 15 meters in Delhi Atelier.",
    time: "7:50 AM",
    avatarBg: "#FCEADE",
    iconColor: "#BC6C25"
  },
  {
    id: "act-5",
    type: "courier",
    title: "Courier Express DHL pickup",
    description: "scheduled for 14 bespoke parcels.",
    time: "7:00 AM",
    avatarBg: "#E8F5E9",
    iconColor: "#2E7D32"
  }
];
